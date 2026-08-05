import { Router } from "express";
import { checkGrammar } from "../modules/grammar";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const result = await checkGrammar();

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Grammar check failed.",
    });
  }
});

export default router;