/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * Home: Main dashboard page with asymmetric two-column layout
 * Left (40%): Summary stats, net flow, tier breakdown
 * Right (60%): Real-time scrolling transfer alert feed with filters
 * Background: Hero image with subtle pattern overlay
 */
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FlowSummaryPanel from "@/components/FlowSummaryPanel";
import TransferFeed from "@/components/TransferFeed";
import FilterBar, { type DirectionFilter, type TierFilter } from "@/components/FilterBar";
import NotificationBanner from "@/components/NotificationBanner";
import { useFlowData } from "@/hooks/useFlowData";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663465313496/jmtzHDeWfQwYYV4QhDDE2b/hero-bg-KXS59LMU6CPx3cx9J5FgWy.webp";
const INFLOW_ORB = "https://d2xsxph8kpxj0f.cloudfront.net/310519663465313496/jmtzHDeWfQwYYV4QhDDE2b/inflow-orb-77XP2ZmSGKLJHtn4gSBgXZ.webp";
const OUTFLOW_ORB = "https://d2xsxph8kpxj0f.cloudfront.net/310519663465313496/jmtzHDeWfQwYYV4QhDDE2b/outflow-orb-g5kqmnTWEiCgBFQmfd8LkP.webp";

export default function Home() {
  const { transfers, summary, isLoading, error, lastFetched, refresh } = useFlowData();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  const filteredTransfers = useMemo(() => {
    const tierMinMap: Record<string, number> = { "50K+": 50_000, "100K+": 100_000, "250K+": 250_000 };
    return transfers.filter((tx) => {
      if (directionFilter !== "all" && tx.direction !== directionFilter) return false;
      if (tierFilter !== "all") {
        const minForTier = tierMinMap[tierFilter] || 0;
        if (tx.amount < minForTier) return false;
      }
      return true;
    });
  }, [transfers, directionFilter, tierFilter]);

  return (
    <div className="min-h-screen relative">
      {/* Background layers */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
      </div>

      {/* Floating orbs (decorative) */}
      <div className="fixed top-20 left-10 w-48 h-48 opacity-10 blur-2xl pointer-events-none z-0">
        <img src={INFLOW_ORB} alt="" className="w-full h-full" />
      </div>
      <div className="fixed bottom-20 right-10 w-48 h-48 opacity-10 blur-2xl pointer-events-none z-0">
        <img src={OUTFLOW_ORB} alt="" className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header isLoading={isLoading} lastFetched={lastFetched} onRefresh={refresh} />

        <main className="container py-6">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[oklch(0.7_0.17_20/0.1)] border border-[oklch(0.7_0.17_20/0.3)] text-sm text-[oklch(0.7_0.17_20)]">
              <strong>Error:</strong> {error}. Data may be stale. Retrying automatically...
            </div>
          )}

          {/* Info banner about API */}
          <div className="mb-6 p-3 rounded-xl bg-secondary/30 border border-border/30 text-xs text-muted-foreground flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.8_0.16_85)] shrink-0" />
            <span>
              Monitoring STO (StakeStone) transfers to/from Binance wallets via Blockscout API.
              Free, no API key required. Tracks transfers above 50K STO within a 1-hour rolling window.
              Data refreshes every 30 seconds automatically.
            </span>
          </div>

          {/* Notification permission prompt */}
          <NotificationBanner />

          {/* Dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            {/* Left column: Summary */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <FlowSummaryPanel summary={summary} isLoading={isLoading} />
            </aside>

            {/* Right column: Feed */}
            <section>
              {/* Filters */}
              <div className="mb-4">
                <FilterBar
                  directionFilter={directionFilter}
                  tierFilter={tierFilter}
                  onDirectionChange={setDirectionFilter}
                  onTierChange={setTierFilter}
                />
              </div>

              {/* Transfer feed */}
              <TransferFeed transfers={filteredTransfers} isLoading={isLoading} />
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/30 mt-12">
          <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-mono">
              STO Flow Alerts &middot; StakeStone Exchange Monitor
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a
                href="https://etherscan.io/token/0x1D88713b483A8E45cfF0e5CD7c2e15E5Fab4534d"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Token Contract
              </a>
              <a
                href="https://www.binance.com/en/price/stakestone"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Binance
              </a>
              <a
                href="https://docs.stakestone.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                StakeStone Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
