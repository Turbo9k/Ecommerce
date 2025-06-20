import { type NextRequest, NextResponse } from "next/server"

// Use environment variable for Stripe secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Fetch the session from Stripe with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "customer"],
    })

    // Extract shipping information from multiple possible locations
    let shippingInfo = null
    
    // Check customer_details first (most common location)
    if (session.customer_details) {
      const customerDetails = session.customer_details
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
    
    // If no customer_details, check session.shipping
    if (!shippingInfo && session.shipping) {
      shippingInfo = {
        name: session.shipping.name || "N/A",
        address: {
          line1: session.shipping.address?.line1 || "",
          line2: session.shipping.address?.line2 || "",
          city: session.shipping.address?.city || "",
          state: session.shipping.address?.state || "",
          postal_code: session.shipping.address?.postal_code || "",
          country: session.shipping.address?.country || "",
        },
        phone: session.shipping.phone || "N/A",
        email: session.customer?.email || "N/A",
      }
    }
    
    // If still no shipping info, check payment_intent.shipping
    if (!shippingInfo && session.payment_intent?.shipping) {
      const paymentIntentShipping = session.payment_intent.shipping
      shippingInfo = {
        name: paymentIntentShipping.name || "N/A",
        address: {
          line1: paymentIntentShipping.address?.line1 || "",
          line2: paymentIntentShipping.address?.line2 || "",
          city: paymentIntentShipping.address?.city || "",
          state: paymentIntentShipping.address?.state || "",
          postal_code: paymentIntentShipping.address?.postal_code || "",
          country: paymentIntentShipping.address?.country || "",
        },
        phone: paymentIntentShipping.phone || "N/A",
        email: session.customer?.email || "N/A",
      }
    }
    
    // If still no shipping info, check customer.shipping
    if (!shippingInfo && session.customer?.shipping) {
      const customerShipping = session.customer.shipping
      shippingInfo = {
        name: customerShipping.name || "N/A",
        address: {
          line1: customerShipping.address?.line1 || "",
          line2: customerShipping.address?.line2 || "",
          city: customerShipping.address?.city || "",
          state: customerShipping.address?.state || "",
          postal_code: customerShipping.address?.postal_code || "",
          country: customerShipping.address?.country || "",
        },
        phone: customerShipping.phone || "N/A",
        email: session.customer?.email || "N/A",
      }
    }
    
    // If still no shipping info, try to get basic info from customer
    if (!shippingInfo && session.customer) {
      shippingInfo = {
        name: session.customer.name || "N/A",
        address: {
          line1: session.customer.address?.line1 || "",
          line2: session.customer.address?.line2 || "",
          city: session.customer.address?.city || "",
          state: session.customer.address?.state || "",
          postal_code: session.customer.address?.postal_code || "",
          country: session.customer.address?.country || "",
        },
        phone: session.customer.phone || "N/A",
        email: session.customer.email || "N/A",
      }
    }

    return NextResponse.json({
      success: true,
      shippingInfo,
      paymentStatus: session.payment_status,
      orderStatus: session.status,
      sessionData: {
        hasCustomerDetails: !!session.customer_details,
        hasShipping: !!session.shipping,
        hasPaymentIntentShipping: !!session.payment_intent?.shipping,
        hasCustomerShipping: !!session.customer?.shipping,
        hasCustomer: !!session.customer,
      }
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