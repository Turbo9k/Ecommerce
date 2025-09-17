import { NextRequest, NextResponse } from "next/server"

// Demo endpoint: validates cancellation rules and echoes a decision.
// Real apps should verify the authenticated user owns the order and update DB.
export async function POST(request: NextRequest) {
	try {
		const { orderId, currentStatus, createdAt, reason } = await request.json()

		if (!orderId || !currentStatus) {
			return NextResponse.json({ error: "orderId and currentStatus are required" }, { status: 400 })
		}

		// Only allow cancellation if order has not shipped
		const cancellableStatuses = ["pending", "processing"]
		const canCancel = cancellableStatuses.includes(currentStatus)

		if (!canCancel) {
			return NextResponse.json(
				{
					success: false,
					message: "Order cannot be cancelled after it has shipped",
					orderId,
					currentStatus,
				},
				{ status: 409 },
			)
		}

		// In a real implementation, update order status to "cancelled" in database here
		return NextResponse.json({ success: true, orderId, newStatus: "cancelled", reason: reason || null })
	} catch (error: any) {
		return NextResponse.json({ error: "Failed to handle cancellation", details: error.message }, { status: 500 })
	}
} 