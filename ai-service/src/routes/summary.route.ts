import { Router } from "express";
import multer from "multer";
import { extractText } from "../modules/pipeline";
import { generateSummary } from "../modules/summary";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded.",
      });
    }

    // Read the uploaded PDF
    const extraction = await extractText(req.file.buffer);

    if (extraction.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    // Summarize the whole document
    const result = await generateSummary(extraction.cleaner.cleanedText);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Summary generation failed.",
    });
  }
});

export default router;