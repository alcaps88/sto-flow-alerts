/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * FlowSummaryPanel: Left column with key metrics, net flow, and tier breakdown
 */
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber, formatFullNumber } from "@/lib/utils";
import type { FlowSummary } from "@/lib/types";
import { motion } from "framer-motion";
import FlowChart from "./FlowChart";

interface FlowSummaryPanelProps {
  summary: FlowSummary | null;
  isLoading: boolean;
}

export default function FlowSummaryPanel({ summary, isLoading }: FlowSummaryPanelProps) {
  if (isLoading && !summary) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel rounded-xl p-5 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const netFlowPositive = summary.netFlow >= 0;

  return (
    <div className="space-y-4">
      {/* Net Flow Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-xl p-5 border ${
          netFlowPositive
            ? "border-[oklch(0.79_0.15_175/0.3)] glow-inflow"
            : "border-[oklch(0.7_0.17_20/0.3)] glow-outflow"
        } glass-panel`}
      >
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{
            background: netFlowPositive ? "oklch(0.79 0.15 175)" : "oklch(0.7 0.17 20)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            {netFlowPositive ? (
              <TrendingUp className="w-4 h-4 text-[oklch(0.79_0.15_175)]" />
            ) : summary.netFlow < 0 ? (
              <TrendingDown className="w-4 h-4 text-[oklch(0.7_0.17_20)]" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Net Flow (1H)
            </span>
          </div>
          <p
            className={`text-3xl font-bold font-mono tracking-tight ${
              netFlowPositive ? "text-[oklch(0.79_0.15_175)]" : "text-[oklch(0.7_0.17_20)]"
            }`}
          >
            {summary.netFlow > 0 ? "+" : ""}
            {formatNumber(summary.netFlow)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {formatFullNumber(Math.abs(summary.netFlow))} STO
          </p>
        </div>
      </motion.div>

      {/* Inflow Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-panel rounded-xl p-5 border border-border/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[oklch(0.79_0.15_175/0.15)] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-[oklch(0.79_0.15_175)]" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Inflow
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {summary.inflowCount} txns
          </span>
        </div>
        <p className="text-2xl font-bold font-mono text-[oklch(0.79_0.15_175)]">
          {formatNumber(summary.totalInflow)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          {formatFullNumber(summary.totalInflow)} STO
        </p>
      </motion.div>

      {/* Outflow Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-5 border border-border/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[oklch(0.7_0.17_20/0.15)] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[oklch(0.7_0.17_20)]" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Outflow
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {summary.outflowCount} txns
          </span>
        </div>
        <p className="text-2xl font-bold font-mono text-[oklch(0.7_0.17_20)]">
          {formatNumber(summary.totalOutflow)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          {formatFullNumber(summary.totalOutflow)} STO
        </p>
      </motion.div>

      {/* Flow Comparison Chart */}
      <FlowChart summary={summary} />

      {/* Tier Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-panel rounded-xl p-5 border border-border/50"
      >
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Tier Breakdown
        </h3>
        <div className="space-y-3">
          {summary.tiers.map((tier) => {
            const badgeClass =
              tier.label === "250K+"
                ? "tier-badge-250k"
                : tier.label === "100K+"
                ? "tier-badge-100k"
                : "tier-badge-50k";

            return (
              <div key={tier.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${badgeClass}`}>
                    {tier.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {tier.inflowCount + tier.outflowCount} txns
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[oklch(0.79_0.15_175/0.08)] rounded-lg px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-0.5">In</p>
                    <p className="text-sm font-mono font-semibold text-[oklch(0.79_0.15_175)]">
                      {formatNumber(tier.inflowTotal)}
                    </p>
                  </div>
                  <div className="bg-[oklch(0.7_0.17_20/0.08)] rounded-lg px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Out</p>
                    <p className="text-sm font-mono font-semibold text-[oklch(0.7_0.17_20)]">
                      {formatNumber(tier.outflowTotal)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
