/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * Header: Minimal top bar with branding, live status indicator, and time window badge
 */
import { Activity, RefreshCw } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface HeaderProps {
  isLoading: boolean;
  lastFetched: number | null;
  onRefresh: () => void;
}

export default function Header({ isLoading, lastFetched, onRefresh }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-panel">
      <div className="container flex items-center justify-between h-16">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[oklch(0.79_0.15_175)] to-[oklch(0.65_0.2_175)] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[oklch(0.13_0.01_270)]" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[oklch(0.79_0.15_175)] animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-tight">
              STO Flow Alerts
            </h1>
            <p className="text-[11px] text-muted-foreground font-mono">
              StakeStone &middot; Binance Exchange
            </p>
          </div>
        </div>

        {/* Right: Status + Controls */}
        <div className="flex items-center gap-4">
          {/* Time window badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.79_0.15_175)] animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">
              1H Window
            </span>
          </div>

          {/* Last updated */}
          {lastFetched && (
            <span className="hidden md:block text-xs font-mono text-muted-foreground">
              Updated {formatTime(lastFetched)}
            </span>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline text-xs">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
