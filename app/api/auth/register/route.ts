import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    // Replace with your database query
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user in database
    // Replace with your database insertion
    const newUser = await createUser({
      email,
      name,
      hashedPassword,
      role: "customer", // default role for e-commerce
    })

    return NextResponse.json({ message: "User created successfully", userId: newUser.id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Placeholder functions - replace with your actual database operations
async function getUserByEmail(email: string) {
  // Your database query here
  return null
}

async function createUser(userData: any) {
  // Your database insertion here
  return { id: "1" }
}
