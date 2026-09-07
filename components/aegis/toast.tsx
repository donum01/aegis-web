"use client"

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

export type ToastVariant = "success" | "warning" | "error"

export function Toast({ message, variant = "success" }: { message: string; variant?: ToastVariant }) {
  const Icon = variant === "error" ? XCircle : variant === "warning" ? AlertTriangle : CheckCircle2
  const color = variant === "error"
    ? "var(--aegis-error)"
    : variant === "warning"
      ? "var(--aegis-ltv-warn)"
      : "var(--aegis-success)"

  return (
    <div
      className="aegis-toast aegis-card pointer-events-auto flex items-center gap-3 px-4 py-3"
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden="true" />
      <p className="text-sm font-medium" style={{ color: "var(--aegis-text)" }}>
        {message}
      </p>
    </div>
  )
}
