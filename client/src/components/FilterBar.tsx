/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * FilterBar: Horizontal filter controls for direction, tier, time range, and asset selection
 */
import { ArrowDownLeft, ArrowUpRight, Layers, Clock, ChevronDown } from "lucide-react";
import { ASSETS, TIME_RANGES } from "../../../shared/const";
import type { AssetConfig, TimeRangeOption } from "../../../shared/const";
import { useState, useRef, useEffect } from "react";

export type DirectionFilter = "all" | "inflow" | "outflow";
export type TierFilter = "all" | "50K+" | "100K+" | "250K+";

interface FilterBarProps {
  directionFilter: DirectionFilter;
  tierFilter: TierFilter;
  selectedAsset: AssetConfig;
  selectedTimeRange: TimeRangeOption;
  onDirectionChange: (filter: DirectionFilter) => void;
  onTierChange: (filter: TierFilter) => void;
  onAssetChange: (asset: AssetConfig) => void;
  onTimeRangeChange: (range: TimeRangeOption) => void;
}

function AssetDropdown({
  selected,
  onChange,
}: {
  selected: AssetConfig;
  onChange: (asset: AssetConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors text-xs font-medium"
      >
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-foreground">{selected.symbol}</span>
          <span className="text-muted-foreground hidden sm:inline">/ {selected.exchangeLabel}</span>
        </div>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 rounded-xl glass-panel border border-border/50 shadow-xl overflow-hidden">
          {ASSETS.map((asset) => (
            <button
              key={asset.id}
              onClick={() => {
                onChange(asset);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 ${
                selected.id === asset.id ? "bg-secondary/30" : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-foreground">{asset.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground font-mono uppercase">
                    {asset.chain === "ethereum" ? "ETH" : "SOL"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {asset.name} &middot; {asset.exchangeLabel}
                </p>
              </div>
              {selected.id === asset.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.79_0.15_175)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  directionFilter,
  tierFilter,
  selectedAsset,
  selectedTimeRange,
  onDirectionChange,
  onTierChange,
  onAssetChange,
  onTimeRangeChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Asset Selector */}
      <AssetDropdown selected={selectedAsset} onChange={onAssetChange} />

      {/* Time Range */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border/30">
        <Clock className="w-3 h-3 text-muted-foreground ml-1.5" />
        {TIME_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => onTimeRangeChange(range)}
            className={`px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              selectedTimeRange.label === range.label
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

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
