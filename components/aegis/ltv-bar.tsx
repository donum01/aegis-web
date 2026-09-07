import { ltvTier, ltvTierColorVar, type BorrowConfiguration } from "@/lib/borrow"

export function LtvBar({ ltv, configuration }: { ltv: number; configuration: BorrowConfiguration }) {
  const tier = ltvTier(ltv, configuration)
  const color = ltvTierColorVar(tier)
  const isDanger = tier === "danger"
  const width = Math.min(Math.max((ltv / configuration.maxLtvPercent) * 100, 0), 100)
  const status = ltv <= 0
    ? "Enter amounts"
    : tier === "safe"
      ? "Safe"
      : tier === "warn"
        ? "Caution"
        : "Over limit"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--aegis-muted)" }}>
          Loan-to-Value
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${isDanger ? "aegis-warn-pulse" : ""}`}
          style={{ color }}
        >
          {ltv.toFixed(1)}%
        </span>
      </div>

      <div
        className="aegis-ltv-track h-2.5 w-full"
        role="progressbar"
        aria-valuenow={Math.min(Math.round(ltv), configuration.maxLtvPercent)}
        aria-valuemin={0}
        aria-valuemax={configuration.maxLtvPercent}
        aria-valuetext={`${ltv.toFixed(1)}% LTV, ${status}. Maximum allowed ${configuration.maxLtvPercent}%.`}
        aria-label="Loan-to-value ratio"
      >
        <div
          className={`aegis-ltv-fill h-full ${isDanger ? "aegis-warn-pulse" : ""}`}
          style={{ width: `${width}%`, background: color }}
        />
      </div>

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--aegis-muted)" }}>
        <span className="font-semibold" style={{ color }}>{status}</span>
        <span>Max {configuration.maxLtvPercent}%</span>
      </div>
    </div>
  )
}
