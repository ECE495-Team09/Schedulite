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
import getSingleGroup from "./routes/getSingleGroup.js";
import createGroups from "./routes/createGroups.js";
import joinGroup from "./routes/joinGroups.js";
import createEvent from "./routes/createEvents.js";
import getEvents from "./routes/getEvents.js";
import groupMembers from "./routes/groupMembers.js";
import manageEvents from "./routes/manageEvents.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { authRateLimiter, createEventRateLimiter } from "./middleware/rateLimit.js";

const app = express();

// Body size limit (e.g. idToken, event/group payloads; reject oversized to avoid abuse)
const BODY_LIMIT = process.env.BODY_LIMIT || "100kb";

// Middleware
app.use(express.json({ limit: BODY_LIMIT }));
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));

// Routes
app.get("/health", (_req, res) => res.json({ ok: true, version: PRODUCT_VERSION }));
app.use("/auth", authRateLimiter, authRoutes);
app.use("/me", userRoutes);
app.get("/api/getGroups", requireAuth, getGroups);
app.get("/api/getSingleGroup", requireAuth, getSingleGroup);
app.use("/api/createGroups", createGroups);
app.use("/api/joinGroups", joinGroup);
app.use("/api/createEvent", requireAuth, createEventRateLimiter, createEvent);
app.get("/getEvents", requireAuth, getEvents);
app.use("/api/groups", requireAuth, groupMembers);
app.use("/api/events", requireAuth, manageEvents);

// Handle oversized request bodies (express.json rejects with entity.too.large)
app.use((err, _req, res, next) => {
  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      error: "Payload too large",
      message: `Request body must not exceed ${BODY_LIMIT}.`,
    });
  }
  next(err);
});

export default app;