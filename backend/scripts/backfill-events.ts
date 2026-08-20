import { pool } from "../src/db";

/**
 * Backfills case_events for cases and documents created before the history feature.
 */
async function backfill() {
  console.log("Backfilling case events...");

  const cases = await pool.query(`
    INSERT INTO case_events (case_id, user_id, event_type, description, created_at)
    SELECT c.id, c.user_id, 'case_created', 'Case "' || c.title || '" was created', c.created_at
    FROM cases c
    WHERE NOT EXISTS (
      SELECT 1 FROM case_events e
      WHERE e.case_id = c.id AND e.event_type = 'case_created'
    )
    RETURNING id
  `);

  console.log(`  Created ${cases.rowCount} case_created event(s).`);

  const docs = await pool.query(`
    INSERT INTO case_events (case_id, user_id, event_type, description, metadata, created_at)
    SELECT d.case_id, d.user_id, 'document_uploaded',
           'Document "' || d.original_name || '" was uploaded',
           jsonb_build_object('documentId', d.id, 'fileSize', d.file_size),
           d.created_at
    FROM documents d
    WHERE NOT EXISTS (
      SELECT 1 FROM case_events e
      WHERE e.case_id = d.case_id
        AND e.event_type = 'document_uploaded'
        AND e.metadata->>'documentId' = d.id::text
    )
    RETURNING id
  `);

  console.log(`  Created ${docs.rowCount} document_uploaded event(s).`);

  const analyses = await pool.query(`
    INSERT INTO case_events (case_id, user_id, event_type, description, metadata, created_at)
    SELECT d.case_id, d.user_id, 'ai_analysis_completed',
           'AI analysis completed for "' || d.original_name || '"',
           jsonb_build_object('documentId', d.id),
           d.created_at + interval '1 second'
    FROM documents d
    WHERE d.ai_analysis IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM case_events e
        WHERE e.case_id = d.case_id
          AND e.event_type = 'ai_analysis_completed'
          AND e.metadata->>'documentId' = d.id::text
      )
    RETURNING id
  `);

  console.log(`  Created ${analyses.rowCount} ai_analysis_completed event(s).`);
  console.log("Backfill complete.");
  await pool.end();
}

backfill().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
