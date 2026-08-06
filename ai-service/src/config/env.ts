import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "8000",

  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",

  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.6-flash",

  CHROMA_HOST: process.env.CHROMA_HOST || "localhost",
  CHROMA_PORT: Number(process.env.CHROMA_PORT || "8000"),
};

if (!env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is missing in .env");
}