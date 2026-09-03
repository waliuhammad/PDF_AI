import { NextRequest, NextResponse } from "next/server";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAdminApp, isAdminConfigured } from "@/lib/firebase/admin";
import { getRequestUid } from "@/lib/server-auth";

/**
 * The one-to-five star rating, and the public average built from it.
 *
 * Two documents per submission. `ratings/{uid}` holds what one person said,
 * keyed by their uid so a second submission replaces the first rather than
 * stacking — one account, one vote, enforced by the shape of the data rather
 * than by a check that could be forgotten. `stats/ratings` holds the running
 * total the landing page reads.
 *
 * The average is stored rather than computed on read. The alternative is
 * reading every rating each time the CTA loads, which costs a document read per
 * rating per visitor and gets slower precisely as the product succeeds. Keeping
 * `ratingSum` alongside the count is what makes an edit cheap: a rating that
 * changes from 5 to 3 moves the sum by -2 without anything having to revisit
 * the other votes.
 */

export const runtime = "nodejs";

const STATS_PATH = { collection: "stats", doc: "ratings" } as const;

function database() {
    return getFirestore(getAdminApp());
}

/** Averages are shown to one decimal; storing more precision helps nobody read it. */
function round(value: number): number {
    return Math.round(value * 10) / 10;
}

/**
 * The public number.
 *
 * Deliberately unauthenticated: it is rendered on the marketing page, which
 * signed-out visitors see. It exposes an average and a count, and nothing about
 * who voted.
 */
export async function GET() {
    // No credentials means no aggregate to read. Zero is the honest answer and
    // the CTA hides itself on it, which is better than a 500 on the home page.
    if (!isAdminConfigured()) {
        return NextResponse.json({ avgRating: 0, totalCount: 0 });
    }

    try {
        const snap = await database().collection(STATS_PATH.collection).doc(STATS_PATH.doc).get();
        const data = snap.data();

        const totalCount = typeof data?.totalCount === "number" ? data.totalCount : 0;
        const avgRating = typeof data?.avgRating === "number" ? data.avgRating : 0;

        // No ratings yet is not an error; it is the state every project starts in.
        return NextResponse.json({
            avgRating: totalCount > 0 ? round(avgRating) : 0,
            totalCount,
        });
    } catch (err) {
        console.error("[rating] could not read the aggregate", err);
        return NextResponse.json({ avgRating: 0, totalCount: 0 });
    }
}

export async function POST(req: NextRequest) {
    if (!isAdminConfigured()) {
        return NextResponse.json(
            { success: false, message: "Ratings are not available right now." },
            { status: 503 }
        );
    }

    // The same session cookie every other authenticated route reads, verified
    // with checkRevoked. The uid comes from the verified cookie and never from
    // the request body, so a caller cannot rate on somebody else's behalf.
    const uid = await getRequestUid(req);
    if (!uid) {
        return NextResponse.json(
            { success: false, message: "Sign in to leave a rating." },
            { status: 401 }
        );
    }

    const body = await req.json().catch(() => null);
    const rating = body?.rating;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json(
            { success: false, message: "A rating must be a whole number from 1 to 5." },
            { status: 400 }
        );
    }

    try {
        const db = database();
        const ratingRef = db.collection("ratings").doc(uid);
        const statsRef = db.collection(STATS_PATH.collection).doc(STATS_PATH.doc);

        const totals = await db.runTransaction(async (tx) => {
            // Both reads before either write: a Firestore transaction requires
            // it, and it is also what makes two people rating at the same
            // moment safe. Each transaction sees a consistent pair and one of
            // them retries rather than both writing a total computed from the
            // same stale sum.
            const [ratingSnap, statsSnap] = await Promise.all([tx.get(ratingRef), tx.get(statsRef)]);

            const stats = statsSnap.data();
            let totalCount = typeof stats?.totalCount === "number" ? stats.totalCount : 0;
            let ratingSum = typeof stats?.ratingSum === "number" ? stats.ratingSum : 0;

            const previous = ratingSnap.exists ? ratingSnap.data()?.rating : undefined;

            if (typeof previous === "number") {
                // A change of mind, not a new voice: the count stands and the
                // sum moves by the difference.
                ratingSum += rating - previous;
            } else {
                totalCount += 1;
                ratingSum += rating;
            }

            const avgRating = totalCount > 0 ? ratingSum / totalCount : 0;

            tx.set(
                ratingRef,
                {
                    rating,
                    // Only stamped the first time, so an edit does not rewrite
                    // when the person first spoke.
                    ...(ratingSnap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

            tx.set(
                statsRef,
                { avgRating, totalCount, ratingSum, updatedAt: FieldValue.serverTimestamp() },
                { merge: true }
            );

            return { avgRating, totalCount, updated: typeof previous === "number" };
        });

        return NextResponse.json({
            success: true,
            updated: totals.updated,
            avgRating: round(totals.avgRating),
            totalCount: totals.totalCount,
        });
    } catch (err) {
        // The reason stays in the server log. The browser gets a sentence,
        // because a Firestore error message can name paths and project ids.
        console.error("[rating] could not record a rating", err);
        return NextResponse.json(
            { success: false, message: "Could not save your rating. Please try again." },
            { status: 500 }
        );
    }
}
