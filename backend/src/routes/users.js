// backend/src/routes/users.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

const router = express.Router();

//Me route to get current user's info, protected by requireAuth
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("email name photoUrl");
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      photoUrl: user.photoUrl,
    },
  });
});

// Update current user's info (only the user themselves)
router.put("/me", requireAuth, async (req, res) => {
  try {
    const allowed = ["email", "name", "photoUrl"];
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
    ).select("email name photoUrl");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete current user's account (self-delete)
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