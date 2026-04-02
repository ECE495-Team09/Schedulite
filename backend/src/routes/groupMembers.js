import express from "express";
import mongoose from "mongoose";
import { Group } from "../models/Group.js";
import { Event } from "../models/Event.js";

const router = express.Router();

// ── DELETE /api/groups/:groupId ── disband group (owner only) ───────────────
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const requesterId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: "Invalid group ID." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found." });

    const requesterMember = group.members.find((m) => m.userId.toString() === requesterId.toString());
    if (!requesterMember) return res.status(403).json({ error: "You are not a member of this group." });
    if (requesterMember.role !== "OWNER") {
      return res.status(403).json({ error: "Only the group owner can disband the group." });
    }

    await Event.deleteMany({ groupId });
    await Group.findByIdAndDelete(groupId);

    return res.json({ message: "Group disbanded" });
  } catch (err) {
    console.error("Disband group error:", err);
    return res.status(500).json({ error: "Server error." });
  }
});

// ── PUT /api/groups/:groupId/members/:targetUserId ── update role ──────────
router.put("/:groupId/members/:targetUserId", async (req, res) => {
  try {
    const { groupId, targetUserId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.userId;

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ error: "Role must be ADMIN or MEMBER." });
    }

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid ID." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found." });

    const requesterMember = group.members.find((m) => m.userId.toString() === requesterId.toString());
    if (!requesterMember) return res.status(403).json({ error: "You are not a member of this group." });

    const requesterRole = requesterMember.role;
    const isOwner = requesterRole === "OWNER";
    const isAdmin = requesterRole === "OWNER" || requesterRole === "ADMIN";

    const targetMember = group.members.find((m) => m.userId.toString() === targetUserId.toString());
    if (!targetMember) return res.status(404).json({ error: "Target member not found." });

    // Cannot change the OWNER's role
    if (targetMember.role === "OWNER") {
      return res.status(403).json({ error: "Cannot change the owner's role." });
    }

    // Cannot change your own role
    if (targetUserId.toString() === requesterId.toString()) {
      return res.status(400).json({ error: "Cannot change your own role." });
    }

    // Promoting MEMBER → ADMIN: owner or admin can do this
    if (role === "ADMIN" && !isAdmin) {
      return res.status(403).json({ error: "Only admins and owners can promote members." });
    }

    // Demoting ADMIN → MEMBER: only owner can do this
    if (role === "MEMBER" && targetMember.role === "ADMIN" && !isOwner) {
      return res.status(403).json({ error: "Only the owner can demote admins." });
    }

    targetMember.role = role;
    await group.save();

    const updated = await Group.findById(groupId).populate("members.userId", "name email");
    res.json({ group: updated });
  } catch (err) {
    console.error("Update member role error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// ── DELETE /api/groups/:groupId/members/:targetUserId ── kick member ───────
router.delete("/:groupId/members/:targetUserId", async (req, res) => {
  try {
    const { groupId, targetUserId } = req.params;
    const requesterId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: "Invalid ID." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found." });

    const requesterMember = group.members.find((m) => m.userId.toString() === requesterId.toString());
    if (!requesterMember) return res.status(403).json({ error: "You are not a member of this group." });

    const isAdmin = requesterMember.role === "OWNER" || requesterMember.role === "ADMIN";
    if (!isAdmin) return res.status(403).json({ error: "Only admins and owners can kick members." });

    const targetMember = group.members.find((m) => m.userId.toString() === targetUserId.toString());
    if (!targetMember) return res.status(404).json({ error: "Target member not found." });

    // Cannot kick the owner
    if (targetMember.role === "OWNER") {
      return res.status(403).json({ error: "Cannot kick the owner." });
    }

    // Admins can only kick regular members, not other admins (only owner can kick admins)
    if (targetMember.role === "ADMIN" && requesterMember.role !== "OWNER") {
      return res.status(403).json({ error: "Only the owner can kick admins." });
    }

    group.members = group.members.filter((m) => m.userId.toString() !== targetUserId.toString());
    await group.save();

    const updated = await Group.findById(groupId).populate("members.userId", "name email");
    res.json({ group: updated });
  } catch (err) {
    console.error("Kick member error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

export default router;
