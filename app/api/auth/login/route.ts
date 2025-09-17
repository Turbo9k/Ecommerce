import { NextRequest, NextResponse } from "next/server"
import { userStorage } from "@/lib/user-storage"
import { signJwt } from "@/lib/jwt"

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		let email = (body?.email || "").toString().trim()
		let password = (body?.password || "").toString().trim()
		if (!email || !password) {
			return NextResponse.json({ error: "Email and password required" }, { status: 400 })
		}

		let user = userStorage.validateCredentials(email, password)

		// Fallback for server-side (no localStorage) with demo accounts
		if (!user) {
			const demoUsers = [
				{ id: "1", email: "admin@example.com", name: "Admin User", role: "admin", password: "password" },
				{ id: "2", email: "customer@example.com", name: "Customer User", role: "customer", password: "password" },
			]
			const match = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
			if (match) {
				user = { id: match.id, email: match.email, name: match.name, role: match.role, password: match.password } as any
			}
		}

		if (!user) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
		}

		const jwtSecret = process.env.JWT_SECRET
		if (!jwtSecret) {
			return NextResponse.json({ error: "Server not configured (JWT_SECRET)" }, { status: 500 })
		}

		const token = signJwt({ sub: user.id, role: user.role, email: user.email, name: user.name }, jwtSecret, 60 * 60 * 24)

		const res = NextResponse.json({ success: true })
		res.cookies.set("auth", token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		})
		// Optional: convenience cookie with minimal public data
		res.cookies.set("user", JSON.stringify({ id: user.id, role: user.role, email: user.email, name: user.name }), {
			httpOnly: false,
			secure: true,
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24,
		})
		return res
	} catch (e: any) {
		return NextResponse.json({ error: "Login failed", details: e.message }, { status: 500 })
	}
} 