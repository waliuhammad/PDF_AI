import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import PDFParser from "pdf2json";
import { errorMessage } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file uploaded." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const tableRows = await new Promise<string[][]>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);

      pdfParser.on("pdfParser_dataError", (err) => {
        // pdf2json types this as { parserError: Error } | Error, so it is one or
        // the other rather than always the wrapper.
        reject(err instanceof Error ? err : new Error(String(err.parserError)));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          const rowsMap: { [y: number]: { x: number; text: string }[] } = {};

          if (pdfData && pdfData.Pages) {
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textBlock of page.Texts) {
                  const x = textBlock.x;
                  const y = textBlock.y;

                  let blockText = "";
                  if (textBlock.R) {
                    for (const run of textBlock.R) {
                      if (run.T) {
                        try {
                          blockText += decodeURIComponent(run.T);
                        } catch {
                          blockText += run.T;
                        }
                      }
                    }
                  }

                  const cleanedText = blockText.trim();
                  
                  if (!cleanedText || cleanedText.startsWith("Sheet:")) {
                    continue;
                  }

                  // Use a coarser rounding factor (0.4 units) to force sub-pixel text fragments into the exact same row line
                  const snappedY = Math.round(y * 2.5) / 2.5;

                  if (!rowsMap[snappedY]) {
                    rowsMap[snappedY] = [];
                  }
                  rowsMap[snappedY].push({ x, text: cleanedText });
                }
              }
            }
          }

          const sortedYKeys = Object.keys(rowsMap)
            .map(Number)
            .sort((a, b) => a - b);

          const finalRows: string[][] = [];
          let headerProcessed = false;
          let expectedColumnCount = 17; // Based on X1 through y headers

          for (const yKey of sortedYKeys) {
            const rowItems = rowsMap[yKey];
            
            // Sort column elements left to right based on X coordinates
            rowItems.sort((a, b) => a.x - b.x);

            // Deduplicate items closely stacked at the exact same horizontal position
            const uniqueRowItems: { x: number; text: string }[] = [];
            for (const item of rowItems) {
              const last = uniqueRowItems[uniqueRowItems.length - 1];
              if (!last || Math.abs(last.x - item.x) > 0.6 || last.text !== item.text) {
                uniqueRowItems.push(item);
              }
            }

            let rowTexts = uniqueRowItems.map((item) => item.text);
            
            if (rowTexts.length > 0) {
              const isHeader = rowTexts.includes("X1") && rowTexts.includes("y");

              if (isHeader) {
                if (!headerProcessed) {
                  headerProcessed = true;
                  expectedColumnCount = rowTexts.length;
                  finalRows.push(rowTexts);
                }
                continue;
              }

              // Trim or pad data rows to match header column width for perfect alignment
              if (rowTexts.length > expectedColumnCount) {
                rowTexts = rowTexts.slice(0, expectedColumnCount);
              }

              finalRows.push(rowTexts);
            }
          }

          resolve(
            finalRows.length > 0 ? finalRows : [["No structured rows found"]]
          );
        } catch (parseErr) {
          reject(new Error("Failed to map coordinates: " + errorMessage(parseErr, "unknown error")));
        }
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({
      text: tableRows.map((r) => r.join(" ")).join("\n"),
      rows: tableRows,
    });
  } catch (err) {
    console.error("PDF Parsing Error:", err);
    return NextResponse.json(
      { error: "Unable to parse PDF document." },
      { status: 500 }
    );
  }
}