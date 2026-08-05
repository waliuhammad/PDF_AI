import fs from "fs/promises";
import { extractTextWithOCR } from "../modules/ocr";

import { Router } from "express";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type."));
    }
  },
});
router.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const result = await extractTextWithOCR(req.file.path);

    // Delete temporary uploaded file
    await fs.unlink(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Text extracted successfully.",
      result,
    });

  } catch (error: any) {
    console.error(error);

    if (error.message === "Unsupported file type.") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 20 MB.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "OCR failed.",
    });
  }
});

export default router;