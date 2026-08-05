import { Router } from "express";
import { translateDocument } from "../modules/translate";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        message: "Language is required.",
      });
    }

    const result = await translateDocument(language);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Translation failed.",
    });
  }
});

export default router;