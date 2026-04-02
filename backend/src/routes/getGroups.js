import { Group } from "../models/Group.js";

// Get all groups for the user
async function getGroups(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groups = await Group.find({
      "members.userId": userId
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Groups fetched successfully",
      count: groups.length,
      groups
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export default getGroups;
