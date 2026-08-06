import { Router } from "express";
import multer from "multer";
import { extractText } from "../modules/pipeline";
import { translateDocument } from "../modules/translate";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const language = req.body.language;

    // Check PDF
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded.",
      });
    }

    // Check language
    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required.",
      });
    }

    // Read the uploaded PDF
    const extraction = await extractText(req.file.buffer);

    // Make sure PDF actually contains text
    if (extraction.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    // Translate the whole document
    const result = await translateDocument(
      language,
      extraction.cleaner.cleanedText
    );

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Translation failed.",
    });
  }
});

export default router;