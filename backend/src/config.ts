import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "proofbridge-secret-key",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  db: {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "proofbridge",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT) || 5432,
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedExtensions: [".txt", ".pdf", ".docx"],
  },
};
