/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * TransferFeed: Real-time scrolling feed of individual transfer alerts
 * Each alert shows direction, amount, tier badge, addresses, and time
 */
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Copy, Check } from "lucide-react";
import { formatFullNumber, shortenAddress, timeAgo, getEtherscanTxUrl } from "@/lib/utils";
import type { ProcessedTransfer } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface TransferFeedProps {
  transfers: ProcessedTransfer[];
  isLoading: boolean;
}

function TransferRow({ tx, index }: { tx: ProcessedTransfer; index: number }) {
  const [copied, setCopied] = useState(false);
  const isInflow = tx.direction === "inflow";

  const copyHash = useCallback(() => {
    navigator.clipboard.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tx.hash]);

  const tierBadgeClass =
    tx.tier === "250K+"
      ? "tier-badge-250k"
      : tx.tier === "100K+"
      ? "tier-badge-100k"
      : "tier-badge-50k";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`group relative glass-panel rounded-xl p-4 border transition-all duration-200 hover:border-opacity-60 ${
        isInflow
          ? "border-[oklch(0.79_0.15_175/0.15)] hover:border-[oklch(0.79_0.15_175/0.4)]"
          : "border-[oklch(0.7_0.17_20/0.15)] hover:border-[oklch(0.7_0.17_20/0.4)]"
      }`}
    >
      {/* Left accent line */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-full ${
          isInflow ? "bg-[oklch(0.79_0.15_175)]" : "bg-[oklch(0.7_0.17_20)]"
        }`}
      />

      <div className="flex items-start justify-between gap-3 ml-2">
        {/* Left: Direction icon + details */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
              isInflow
                ? "bg-[oklch(0.79_0.15_175/0.12)]"
                : "bg-[oklch(0.7_0.17_20/0.12)]"
            }`}
          >
            {isInflow ? (
              <ArrowDownLeft className="w-4.5 h-4.5 text-[oklch(0.79_0.15_175)]" />
            ) : (
              <ArrowUpRight className="w-4.5 h-4.5 text-[oklch(0.7_0.17_20)]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-base font-bold font-mono ${
                  isInflow
                    ? "text-[oklch(0.79_0.15_175)]"
                    : "text-[oklch(0.7_0.17_20)]"
                }`}
              >
                {isInflow ? "+" : "-"}
                {formatFullNumber(tx.amount)} STO
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tierBadgeClass}`}>
                {tx.tier}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-mono">
              <span className={isInflow ? "text-[oklch(0.79_0.15_175/0.7)]" : "text-muted-foreground"}>
                {shortenAddress(tx.from)}
              </span>
              <span className="text-muted-foreground/50">&rarr;</span>
              <span className={!isInflow ? "text-[oklch(0.7_0.17_20/0.7)]" : "text-muted-foreground"}>
                {shortenAddress(tx.to)}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground/60 mt-1">
              {tx.binanceWalletLabel}
            </p>
          </div>
        </div>

        {/* Right: Time + actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground">
            {timeAgo(tx.timestamp)}
          </span>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyHash}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Copy tx hash"
            >
              {copied ? (
                <Check className="w-3 h-3 text-[oklch(0.79_0.15_175)]" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
            <a
              href={getEtherscanTxUrl(tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="View on Etherscan"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TransferFeed({ transfers, isLoading }: TransferFeedProps) {
  if (isLoading && transfers.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted" />
              <div className="flex-1">
                <div className="h-5 w-40 bg-muted rounded mb-2" />
                <div className="h-3 w-56 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-12 border border-border/50 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <ArrowDownLeft className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Large Transfers Detected
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          No STO transfers above 50K have been detected to or from Binance in the
          last hour. The feed will update automatically when new transfers occur.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Live Transfer Feed
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          {transfers.length} alerts
        </span>
      </div>
      <AnimatePresence mode="popLayout">
        {transfers.map((tx, i) => (
          <TransferRow key={tx.id} tx={tx} index={i} />
        ))}
      </AnimatePresence>
    </div>
  );
}
