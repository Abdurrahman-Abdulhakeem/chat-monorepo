import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { env } from "config/environment.js";

const router = express.Router();

// store files in ./uploads folder
const upload = multer({ dest: "uploads/" });

// POST /upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // rename file to unique name
    const ext = path.extname(req.file.originalname);
    const newName = `${uuid()}${ext}`;
    const newPath = path.join("uploads", newName);

    fs.renameSync(req.file.path, newPath);

    // serve from static /uploads
    const fileUrl = `${env.BASE_URL}/uploads/${newName}`;

    res.json({ url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
