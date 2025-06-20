import { type NextRequest, NextResponse } from "next/server"

// Use environment variable for Stripe secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    // Get the origin URL with fallbacks
    const origin =
      request.nextUrl?.origin ||
      request.headers.get("origin") ||
      request.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      "http://localhost:3000"

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: `High-quality ${item.name.toLowerCase()}`,
          images: item.image && !item.image.includes("placeholder") ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"],
      },
      phone_number_collection: {
        enabled: true,
      },
      customer_creation: "always",
      metadata: {
        order_type: "ecommerce_demo",
        total_items: items.reduce((sum: number, item: any) => sum + item.quantity, 0).toString(),
      },
      automatic_tax: {
        enabled: false, // Disabled for demo
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error("❌ Detailed Stripe error:", error)
    return NextResponse.json(
      {
        error: "Error creating checkout session",
        details: error.message,
        type: error.type || "unknown_error",
      },
      { status: 500 },
    )
  }
}
