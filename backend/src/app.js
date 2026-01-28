// backend/src/app.js
import express from "express";
import cors from "cors";

//Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: "http://localhost:5173" }));

// Routes
app.get("/health", (_req, res) => {res.json({ ok: true });});
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

export default app;