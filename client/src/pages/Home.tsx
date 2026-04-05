/*
 * Design: Obsidian Flow — Dark Luxury Financial Dashboard
 * Home: Main dashboard page — two-column layout with summary + feed
 * Supports multi-asset selection and adjustable time range
 */
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import FlowSummaryPanel from "@/components/FlowSummaryPanel";
import TransferFeed from "@/components/TransferFeed";
import FilterBar from "@/components/FilterBar";
import type { DirectionFilter, TierFilter } from "@/components/FilterBar";
import NotificationBanner from "@/components/NotificationBanner";
import { useFlowData } from "@/hooks/useFlowData";
import { ASSET_MAP, DEFAULT_ASSET_ID, DEFAULT_TIME_RANGE } from "../../../shared/const";
import type { AssetConfig, TimeRangeOption } from "../../../shared/const";
import { Info } from "lucide-react";

export default function Home() {
  // Asset & time range state
  const [selectedAsset, setSelectedAsset] = useState<AssetConfig>(
    ASSET_MAP[DEFAULT_ASSET_ID]
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>(
    DEFAULT_TIME_RANGE
  );

  // Filter state
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  // Data hook
  const { transfers, summary, isLoading, lastFetched, refresh } = useFlowData(
    selectedAsset,
    selectedTimeRange
  );

  // Apply filters
  const filteredTransfers = useMemo(() => {
    return transfers.filter((tx) => {
      if (directionFilter !== "all" && tx.direction !== directionFilter) return false;
      if (tierFilter !== "all") {
        const tierMin =
          tierFilter === "250K+" ? 250_000 : tierFilter === "100K+" ? 100_000 : 50_000;
        if (tx.amount < tierMin) return false;
      }
      return true;
    });
  }, [transfers, directionFilter, tierFilter]);

  // Data source label
  const dataSourceLabel =
    selectedAsset.chain === "ethereum"
      ? "Blockscout API"
      : "Solana RPC";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoading={isLoading}
        lastFetched={lastFetched}
        onRefresh={refresh}
        asset={selectedAsset}
        timeRange={selectedTimeRange}
      />

      <main className="flex-1 container py-6">
        {/* Notification Banner */}
        <NotificationBanner />

        {/* Info Banner */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30 mb-6">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Monitoring <span className="text-foreground font-medium">{selectedAsset.symbol}</span> transfers
            {" "}to/from <span className="text-foreground font-medium">{selectedAsset.exchangeLabel}</span> on{" "}
            <span className="text-foreground font-medium">{selectedAsset.chain === "ethereum" ? "Ethereum" : "Solana"}</span>.
            Data from {dataSourceLabel} (free, no API key). Auto-refreshes every 30s.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            directionFilter={directionFilter}
            tierFilter={tierFilter}
            selectedAsset={selectedAsset}
            selectedTimeRange={selectedTimeRange}
            onDirectionChange={setDirectionFilter}
            onTierChange={setTierFilter}
            onAssetChange={(asset) => {
              setSelectedAsset(asset);
              setDirectionFilter("all");
              setTierFilter("all");
            }}
            onTimeRangeChange={setSelectedTimeRange}
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
          {/* Left: Summary Panel */}
          <div className="order-2 lg:order-1">
            <FlowSummaryPanel
              summary={summary}
              isLoading={isLoading}
              symbol={selectedAsset.symbol}
              timeLabel={selectedTimeRange.label}
            />
          </div>

          {/* Right: Transfer Feed */}
          <div className="order-1 lg:order-2">
            <TransferFeed
              transfers={filteredTransfers}
              isLoading={isLoading}
              asset={selectedAsset}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-4">
        <div className="container flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground font-mono">
            Flow Alerts &middot; {selectedAsset.symbol}/{selectedAsset.exchangeLabel}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={selectedAsset.tokenPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              Token Explorer
            </a>
            <a
              href={selectedAsset.exchangeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {selectedAsset.exchangeLabel}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
