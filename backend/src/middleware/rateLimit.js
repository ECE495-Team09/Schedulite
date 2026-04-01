// backend/src/middleware/rateLimit.js
import { rateLimit } from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Strict rate limit for auth endpoints (login/sign-in).
 * Limits by IP to prevent brute force and token abuse.
 */
export const authRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 5,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: "draft-6",
  legacyHeaders: false,
});

/**
 * Strict rate limit for event creation.
 * Limits by authenticated user ID when available, otherwise by IP.
 */
export const createEventRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  message: {
    error: "Too many events created. Please try again later.",
  },
  standardHeaders: "draft-6",
  legacyHeaders: false,
  keyGenerator: (req) => {
    // After requireAuth, req.user is set
    if (req.user?.userId) return `user:${req.user.userId}`;
    return req.ip ?? "unknown";
  },
});
