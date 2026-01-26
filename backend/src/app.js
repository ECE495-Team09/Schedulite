// backend/src/app.js
import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: "http://localhost:5173" }));

// Routes
app.get("/health", (_req, res) => {res.json({ ok: true });});

export default app;
