import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchExchangeTransfers,
  filterByTimeWindow,
  computeSummary,
} from "@/lib/etherscan";
import type { ProcessedTransfer, FlowSummary } from "@/lib/types";
import type { AssetConfig, TimeRangeOption } from "../../../shared/const";
import { POLL_INTERVAL } from "../../../shared/const";
import { formatFullNumber } from "@/lib/utils";

function sendNotification(tx: ProcessedTransfer) {
  if ("Notification" in window && Notification.permission === "granted") {
    const direction = tx.direction === "inflow" ? "INFLOW" : "OUTFLOW";
    const icon = tx.direction === "inflow" ? "\u2B07" : "\u2B06";
    new Notification(
      `${icon} ${tx.symbol} ${direction}: ${formatFullNumber(tx.amount)} ${tx.symbol}`,
      {
        body: `${tx.tier} transfer ${tx.direction === "inflow" ? "to" : "from"} ${tx.exchangeWalletLabel}`,
        tag: tx.id,
      }
    );
  }
}

interface UseFlowDataReturn {
  transfers: ProcessedTransfer[];
  summary: FlowSummary | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  refresh: () => void;
}

export function useFlowData(
  asset: AssetConfig,
  timeRange: TimeRangeOption
): UseFlowDataReturn {
  const [allTransfers, setAllTransfers] = useState<ProcessedTransfer[]>([]);
  const [transfers, setTransfers] = useState<ProcessedTransfer[]>([]);
  const [summary, setSummary] = useState<FlowSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownHashesRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  // Reset state when asset or time range changes
  useEffect(() => {
    setAllTransfers([]);
    setTransfers([]);
    setSummary(null);
    setIsLoading(true);
    setError(null);
    setLastFetched(null);
    knownHashesRef.current = new Set();
    isFirstFetchRef.current = true;
  }, [asset.id, timeRange.hours]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchExchangeTransfers(asset, timeRange.ms);
      setAllTransfers(data);

      const filtered = filterByTimeWindow(data, timeRange.ms);

      // Check for new transfers and send browser notifications
      if (!isFirstFetchRef.current) {
        for (const tx of filtered) {
          if (!knownHashesRef.current.has(tx.id)) {
            sendNotification(tx);
          }
        }
      }

      knownHashesRef.current = new Set(filtered.map((t) => t.id));
      isFirstFetchRef.current = false;

      setTransfers(filtered);
      setSummary(computeSummary(filtered));
      setLastFetched(Date.now());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transfer data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [asset, timeRange]);

  // Recompute filtered data when time passes (every 10s)
  useEffect(() => {
    if (allTransfers.length === 0) return;

    const recomputeInterval = setInterval(() => {
      const filtered = filterByTimeWindow(allTransfers, timeRange.ms);
      setTransfers(filtered);
      setSummary(computeSummary(filtered));
    }, 10_000);

    return () => clearInterval(recomputeInterval);
  }, [allTransfers, timeRange.ms]);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  return {
    transfers,
    summary,
    isLoading,
    error,
    lastFetched,
    refresh: fetchData,
  };
}
