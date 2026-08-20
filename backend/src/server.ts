import documentRoutes from "./routes/documents";
import actionPlanRoutes from "./routes/actionPlans";
import aiRoutes from "./routes/ai";
import caseRoutes from "./routes/cases";
import authRouter from "./routes/auth";
import { pool } from "./db";
import { config } from "./config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ProofBridge Backend",
  });
});

pool
  .query("SELECT NOW()")
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch((error) => console.error("PostgreSQL connection failed:", error));

app.use("/api/auth", authRouter);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/action-plans", actionPlanRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`ProofBridge backend running on http://localhost:${PORT}`);
});

process.stdin.resume();
