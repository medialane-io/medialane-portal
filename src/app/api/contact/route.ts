import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendContactEmail } from "@/src/lib/mailer"
import { createRateLimiter, clientIp } from "@/src/lib/rate-limit"

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  _hp: z.string().optional(),
})

const checkRateLimit = createRateLimiter(60_000, 5)

export async function POST(req: NextRequest) {
  if (!checkRateLimit(clientIp(req))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await req.json()

    if (body._hp) {
      return NextResponse.json({ success: true })
    }

    const result = schema.safeParse(body)
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "Invalid request"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, subject, message } = result.data
    await sendContactEmail({ name, email, subject, message })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[contact] email send failed:", err)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}
