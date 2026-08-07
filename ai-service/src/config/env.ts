import dotenv from "dotenv";

dotenv.config();

export const env = {
  // 8001 because that is where the main app looks when AI_SERVICE_URL is
  // unset. The old default of 8000 meant a fresh checkout started this service
  // on a port nothing was calling, and all five AI tools failed with a bare
  // connection error. It also collided with Chroma's own default of 8000.
  PORT: process.env.PORT || "8001",

  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",

  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.6-flash",

  CHROMA_HOST: process.env.CHROMA_HOST || "localhost",
  CHROMA_PORT: Number(process.env.CHROMA_PORT || "8000"),
};


if (!env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is missing in .env");
}