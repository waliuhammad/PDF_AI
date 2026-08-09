import { Router } from "express";
import multer from "multer";
import { extractText } from "../modules/pipeline";

const router = Router();

// Store uploaded file in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Parser route is working!",
  });
});

router.post("/parse", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF file uploaded.",
      });
    }

    // Parse only: text extraction, cleaning and chunking. The full
    // processPDF pipeline also embeds and stores into a chat session's
    // collection — which a parse test has no reason to touch.
    const result = await extractText(req.file.buffer);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to process PDF.",
    });
  }
});

export default router;