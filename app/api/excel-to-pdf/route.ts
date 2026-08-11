import { NextRequest, NextResponse } from "next/server";
import { readFormData } from "@/lib/api";
import { requireUsageAllowance } from "@/lib/metered";
import * as XLSX from "xlsx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

// A workbook can hold many sheets and thousands of rows.
export const maxDuration = 60;

/**
 * Renders a spreadsheet (.xlsx, .xls or .csv) as a PDF of tables — one
 * section per sheet, paginated onto landscape A4.
 *
 * SheetJS reads the workbook and pdf-lib draws it, so the document never
 * leaves this server. The layout is deliberately simple: a header band with
 * the sheet name, zebra-striped rows, and column widths shared out from the
 * longest cell in each column. Formatting, formulas and charts don't
 * survive — cell *values* do, which is what a PDF of a spreadsheet is for.
 */

// Landscape A4, in PDF points.
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 36;

const FONT_SIZE = 8;
const HEADER_FONT_SIZE = 11;
const ROW_HEIGHT = 14;
const CELL_PADDING = 3;

export async function POST(req: NextRequest) {
    try {
        // Every tool counts against the user's daily allowance (2/20/50 by
        // plan, from Remote Config) and therefore requires sign-in.
        const refusal = await requireUsageAllowance(req);
        if (refusal) return refusal;

        const formData = await readFormData(req);
        if (!formData) {
            return NextResponse.json({ error: "No file provided." }, { status: 400 });
        }

        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json({ error: "No spreadsheet uploaded." }, { status: 400 });
        }

        const name = file.name.toLowerCase();
        if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
            return NextResponse.json(
                { error: "Only .xlsx, .xls and .csv files are supported." },
                { status: 415 }
            );
        }

        let workbook: XLSX.WorkBook;
        try {
            workbook = XLSX.read(Buffer.from(await file.arrayBuffer()), { type: "buffer" });
        } catch {
            return NextResponse.json(
                { error: "That file could not be read as a spreadsheet." },
                { status: 400 }
            );
        }

        if (workbook.SheetNames.length === 0) {
            return NextResponse.json({ error: "The workbook has no sheets." }, { status: 400 });
        }

        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const usableWidth = PAGE_WIDTH - MARGIN * 2;

        /** pdf-lib's WinAnsi encoding rejects some characters (emoji, many
         *  scripts); replace what can't be drawn rather than crashing. */
        const drawable = (text: string) =>
            text.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?");

        const truncate = (text: string, maxWidth: number, f = font, size = FONT_SIZE) => {
            let t = text;
            while (t.length > 1 && f.widthOfTextAtSize(t, size) > maxWidth) {
                t = t.slice(0, -2) + "…";
            }
            return f.widthOfTextAtSize(t, size) <= maxWidth ? t : "";
        };

        let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        let y = PAGE_HEIGHT - MARGIN;

        const newPage = () => {
            page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            y = PAGE_HEIGHT - MARGIN;
        };

        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];

            // header:1 gives raw rows; defval keeps empty cells as "" so
            // columns stay aligned. raw:false renders values as displayed.
            const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
                header: 1,
                defval: "",
                raw: false,
            }) as unknown as string[][];

            // Sheet title band (also on a fresh page if this one is nearly full).
            if (y - (HEADER_FONT_SIZE + 10 + ROW_HEIGHT * 2) < MARGIN) newPage();

            page.drawText(drawable(sheetName), {
                x: MARGIN,
                y: y - HEADER_FONT_SIZE,
                size: HEADER_FONT_SIZE,
                font: bold,
                color: rgb(0.13, 0.14, 0.19),
            });
            y -= HEADER_FONT_SIZE + 8;

            if (rows.length === 0) {
                page.drawText("(empty sheet)", {
                    x: MARGIN,
                    y: y - FONT_SIZE,
                    size: FONT_SIZE,
                    font,
                    color: rgb(0.5, 0.5, 0.5),
                });
                y -= ROW_HEIGHT * 2;
                continue;
            }

            const columnCount = Math.max(...rows.map((r) => r.length));

            // Column widths from the longest cell in each column, then scaled
            // to share the page width. A floor keeps narrow columns readable.
            const naturalWidths: number[] = [];
            for (let c = 0; c < columnCount; c++) {
                let widest = 24;
                for (const row of rows) {
                    const cell = String(row[c] ?? "");
                    const w = font.widthOfTextAtSize(drawable(cell), FONT_SIZE) + CELL_PADDING * 2;
                    if (w > widest) widest = Math.min(w, 200);
                }
                naturalWidths.push(widest);
            }
            const totalNatural = naturalWidths.reduce((a, b) => a + b, 0);
            const scale = totalNatural > usableWidth ? usableWidth / totalNatural : 1;
            const widths = naturalWidths.map((w) => w * scale);

            // Rows.
            for (let r = 0; r < rows.length; r++) {
                if (y - ROW_HEIGHT < MARGIN) newPage();

                // Zebra stripe and a heavier first row, which is usually a header.
                if (r === 0 || r % 2 === 1) {
                    page.drawRectangle({
                        x: MARGIN,
                        y: y - ROW_HEIGHT + 2,
                        width: usableWidth * (scale < 1 ? 1 : totalNatural / usableWidth > 1 ? 1 : totalNatural / usableWidth),
                        height: ROW_HEIGHT,
                        color: r === 0 ? rgb(0.92, 0.92, 0.95) : rgb(0.97, 0.97, 0.98),
                    });
                }

                let x = MARGIN;
                for (let c = 0; c < columnCount; c++) {
                    const cell = drawable(String(rows[r][c] ?? ""));
                    if (cell) {
                        const cellFont = r === 0 ? bold : font;
                        page.drawText(truncate(cell, widths[c] - CELL_PADDING * 2, cellFont), {
                            x: x + CELL_PADDING,
                            y: y - FONT_SIZE - 2,
                            size: FONT_SIZE,
                            font: cellFont,
                            color: rgb(0.15, 0.15, 0.2),
                        });
                    }
                    x += widths[c];
                }
                y -= ROW_HEIGHT;
            }

            // Space before the next sheet's section.
            y -= ROW_HEIGHT;
        }

        const bytes = await pdfDoc.save();
        const base = file.name.replace(/\.[^/.]+$/, "") || "spreadsheet";

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${base}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Excel to PDF error:", error);
        return NextResponse.json(
            { error: "Failed to convert the spreadsheet." },
            { status: 500 }
        );
    }
}