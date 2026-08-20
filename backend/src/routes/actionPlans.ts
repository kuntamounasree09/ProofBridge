import express from "express";
import axios from "axios";
import { pool } from "../db";
import { config } from "../config";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { logCaseEvent } from "../services/events";

const router = express.Router();

router.get(
  "/case/:caseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { caseId } = req.params;
      const userId = req.user!.userId;

      const result = await pool.query(
        `SELECT id, content, created_at
         FROM action_plans
         WHERE case_id = $1 AND user_id = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [caseId, userId]
      );

      if (result.rows.length === 0) {
        return res.json({ actionPlan: null });
      }

      res.json({ actionPlan: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch action plan" });
    }
  }
);

router.post(
  "/case/:caseId/generate",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { caseId } = req.params;
      const userId = req.user!.userId;

      const caseResult = await pool.query(
        "SELECT id, title FROM cases WHERE id = $1 AND user_id = $2",
        [caseId, userId]
      );

      if (caseResult.rows.length === 0) {
        return res.status(404).json({ message: "Case not found" });
      }

      const docsResult = await pool.query(
        `SELECT ai_analysis FROM documents
         WHERE case_id = $1 AND user_id = $2 AND ai_analysis IS NOT NULL
         ORDER BY created_at DESC`,
        [caseId, userId]
      );

      if (docsResult.rows.length === 0) {
        return res.status(400).json({
          message: "Upload at least one document with AI analysis before generating an action plan",
        });
      }

      const combinedAnalysis = docsResult.rows
        .map((doc, index) => `Document ${index + 1}:\n${doc.ai_analysis}`)
        .join("\n\n---\n\n");

      const aiResponse = await axios.post(`${config.aiServiceUrl}/action-plan`, {
        analysis: combinedAnalysis,
      });

      const content = aiResponse.data.actionPlan;

      const result = await pool.query(
        `INSERT INTO action_plans (case_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [caseId, userId, content]
      );

      await logCaseEvent(
        Number(caseId),
        userId,
        "action_plan_generated",
        `Action plan generated for case "${caseResult.rows[0].title}"`
      );

      res.status(201).json({
        message: "Action plan generated successfully",
        actionPlan: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate action plan" });
    }
  }
);

export default router;
