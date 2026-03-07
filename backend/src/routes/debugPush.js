import express from "express";
import { Expo } from "expo-server-sdk";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

const router = express.Router();
const expo = new Expo();

// Simple debug endpoint to send a push notification to the authenticated user.
router.post("/debug/push", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("expoPushToken");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const expoPushToken = user.expoPushToken;
    if (!expoPushToken) {
      return res.status(400).json({ error: "No expoPushToken registered for user" });
    }

    if (!Expo.isExpoPushToken(expoPushToken)) {
      return res.status(400).json({ error: "Invalid Expo push token" });
    }

    const messages = [
      {
        to: expoPushToken,
        sound: "default",
        title: "New RSVP Request",
        body: "You have a new event to respond to.",
        data: { type: "RSVP_DEMO" },
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Debug push failed:", err);
    return res.status(500).json({ error: "Failed to send debug push notification" });
  }
});

export default router;

