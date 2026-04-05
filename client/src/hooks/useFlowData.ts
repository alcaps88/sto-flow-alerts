import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAllBinanceTransfers,
  filterByTimeWindow,
  computeSummary,
} from "@/lib/etherscan";
import type { ProcessedTransfer, FlowSummary } from "@/lib/types";
import { POLL_INTERVAL, TIME_WINDOW } from "../../../shared/const";
import { formatFullNumber } from "@/lib/utils";

function sendNotification(tx: ProcessedTransfer) {
  if ("Notification" in window && Notification.permission === "granted") {
    const direction = tx.direction === "inflow" ? "INFLOW" : "OUTFLOW";
    const icon = tx.direction === "inflow" ? "\u2B07" : "\u2B06";
    new Notification(`${icon} STO ${direction}: ${formatFullNumber(tx.amount)} STO`, {
      body: `${tx.tier} transfer ${tx.direction === "inflow" ? "to" : "from"} ${tx.binanceWalletLabel}`,
      tag: tx.id,
    });
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

export function useFlowData(): UseFlowDataReturn {
  const [allTransfers, setAllTransfers] = useState<ProcessedTransfer[]>([]);
  const [transfers, setTransfers] = useState<ProcessedTransfer[]>([]);
  const [summary, setSummary] = useState<FlowSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownHashesRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchAllBinanceTransfers();
      setAllTransfers(data);

      const filtered = filterByTimeWindow(data, TIME_WINDOW);

      // Check for new transfers and send browser notifications
      if (!isFirstFetchRef.current) {
        for (const tx of filtered) {
          if (!knownHashesRef.current.has(tx.id)) {
            // New transfer detected!
            sendNotification(tx);
          }
        }
      }

      // Update known hashes
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
  }, []);

  // Recompute filtered data when time passes (every 10s)
  useEffect(() => {
    if (allTransfers.length === 0) return;

    const recomputeInterval = setInterval(() => {
      const filtered = filterByTimeWindow(allTransfers, TIME_WINDOW);
      setTransfers(filtered);
      setSummary(computeSummary(filtered));
    }, 10_000);

    return () => clearInterval(recomputeInterval);
  }, [allTransfers]);

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
