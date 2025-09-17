import { NextRequest, NextResponse } from "next/server"

// Demo endpoint: validates return rules and echoes a decision.
export async function POST(request: NextRequest) {
	try {
		const { orderId, currentStatus, deliveredAt, reason } = await request.json()

		if (!orderId || !currentStatus) {
			return NextResponse.json({ error: "orderId and currentStatus are required" }, { status: 400 })
		}

		// Only allow returns for delivered orders within 30 days (demo rule)
		const isDelivered = currentStatus === "delivered"
		let withinWindow = true
		if (deliveredAt) {
			const daysSinceDelivered = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
			withinWindow = daysSinceDelivered <= 30
		}

		if (!isDelivered || !withinWindow) {
			return NextResponse.json(
				{
					success: false,
					message: !isDelivered
						? "Only delivered orders can be returned"
						: "Return window has expired",
					orderId,
					currentStatus,
				},
				{ status: 409 },
			)
		}

		// In a real implementation, mark the order as "returned" and start RMA flow here
		return NextResponse.json({ success: true, orderId, newStatus: "returned", reason: reason || null })
	} catch (error: any) {
		return NextResponse.json({ error: "Failed to handle return", details: error.message }, { status: 500 })
	}
} 