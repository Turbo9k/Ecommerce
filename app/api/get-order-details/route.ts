import { type NextRequest, NextResponse } from "next/server"

// Use environment variable for Stripe secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    })

    // Extract shipping information from the session
    let shippingInfo = null
    if (session.customer_details) {
      const customerDetails = session.customer_details
      const paymentIntent = session.payment_intent

      shippingInfo = {
        name: customerDetails.name || "N/A",
        address: {
          line1: customerDetails.address?.line1 || "",
          line2: customerDetails.address?.line2 || "",
          city: customerDetails.address?.city || "",
          state: customerDetails.address?.state || "",
          postal_code: customerDetails.address?.postal_code || "",
          country: customerDetails.address?.country || "",
        },
        phone: customerDetails.phone || "N/A",
        email: customerDetails.email || "N/A",
      }
    }

    return NextResponse.json({
      success: true,
      shippingInfo,
      paymentStatus: session.payment_status,
      orderStatus: session.status,
    })
  } catch (error: any) {
    console.error("❌ Error fetching order details:", error)
    return NextResponse.json(
      {
        error: "Error fetching order details",
        details: error.message,
      },
      { status: 500 },
    )
  }
} 