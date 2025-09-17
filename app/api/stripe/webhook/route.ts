import { NextRequest, NextResponse } from "next/server"
import { orderStore } from "@/lib/order-store"
import Stripe from "stripe"

export const config = {
	api: {
		bodyParser: false,
	},
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" })

export async function POST(request: NextRequest) {
	try {
		const rawBody = await request.text()
		const sig = request.headers.get("stripe-signature") as string
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string

		let event: Stripe.Event
		try {
			event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
		} catch (err: any) {
			return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
		}

		switch (event.type) {
			case "charge.refunded": {
				const charge = event.data.object as Stripe.Charge
				const paymentIntentId = charge.payment_intent?.toString()
				if (paymentIntentId) {
					const all = orderStore.getAllOrders()
					const match = all.find((o) => o.stripeSessionId === paymentIntentId || o.trackingNumber === paymentIntentId)
					if (match) {
						orderStore.updateOrderStatus(match.id, "refunded")
					}
				}
				break
			}
			case "refund.updated":
			case "charge.refund.updated": {
				break
			}
			default: {
				break
			}
		}

		return NextResponse.json({ received: true })
	} catch (error: any) {
		return NextResponse.json({ error: "Webhook error", details: error.message }, { status: 400 })
	}
} 