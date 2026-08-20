import { extractText } from "../processors/documentProcessor";
import express from "express";
import axios from "axios";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../db";
import { config } from "../config";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { logCaseEvent } from "../services/events";

const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.upload.allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type. Allowed: ${config.upload.allowedExtensions.join(", ")}`
        )
      );
    }
  },
});

router.post(
  "/upload",
  authenticateToken,
  (req, res, next) => {
    upload.single("document")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: (err as Error).message });
      }
      next();
    });
  },
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No document uploaded" });
      }

      const { caseId } = req.body;

      if (!caseId) {
        return res.status(400).json({ message: "caseId is required" });
      }

      const userId = req.user!.userId;

      const caseResult = await pool.query(
        "SELECT id, title FROM cases WHERE id = $1 AND user_id = $2",
        [caseId, userId]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({ message: "Case not found" });
      }

      const extractedText = await extractText(req.file.path);

      let aiAnalysis: string | null = null;
      try {
        const aiResponse = await axios.post(`${config.aiServiceUrl}/analyze`, {
          text: extractedText,
        });
        aiAnalysis = aiResponse.data.analysis;
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        aiAnalysis = "AI analysis unavailable. Document text was saved successfully.";
      }

      const result = await pool.query(
        `INSERT INTO documents
         (case_id, user_id, original_name, stored_name, file_path, file_size, extracted_text, ai_analysis)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          caseId,
          userId,
          req.file.originalname,
          req.file.filename,
          req.file.path,
          req.file.size,
          extractedText,
          aiAnalysis,
        ]
      );

      const document = result.rows[0];

      await logCaseEvent(
        Number(caseId),
        userId,
        "document_uploaded",
        `Document "${req.file.originalname}" was uploaded`,
        { documentId: document.id, fileSize: req.file.size }
      );

      if (aiAnalysis) {
        await logCaseEvent(
          Number(caseId),
          userId,
          "ai_analysis_completed",
          `AI analysis completed for "${req.file.originalname}"`,
          { documentId: document.id }
        );
      }

      res.status(201).json({
        message: "Document uploaded successfully",
        document,
        aiAnalysis,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Document upload failed" });
    }
  }
);

router.get(
  "/case/:caseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { caseId } = req.params;
      const userId = req.user!.userId;

      const result = await pool.query(
        `SELECT id, original_name, file_size, created_at, ai_analysis
         FROM documents
         WHERE case_id = $1 AND user_id = $2
         ORDER BY created_at DESC`,
        [caseId, userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  }
);

export default router;
