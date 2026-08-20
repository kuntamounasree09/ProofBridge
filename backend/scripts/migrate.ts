import fs from "fs";
import path from "path";
import { pool } from "../src/db";

async function migrate() {
  const migrationsDir = path.join(__dirname, "../migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  console.log(`Running ${files.length} migration(s)...`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`  → ${file}`);
    await pool.query(sql);
  }

  console.log("Migrations complete.");
  await pool.end();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
