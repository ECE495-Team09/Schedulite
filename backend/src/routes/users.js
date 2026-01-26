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

export default router;
