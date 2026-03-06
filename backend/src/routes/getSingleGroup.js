import { Group } from "../models/Group.js";

// Get a single group
async function getSingleGroup(req, res) {
  try {
    const groupId = req.query.groupId;
    const userId = req.user.userId;

    if (!groupId || !userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const group = await Group.find({
      "_id": groupId
    })
      .populate("members.userId", "name email photoUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Group fetched successfully",
      group
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default getSingleGroup;
