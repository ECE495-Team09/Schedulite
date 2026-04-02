import mongoose from "mongoose";
import { Group } from "../models/Group.js";

// Get a single group (only if the user is a member — query scoping)
async function getSingleGroup(req, res) {
  try {
    const groupId = req.query.groupId;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const group = await Group.findOne({
      _id: groupId,
      "members.userId": userId,
    })
      .populate("members.userId", "name email")
      .sort({ createdAt: -1 });

    if (!group) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    res.status(200).json({
      message: "Group fetched successfully",
      group,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default getSingleGroup;
