import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

interface ContactEmailParams {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail({ name, email, subject, message }: ContactEmailParams) {
  const to = process.env.CONTACT_TO_EMAIL || "dao@medialane.org"
  const from = process.env.CONTACT_FROM_EMAIL || "dao@medialane.org"

  await transporter.sendMail({
    from: `"Medialane Contact" <${from}>`,
    to,
    replyTo: `"${escapeHtml(name)}" <${email}>`,
    subject: `[Contact] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <hr />
      <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
    `,
  })
}
