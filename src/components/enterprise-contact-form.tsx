"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Loader2, CheckCircle2 } from "lucide-react"

export function EnterpriseContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMessage("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const body = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      _hp: String(formData.get("_hp") ?? ""),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMessage(data.error ?? "Failed to send message. Please try again.")
        setStatus("error")
        return
      }
      setStatus("success")
      form.reset()
    } catch {
      setErrorMessage("Failed to send message. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-8 text-center space-y-3">
        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
        <p className="text-white font-medium">Message sent.</p>
        <p className="text-sm text-muted-foreground">We&apos;ll get back to you shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required maxLength={200} placeholder="e.g. Credentialing for our school, Content licensing" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Tell us about the deployment you have in mind." />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  )
}
