/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * FlowChart: Visual bar comparison of inflow vs outflow
 */
import { formatNumber } from "@/lib/utils";
import type { FlowSummary } from "@/lib/types";
import { motion } from "framer-motion";

interface FlowChartProps {
  summary: FlowSummary;
}

export default function FlowChart({ summary }: FlowChartProps) {
  const maxValue = Math.max(summary.totalInflow, summary.totalOutflow, 1);

  const inflowWidth = (summary.totalInflow / maxValue) * 100;
  const outflowWidth = (summary.totalOutflow / maxValue) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-xl p-5 border border-border/50"
    >
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Flow Comparison
      </h3>

      <div className="space-y-3">
        {/* Inflow bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[oklch(0.79_0.15_175)] font-medium">
              Inflow
            </span>
            <span className="text-xs font-mono text-[oklch(0.79_0.15_175)]">
              {formatNumber(summary.totalInflow)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${inflowWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, oklch(0.79 0.15 175 / 0.6), oklch(0.79 0.15 175))",
              }}
            />
          </div>
        </div>

        {/* Outflow bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[oklch(0.7_0.17_20)] font-medium">
              Outflow
            </span>
            <span className="text-xs font-mono text-[oklch(0.7_0.17_20)]">
              {formatNumber(summary.totalOutflow)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-secondary/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${outflowWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, oklch(0.7 0.17 20 / 0.6), oklch(0.7 0.17 20))",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
