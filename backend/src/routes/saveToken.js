import { User } from "../models/User.js";

// API to register/update device token
async function saveToken(req, res) {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ error: "Missing userId or token" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { userId },
      {
        $addToSet: { tokens: token }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

export default saveToken;