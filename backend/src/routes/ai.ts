import { pool } from "../db";
import { config } from "../config";
import express from "express";
import axios from "axios";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.post("/chat", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { caseId, message, context } = req.body;
    const userId = req.user!.userId;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (caseId) {
      const caseResult = await pool.query(
        "SELECT id FROM cases WHERE id = $1 AND user_id = $2",
        [caseId, userId]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({ message: "Case not found" });
      }
    }

    const aiResponse = await axios.post(`${config.aiServiceUrl}/chat`, {
      message: message.trim(),
      context: context || {},
    });

    res.json({ reply: aiResponse.data.reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI chat failed" });
  }
});

export default router;
