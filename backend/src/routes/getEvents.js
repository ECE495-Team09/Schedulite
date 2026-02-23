import { Group } from "../models/Group.js";
import { requireAuth } from "../middleware/requireAuth.js";

//Get all events from groups the user belongs to
router.get("/my-groups", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groups = await Group.find({
      "members.userId": userId
    }).select("_id");

    const groupIds = groups.map(group => group._id);

    if (groupIds.length === 0) {
      return res.status(200).json({
        message: "No groups found",
        count: 0,
        events: []
      });
    }

    const events = await Event.find({
      groupId: { $in: groupIds }
    })
      .sort({ startAt: 1 })
      .populate("groupId", "name")
      .populate("createdBy", "name email photoUrl");

    res.status(200).json({
      message: "Events fetched successfully",
      count: events.length,
      events
    });

  } catch (error) {
    console.error("Get group events error:", error);
    res.status(500).json({ message: "Server error" });
  }
});