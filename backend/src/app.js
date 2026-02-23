// backend/src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";

//Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import getGroups from "./routes/getGroups.js";
import createGroups from "./routes/createGroups.js";
import joinGroup from "./routes/joinGroups.js";
import createEvent from "./routes/createEvents.js";
import getEvents from "./routes/getEvents.js";

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({origin: "http://localhost:5173" }));

// Routes
app.get("/health", (_req, res) => {res.json({ ok: true });});
app.use("/auth", authRoutes);
app.use("/me", userRoutes);
app.get("/getGroups", getGroups);
app.use("/api/createGroups", createGroups);
app.use("/api/joinGroups", joinGroup);
app.use("/api/createEvent", createEvent);
app.get("/getEvents", getEvents);

export default app;