import pdfParse from "pdf-parse";
import { ParseResult } from "./parser.types";

export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  try {
    const data = await pdfParse(buffer);

    return {
      success: true,
      text: data.text,
      totalPages: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: data.info?.CreationDate,
        modificationDate: data.info?.ModDate,
      },
    };
  } catch (error) {
    throw new Error("Failed to parse PDF.");
  }
}