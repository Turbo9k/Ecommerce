import { NextRequest, NextResponse } from "next/server"
import { verifyJwt } from "@/lib/jwt"

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization") || ""
	const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
	const cookieToken = request.cookies.get("auth")?.value || null
	const token = bearer || cookieToken

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 401 })
	}
	const secret = process.env.JWT_SECRET || ""
	const result = verifyJwt(token, secret)
	if (!result.valid || !result.payload) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 })
	}
	if (result.payload.role !== "admin") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 })
	}
	return NextResponse.json({ success: true, message: "Admin access granted via JWT", user: { id: result.payload.sub, role: result.payload.role } })
} 