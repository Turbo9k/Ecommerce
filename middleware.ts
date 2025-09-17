import { NextResponse, type NextRequest } from "next/server"
import { verifyJwtEdge } from "@/lib/jwt-edge"

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
	"/",
	"/login",
	"/register",
	"/products",
	"/api/create-checkout-session",
	"/api/get-order-details",
	"/api/stripe/webhook",
	"/api/auth/login",
	"/api/auth/logout",
]

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Allow public routes
	if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
		return NextResponse.next()
	}

	const authCookie = request.cookies.get("auth")?.value
	const jwtSecret = process.env.JWT_SECRET || ""

	let role: string | null = null

	if (authCookie && jwtSecret) {
		const result = await verifyJwtEdge(authCookie, jwtSecret)
		if (result.valid && result.payload) {
			role = result.payload.role
		} else {
			// invalid token: clear and redirect to login
			const res = NextResponse.redirect(new URL("/login", request.url))
			res.cookies.set("auth", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 })
			res.cookies.set("user", "", { httpOnly: false, secure: true, sameSite: "lax", path: "/", maxAge: 0 })
			return res
		}
	}

	if (!role) {
		const loginUrl = new URL("/login", request.url)
		loginUrl.searchParams.set("callbackUrl", request.url)
		return NextResponse.redirect(loginUrl)
	}

	// Role-based protection for dashboard and admin APIs
	if ((pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) && role !== "admin") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 }) as any
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
} 