function base64urlEncode(buffer: ArrayBuffer): string {
	let binary = ""
	const bytes = new Uint8Array(buffer)
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i])
	}
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export async function verifyJwtEdge(
	token: string,
	secret: string,
): Promise<{ valid: boolean; payload?: any; error?: string }> {
	try {
		const parts = token.split(".")
		if (parts.length !== 3) return { valid: false, error: "Malformed token" }
		const [headerB64, payloadB64, sigB64] = parts
		const data = `${headerB64}.${payloadB64}`

		const enc = new TextEncoder()
		const key = await crypto.subtle.importKey(
			"raw",
			enc.encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		)
		const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data))
		const expectedB64 = base64urlEncode(signature)
		if (expectedB64 !== sigB64) return { valid: false, error: "Invalid signature" }

		const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
		const payload = JSON.parse(payloadJson)
		const now = Math.floor(Date.now() / 1000)
		if (payload.exp && now > payload.exp) return { valid: false, error: "Token expired" }
		return { valid: true, payload }
	} catch (e: any) {
		return { valid: false, error: e.message }
	}
} 