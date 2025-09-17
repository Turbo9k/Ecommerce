import crypto from "crypto"

function base64url(input: Buffer | string) {
	const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
	return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

export function signJwt(payload: Record<string, any>, secret: string, expiresInSeconds = 60 * 60) {
	const header = { alg: "HS256", typ: "JWT" }
	const now = Math.floor(Date.now() / 1000)
	const body = { ...payload, iat: now, exp: now + expiresInSeconds }
	const headerB64 = base64url(JSON.stringify(header))
	const payloadB64 = base64url(JSON.stringify(body))
	const data = `${headerB64}.${payloadB64}`
	const sig = crypto.createHmac("sha256", secret).update(data).digest()
	const sigB64 = base64url(sig)
	return `${data}.${sigB64}`
}

export function verifyJwt(token: string, secret: string): { valid: boolean; payload?: any; error?: string } {
	try {
		const parts = token.split(".")
		if (parts.length !== 3) return { valid: false, error: "Malformed token" }
		const [headerB64, payloadB64, sigB64] = parts
		const data = `${headerB64}.${payloadB64}`
		const expected = base64url(crypto.createHmac("sha256", secret).update(data).digest())
		if (expected !== sigB64) return { valid: false, error: "Invalid signature" }
		const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString("utf8"))
		const now = Math.floor(Date.now() / 1000)
		if (payload.exp && now > payload.exp) return { valid: false, error: "Token expired" }
		return { valid: true, payload }
	} catch (e: any) {
		return { valid: false, error: e.message }
	}
} 