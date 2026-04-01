// backend/src/routes/users.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "../../uploads/avatars");
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = /^image\/(jpeg|png|webp|gif)$/;

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = (file.mimetype === "image/jpeg" ? "jpg" : file.mimetype.split("/")[1]) || "jpg";
    const name = `${req.user.userId}-${Date.now()}.${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.test(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
    }
    cb(null, true);
  },
});

function toUserJson(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl || "",
  };
}

const router = express.Router();

//Me route to get current user's info, protected by requireAuth
router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("email name photoUrl");
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: toUserJson(user) });
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

    res.json({ user: toUserJson(user) });
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Upload profile picture (multipart/form-data, field name: avatar)
router.post("/avatar", requireAuth, (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 2MB or smaller"
        : (err.message || "Invalid file");
      return res.status(400).json({ error: message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided. Choose an image (JPEG, PNG, WebP or GIF)." });
    }
    const photoUrl = "/uploads/avatars/" + req.file.filename;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { photoUrl },
      { new: true, runValidators: true }
    ).select("email name photoUrl");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: toUserJson(user) });
  } catch (err) {
    console.error("Avatar upload failed:", err);
    res.status(500).json({ error: err.message || "Failed to upload avatar" });
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