import { Router } from "express";
import multer from "multer";
import { processPDF } from "../modules/pipeline";
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

    // Process the uploaded PDF
    const pipeline = await processPDF(req.file.buffer);

    // Make sure PDF actually contains text
    if (pipeline.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    // Translate
    const documentText = pipeline.chunker.chunks
      .map((chunk: any) => chunk.text ?? chunk.content ?? "")
      .filter(Boolean)
      .join(" ");

    const result = await translateDocument(language, documentText);

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error: any) {
    console.error(error);

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Translation failed.",
    });
  }
});

export default router;