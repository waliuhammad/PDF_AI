import { NextResponse } from "next/server";

/**
 * The Lemon Squeezy checkout, retired.
 *
 * lib/billing/lemonsqueezy.ts was deleted as part of moving to Payoneer, but
 * this route still imported it, so the project did not compile at all. The
 * endpoint is kept rather than removed because components/pricing/checkout-button.tsx
 * still posts here — deleting it would turn a clear message into a 404 and an
 * unparseable HTML response in the browser.
 *
 * The replacement is /api/billing/checkout/payoneer, driven by
 * components/billing/payoneer-checkout.tsx. That flow is not a redirect to a
 * hosted checkout: it issues a reference code, the customer pays, and an admin
 * confirms. So the button cannot simply be repointed here — it needs the
 * Payoneer component in its place, which is a product decision rather than a
 * rename.
 */
export async function POST() {
    return NextResponse.json(
        {
            success: false,
            message:
                "This checkout has moved. Please use the Payoneer payment option, or contact support.",
        },
        { status: 503 }
    );
}
