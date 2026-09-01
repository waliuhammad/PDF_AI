import "server-only";
import { NextResponse } from "next/server";

/**
 * The one place the website talks to the AI service.
 *
 * All four AI routes — summary, grammar, translate and OCR — forwarded the
 * upload themselves with the same eight lines, ending in a bare `catch` that
 * answered "Unable to connect to AI Service." for every possible failure. That
 * message was wrong far more often than it was right, and it actively hid a
 * live bug: OCR was reaching the service perfectly well and getting back an
 * HTML error page, which `response.json()` then threw on. The thrown parse
 * error looked exactly like a dead socket, so the logs said the service was
 * unreachable while the other three routes were talking to it happily.
 *
 * Reading the reply as text first is what separates the two cases. A body that
 * is not JSON is a service that answered badly, not a service that is missing,
 * and its status and first line are worth putting in the log — that is the
 * difference between "OCR is broken" and knowing why within a minute.
 */

const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function relayToAiService(
    /** Path on the AI service, e.g. "/api/ocr". */
    path: string,
    body: FormData,
    /** Names the tool in logs, so one failing route is identifiable. */
    label: string
): Promise<NextResponse> {
    let response: Response;

    try {
        response = await fetch(`${AI_SERVICE}${path}`, { method: "POST", body });
    } catch (err) {
        // The only case that genuinely is a connection problem.
        console.error(`[${label}] could not reach the AI service at ${AI_SERVICE}`, err);
        return NextResponse.json(
            { success: false, message: "Unable to connect to AI Service." },
            { status: 503 }
        );
    }

    const text = await response.text();

    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        // Reached, answered, and the answer was not JSON — an HTML error page
        // from an unhandled middleware error being the way this actually
        // happens. The body is truncated because an error page is long and the
        // useful part is at the front.
        console.error(
            `[${label}] the AI service answered ${response.status} with non-JSON: ` +
            text.slice(0, 300).replace(/\s+/g, " ")
        );
        return NextResponse.json(
            {
                success: false,
                message: "The AI service returned an unexpected response. Please try again.",
            },
            { status: 502 }
        );
    }

    if (!response.ok) {
        console.error(`[${label}] the AI service answered ${response.status}`, data);
    }

    // A JSON answer is passed through whatever its status: the service already
    // writes messages meant for the person who uploaded the file, including the
    // retryable "the model is busy" ones.
    return NextResponse.json(data, { status: response.status });
}
