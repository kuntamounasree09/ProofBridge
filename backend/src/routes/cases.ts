import express from "express";
import { pool } from "../db";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { logCaseEvent, getCaseHistory } from "../services/events";

const router = express.Router();

async function verifyCaseOwnership(caseId: string, userId: number) {
  const result = await pool.query(
    "SELECT id FROM cases WHERE id = $1 AND user_id = $2",
    [caseId, userId]
  );
  return result.rows.length > 0;
}

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Case title is required",
      });
    }

    const userId = req.user!.userId;

    const result = await pool.query(
      `INSERT INTO cases (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), description?.trim() || null, userId]
    );

    const newCase = result.rows[0];

    await logCaseEvent(
      newCase.id,
      userId,
      "case_created",
      `Case "${newCase.title}" was created`
    );

    res.status(201).json(newCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create case",
    });
  }
});

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const result = await pool.query(
      `SELECT c.*,
              COUNT(d.id)::int AS document_count
       FROM cases c
       LEFT JOIN documents d ON d.case_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch cases",
    });
  }
});

router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const caseId = req.params.id;

    const result = await pool.query(
      `SELECT c.*,
              COUNT(d.id)::int AS document_count
       FROM cases c
       LEFT JOIN documents d ON d.case_id = c.id
       WHERE c.id = $1 AND c.user_id = $2
       GROUP BY c.id`,
      [caseId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch case details",
    });
  }
});

router.get("/:id/history", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const caseId = req.params.id;

    const owned = await verifyCaseOwnership(caseId, userId);
    if (!owned) {
      return res.status(404).json({ message: "Case not found" });
    }

    const history = await getCaseHistory(Number(caseId), userId);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch case history" });
  }
});

export default router;
