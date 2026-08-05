import { Router } from "express";
import { generateSummary } from "../modules/summary";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const result = await generateSummary();

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Summary generation failed.",
    });
  }
});

export default router;