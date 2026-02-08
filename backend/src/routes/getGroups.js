// backend/src/routes/groups.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";
import { Group } from "../models/Group.js";

const router = express.Router();

//myGroups route to get the groups the current user is in, protected by requireAuth
router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("email name photoUrl");
  if (!user) return res.status(404).json({ error: "User not found" });

  const group = await Group.findById(req.user.userId).select("email name photoUrl");
  if (!group) return res.status(404).json({ error: "User not found in any groups" });

  res.json({
    groups: {
      id: user._id.toString(),
      groups: group.name,
    },
  });
});

export default router;