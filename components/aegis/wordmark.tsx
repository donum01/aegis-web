import Image from "next/image"

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Aegis Digital">
      <Image
        src="/aegis-logo.png"
        alt="Aegis Digital logo"
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        priority
      />
      <span className="text-xl font-semibold tracking-[-0.025em]">
        <span style={{ color: "var(--aegis-text)" }}>Aegis</span>{" "}
        <span style={{ color: "var(--aegis-primary)" }}>Digital</span>
      </span>
    </div>
  )
}
