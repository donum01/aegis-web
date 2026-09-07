"use client"

import { useState } from "react"
import { CalendarClock, ChevronDown, Clock3, Loader2, LockKeyhole, PiggyBank, UnlockKeyhole } from "lucide-react"
import {
  earnTermLabel,
  formatEarnDate,
  type EarnPosition,
} from "@/lib/earn"
import { assetAmountFormatter, formatRate } from "@/lib/format"
import { AssetChip } from "./asset-chip"

type WithdrawResult = { ok: true } | { ok: false; message: string }

function termDays(position: EarnPosition): number {
  if (position.termType === "LOCKED_30") return 30
  if (position.termType === "LOCKED_90") return 90
  return 0
}

function positionProgress(position: EarnPosition): number {
  if (position.termType === "FLEXIBLE") return 100
  if (position.status === "WITHDRAWN" || position.daysRemaining === 0) return 100
  const days = termDays(position)
  return Math.max(0, Math.min(100, ((days - (position.daysRemaining ?? days)) / days) * 100))
}

export function EarnPositions({
  activePositions,
  historyPositions,
  activeHasMore,
  historyHasMore,
  loadingMore,
  onLoadMoreActive,
  onLoadMoreHistory,
  onWithdraw,
}: {
  activePositions: EarnPosition[]
  historyPositions: EarnPosition[]
  activeHasMore: boolean
  historyHasMore: boolean
  loadingMore: "ACTIVE" | "HISTORY" | null
  onLoadMoreActive: () => void
  onLoadMoreHistory: () => void
  onWithdraw: (positionId: number) => Promise<WithdrawResult>
}) {
  const [tab, setTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE")
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null)
  const [confirmingWithdrawId, setConfirmingWithdrawId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const visiblePositions = tab === "ACTIVE" ? activePositions : historyPositions
  const hasMore = tab === "ACTIVE" ? activeHasMore : historyHasMore
  const loadMore = tab === "ACTIVE" ? onLoadMoreActive : onLoadMoreHistory

  async function handleWithdraw(positionId: number) {
    setWithdrawingId(positionId)
    setActionError(null)
    const result = await onWithdraw(positionId)
    if (!result.ok) setActionError(result.message)
    else setConfirmingWithdrawId(null)
    setWithdrawingId(null)
  }

  return (
    <section className="aegis-card p-5 sm:p-6" aria-labelledby="earn-positions-heading">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="earn-positions-heading" className="text-xl font-bold" style={{ color: "var(--aegis-text)" }}>
            Your positions
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--aegis-muted)" }}>
            Track accrued rewards and maturity progress.
          </p>
        </div>
        <div className="aegis-tabs grid grid-cols-2 gap-1 p-1">
          {(["ACTIVE", "HISTORY"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value)
                setActionError(null)
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
              style={{
                background: tab === value ? "var(--aegis-indicator)" : "transparent",
                color: tab === value ? "var(--aegis-text)" : "var(--aegis-muted)",
                boxShadow: tab === value ? "0 2px 8px rgba(20, 123, 157, 0.14)" : "none",
              }}
              aria-pressed={tab === value}
            >
              {value === "ACTIVE"
                ? `Active (${activePositions.length}${activeHasMore ? "+" : ""})`
                : `History (${historyPositions.length}${historyHasMore ? "+" : ""})`}
            </button>
          ))}
        </div>
      </div>

      {actionError ? (
        <div
          className="aegis-fade-slide mb-4 rounded-lg px-3 py-2.5 text-sm font-medium"
          style={{
            color: "var(--aegis-error)",
            background: "color-mix(in srgb, var(--aegis-error) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--aegis-error) 30%, transparent)",
          }}
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {visiblePositions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--aegis-primary-soft)", color: "var(--aegis-primary)" }}
          >
            <PiggyBank className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--aegis-text)" }}>
              {tab === "ACTIVE" ? "No active positions" : "No completed positions"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--aegis-muted)" }}>
              {tab === "ACTIVE" ? "Choose a product above to put a balance to work." : "Withdrawn positions will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visiblePositions.map((position, index) => {
            const progress = positionProgress(position)
            const flexible = position.termType === "FLEXIBLE"
            const loading = withdrawingId === position.id
            return (
              <article
                key={position.id}
                className="aegis-card-in rounded-xl p-5"
                style={{
                  animationDelay: `${index * 55}ms`,
                  background: "var(--aegis-input-bg)",
                  border: "1px solid var(--aegis-input-border)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AssetChip asset={position.asset} size={40} />
                    <div>
                      <p className="font-bold" style={{ color: "var(--aegis-text)" }}>
                        {position.asset} · {earnTermLabel(position.termType)}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--aegis-muted)" }}>
                        Started {formatEarnDate(position.startDate)} · #{position.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{
                      background: position.status === "ACTIVE" ? "var(--aegis-primary-soft)" : "var(--aegis-track)",
                      color: position.status === "ACTIVE" ? "var(--aegis-primary)" : "var(--aegis-muted)",
                    }}
                  >
                    {position.status === "ACTIVE" ? "Earning" : "Withdrawn"}
                  </span>
                </div>

                <div className="my-5 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs" style={{ color: "var(--aegis-muted)" }}>Principal</p>
                    <p className="mt-1 text-sm font-bold tabular-nums" style={{ color: "var(--aegis-text)" }}>
                      {assetAmountFormatter.format(position.principalAmount)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--aegis-muted)" }}>{position.asset}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--aegis-muted)" }}>APY snapshot</p>
                    <p className="mt-1 text-sm font-bold tabular-nums" style={{ color: "var(--aegis-primary)" }}>
                      {formatRate(position.apy)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--aegis-muted)" }}>at subscription</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--aegis-muted)" }}>Rewards</p>
                    <p className="mt-1 text-sm font-bold tabular-nums" style={{ color: "var(--aegis-ltv-safe)" }}>
                      +{assetAmountFormatter.format(position.accruedRewards)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--aegis-muted)" }}>{position.asset}</p>
                  </div>
                </div>

                {position.status === "ACTIVE" ? (
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-1.5" style={{ color: "var(--aegis-muted)" }}>
                        {flexible ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
                        {flexible ? "Flexible access" : "Maturity progress"}
                      </span>
                      <span className="font-semibold" style={{ color: "var(--aegis-text)" }}>
                        {flexible
                          ? "Available now"
                          : position.daysRemaining === 0
                            ? "Matured"
                            : `${position.daysRemaining} days left`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--aegis-track)" }}>
                      <div
                        className="aegis-earn-progress h-full rounded-full"
                        style={{ width: `${progress}%`, background: "var(--aegis-primary)" }}
                      />
                    </div>
                    {!flexible && position.endDate ? (
                      <p className="mt-2 flex items-center gap-1 text-xs" style={{ color: "var(--aegis-muted)" }}>
                        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                        Matures {formatEarnDate(position.endDate)}
                      </p>
                    ) : null}
                  </div>
                ) : position.endDate ? (
                  <p className="mb-5 flex items-center gap-1 text-xs" style={{ color: "var(--aegis-muted)" }}>
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Closed {formatEarnDate(position.endDate)}
                  </p>
                ) : null}

                {position.status === "ACTIVE" && confirmingWithdrawId === position.id ? (
                  <div className="rounded-lg border p-4" style={{ borderColor: "var(--aegis-card-border)", background: "var(--aegis-track)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--aegis-text)" }}>Review Earn withdrawal</p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--aegis-muted)" }}>
                      Return {assetAmountFormatter.format(position.principalAmount)} {position.asset} principal plus {assetAmountFormatter.format(position.accruedRewards)} {position.asset} accrued rewards to Wallet.
                    </p>
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      <button type="button" onClick={() => setConfirmingWithdrawId(null)} disabled={loading} className="aegis-btn-outline h-11 px-4 text-sm font-semibold">Cancel</button>
                      <button type="button" onClick={() => void handleWithdraw(position.id)} disabled={loading} className="aegis-submit flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                        Confirm withdrawal
                      </button>
                    </div>
                  </div>
                ) : position.status === "ACTIVE" ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingWithdrawId(position.id)}
                    disabled={!position.withdrawable || withdrawingId !== null}
                    className="aegis-btn-outline flex h-11 w-full items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    title={!position.withdrawable ? "Locked positions can be withdrawn after maturity" : undefined}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Withdrawing…</>
                    ) : position.withdrawable ? (
                      "Withdraw principal + rewards"
                    ) : (
                      "Available at maturity"
                    )}
                  </button>
                ) : null}
              </article>
            )
            })}
          </div>
          {hasMore ? (
            <div className="mt-5 flex justify-center border-t pt-5" style={{ borderColor: "var(--aegis-card-border)" }}>
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore !== null}
                className="aegis-btn-outline flex h-9 items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore === tab ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Loading</>
                ) : (
                  <>Load 10 more <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
