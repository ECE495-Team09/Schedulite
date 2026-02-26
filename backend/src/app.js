// backend/src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Product version (single source of truth: repo root version.json)
const __dirname = dirname(fileURLToPath(import.meta.url));
let PRODUCT_VERSION = "0.0.0";
try {
  const versionPath = join(__dirname, "../../version.json");
  PRODUCT_VERSION = JSON.parse(readFileSync(versionPath, "utf8")).version;
} catch (_) {}

//Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import getGroups from "./routes/getGroups.js";
import createGroups from "./routes/createGroups.js";
import joinGroup from "./routes/joinGroups.js";
import createEvent from "./routes/createEvents.js";
import getEvents from "./routes/getEvents.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));

// Routes
app.get("/health", (_req, res) => res.json({ ok: true, version: PRODUCT_VERSION }));
app.use("/auth", authRoutes);
app.use("/me", userRoutes);
app.get("/getGroups", requireAuth, getGroups);
app.use("/api/createGroups", createGroups);
app.use("/api/joinGroups", joinGroup);
app.use("/api/createEvent", createEvent);
app.get("/getEvents", requireAuth, getEvents);

export default app;