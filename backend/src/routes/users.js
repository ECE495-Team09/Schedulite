// backend/src/routes/users.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

function toUserJson(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
}

const router = express.Router();

/** Register Expo / FCM device token for push notifications */
router.post("/push-token", requireAuth, async (req, res) => {
  try {
    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== "string" || pushToken.length > 4096) {
      return res.status(400).json({ error: "pushToken is required" });
    }
    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { tokens: pushToken.trim() },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("push-token register failed:", err);
    res.status(500).json({ error: "Failed to register push token" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("email name");
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: toUserJson(user) });
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    const allowed = ["email", "name"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select("email name");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: toUserJson(user) });
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete user failed:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
