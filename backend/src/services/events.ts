import { pool } from "../db";

export type EventType =
  | "case_created"
  | "document_uploaded"
  | "ai_analysis_completed"
  | "action_plan_generated";

export async function logCaseEvent(
  caseId: number,
  userId: number,
  eventType: EventType,
  description: string,
  metadata?: Record<string, unknown>
) {
  await pool.query(
    `INSERT INTO case_events (case_id, user_id, event_type, description, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    [caseId, userId, eventType, description, metadata ? JSON.stringify(metadata) : null]
  );
}

export async function getCaseHistory(caseId: number, userId: number) {
  const result = await pool.query(
    `SELECT id, event_type, description, metadata, created_at
     FROM case_events
     WHERE case_id = $1 AND user_id = $2
     ORDER BY created_at DESC`,
    [caseId, userId]
  );

  return result.rows;
}
