import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRoutes } from "./presentation/routes/authRoutes";
import { bookRoutes } from "./presentation/routes/bookRoutes";
import { loanRoutes } from "./presentation/routes/loanRoutes";
import { logRoutes } from "./presentation/routes/logRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/logs", logRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
