import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import trashRoutes from "./routes/trashRoutes.js";
import archiveRoutes from "./routes/archiveRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "TeamFlow API",
    status: "ok",
    message: "Frontend should call the backend directly through the API URL.",
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/archive", archiveRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
