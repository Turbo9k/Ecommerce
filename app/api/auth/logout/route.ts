import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	const res = NextResponse.json({ success: true })
	res.cookies.set("auth", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 })
	res.cookies.set("user", "", { httpOnly: false, secure: true, sameSite: "lax", path: "/", maxAge: 0 })
	return res
} 