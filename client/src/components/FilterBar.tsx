/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * FilterBar: Horizontal filter controls for direction and tier
 */
import { ArrowDownLeft, ArrowUpRight, Layers } from "lucide-react";

export type DirectionFilter = "all" | "inflow" | "outflow";
export type TierFilter = "all" | "50K+" | "100K+" | "250K+";

interface FilterBarProps {
  directionFilter: DirectionFilter;
  tierFilter: TierFilter;
  onDirectionChange: (filter: DirectionFilter) => void;
  onTierChange: (filter: TierFilter) => void;
}

export default function FilterBar({
  directionFilter,
  tierFilter,
  onDirectionChange,
  onTierChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Direction Filters */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border/30">
        <button
          onClick={() => onDirectionChange("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            directionFilter === "all"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-3 h-3" />
          All
        </button>
        <button
          onClick={() => onDirectionChange("inflow")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            directionFilter === "inflow"
              ? "bg-[oklch(0.79_0.15_175/0.15)] text-[oklch(0.79_0.15_175)] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownLeft className="w-3 h-3" />
          Inflow
        </button>
        <button
          onClick={() => onDirectionChange("outflow")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            directionFilter === "outflow"
              ? "bg-[oklch(0.7_0.17_20/0.15)] text-[oklch(0.7_0.17_20)] shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpRight className="w-3 h-3" />
          Outflow
        </button>
      </div>

      {/* Tier Filters */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border/30">
        <button
          onClick={() => onTierChange("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
            tierFilter === "all"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Tiers
        </button>
        <button
          onClick={() => onTierChange("50K+")}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
            tierFilter === "50K+"
              ? "tier-badge-50k shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          50K+
        </button>
        <button
          onClick={() => onTierChange("100K+")}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
            tierFilter === "100K+"
              ? "tier-badge-100k shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          100K+
        </button>
        <button
          onClick={() => onTierChange("250K+")}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
            tierFilter === "250K+"
              ? "tier-badge-250k shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          250K+
        </button>
      </div>
    </div>
  );
}
