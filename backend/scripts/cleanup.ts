import { pool } from "../src/db";

/**
 * Removes duplicate documents (same case + original_name, keeping newest)
 * and orphaned upload files are left on disk for manual review.
 */
async function cleanup() {
  console.log("Cleaning duplicate documents...");

  const duplicates = await pool.query(`
    DELETE FROM documents d
    USING documents d2
    WHERE d.case_id = d2.case_id
      AND d.original_name = d2.original_name
      AND d.id < d2.id
    RETURNING d.id, d.original_name
  `);

  console.log(`Removed ${duplicates.rowCount} duplicate document(s).`);

  const emptyCases = await pool.query(`
    DELETE FROM cases
    WHERE title = '' OR title IS NULL
    RETURNING id
  `);

  console.log(`Removed ${emptyCases.rowCount} empty case(s).`);

  console.log("Cleanup complete.");
  await pool.end();
}

cleanup().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
