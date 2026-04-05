/*
 * Blockscout API V2 — Free, no API key required
 * Fetches STO token transfers and identifies Binance exchange flows
 * Uses Blockscout metadata tags to identify exchange wallets
 */
import {
  STO_TOKEN,
  BINANCE_WALLETS,
  BINANCE_WALLET_SET,
  TIERS,
} from "../../../shared/const";
import type {
  ProcessedTransfer,
  FlowDirection,
} from "./types";

const BLOCKSCOUT_API = "https://eth.blockscout.com/api/v2";

function isBinanceAddress(address: string, metadata: any): boolean {
  const lower = address.toLowerCase();
  // Check our known list first
  if (BINANCE_WALLET_SET.has(lower)) return true;
  // Check Blockscout metadata tags
  if (metadata?.tags) {
    return metadata.tags.some(
      (tag: any) =>
        tag.slug?.includes("binance") ||
        tag.name?.toLowerCase().includes("binance")
    );
  }
  return false;
}

function getBinanceLabel(address: string, metadata: any): string {
  const lower = address.toLowerCase();
  // Check our known list first
  if (BINANCE_WALLETS[lower]) return BINANCE_WALLETS[lower];
  // Use Blockscout tag
  if (metadata?.tags) {
    const nameTag = metadata.tags.find(
      (tag: any) =>
        tag.tagType === "name" &&
        tag.name?.toLowerCase().includes("binance")
    );
    if (nameTag) return nameTag.name;
    const protocolTag = metadata.tags.find(
      (tag: any) => tag.tagType === "protocol" && tag.slug?.includes("binance")
    );
    if (protocolTag) return protocolTag.name;
  }
  return "Binance";
}

function getTier(amount: number): "50K+" | "100K+" | "250K+" | null {
  if (amount >= 250_000) return "250K+";
  if (amount >= 100_000) return "100K+";
  if (amount >= 50_000) return "50K+";
  return null;
}

interface BlockscoutTransferItem {
  transaction_hash: string;
  block_number: number;
  timestamp: string;
  from: {
    hash: string;
    metadata?: { tags?: Array<{ name: string; slug: string; tagType: string }> };
  };
  to: {
    hash: string;
    metadata?: { tags?: Array<{ name: string; slug: string; tagType: string }> };
  };
  total: {
    value: string;
    decimals: string;
  };
  method: string;
  token: {
    symbol: string;
    name: string;
    decimals: string;
  };
}

async function fetchTransferPage(
  nextPageParams?: { index: number; block_number: number }
): Promise<{
  items: BlockscoutTransferItem[];
  next_page_params: { index: number; block_number: number } | null;
}> {
  let url = `${BLOCKSCOUT_API}/tokens/${STO_TOKEN.contractAddress}/transfers`;

  if (nextPageParams) {
    url += `?index=${nextPageParams.index}&block_number=${nextPageParams.block_number}`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Blockscout API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      items: data.items || [],
      next_page_params: data.next_page_params || null,
    };
  } catch (error) {
    console.error("Error fetching from Blockscout:", error);
    return { items: [], next_page_params: null };
  }
}

export async function fetchAllBinanceTransfers(): Promise<ProcessedTransfer[]> {
  const allTransfers: ProcessedTransfer[] = [];
  const seenHashes = new Set<string>();
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  let nextPageParams: { index: number; block_number: number } | undefined;
  let pageCount = 0;
  const maxPages = 10; // Limit to avoid excessive requests

  while (pageCount < maxPages) {
    const { items, next_page_params } = await fetchTransferPage(nextPageParams);
    pageCount++;

    if (items.length === 0) break;

    let oldestTimestamp = Infinity;

    for (const item of items) {
      const txHash = item.transaction_hash;
      if (!txHash || seenHashes.has(txHash)) continue;

      const timestamp = new Date(item.timestamp).getTime();
      oldestTimestamp = Math.min(oldestTimestamp, timestamp);

      const fromAddr = item.from.hash;
      const toAddr = item.to.hash;
      const fromMeta = item.from.metadata;
      const toMeta = item.to.metadata;

      const isBinanceFrom = isBinanceAddress(fromAddr, fromMeta);
      const isBinanceTo = isBinanceAddress(toAddr, toMeta);

      // Skip if neither side is Binance, or if internal Binance transfer
      if (!isBinanceFrom && !isBinanceTo) continue;
      if (isBinanceFrom && isBinanceTo) continue;

      const valueStr = item.total?.value || "0";
      const decimals = parseInt(item.total?.decimals || "18");
      const amount = parseFloat(valueStr) / Math.pow(10, decimals);

      const tier = getTier(amount);
      if (tier === null) continue; // Skip transfers below 50K

      let direction: FlowDirection;
      let binanceWalletLabel: string;

      if (isBinanceTo && !isBinanceFrom) {
        direction = "inflow";
        binanceWalletLabel = getBinanceLabel(toAddr, toMeta);
      } else {
        direction = "outflow";
        binanceWalletLabel = getBinanceLabel(fromAddr, fromMeta);
      }

      seenHashes.add(txHash);
      allTransfers.push({
        id: txHash + "-" + direction,
        hash: txHash,
        timestamp,
        direction,
        amount,
        from: fromAddr,
        to: toAddr,
        binanceWalletLabel,
        tier,
      });
    }

    // Stop if we've gone past our time window
    if (oldestTimestamp < oneHourAgo) break;

    // Move to next page
    if (!next_page_params) break;
    nextPageParams = next_page_params;

    // Small delay to be respectful
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Sort by timestamp descending
  allTransfers.sort((a, b) => b.timestamp - a.timestamp);
  return allTransfers;
}

export function filterByTimeWindow(
  transfers: ProcessedTransfer[],
  windowMs: number
): ProcessedTransfer[] {
  const cutoff = Date.now() - windowMs;
  return transfers.filter((t) => t.timestamp >= cutoff);
}

export function computeSummary(transfers: ProcessedTransfer[]) {
  let totalInflow = 0;
  let totalOutflow = 0;
  let inflowCount = 0;
  let outflowCount = 0;

  const tierMap = new Map<
    string,
    {
      inflowCount: number;
      inflowTotal: number;
      outflowCount: number;
      outflowTotal: number;
    }
  >();

  for (const tier of TIERS) {
    tierMap.set(tier.label, {
      inflowCount: 0,
      inflowTotal: 0,
      outflowCount: 0,
      outflowTotal: 0,
    });
  }

  for (const tx of transfers) {
    if (tx.direction === "inflow") {
      totalInflow += tx.amount;
      inflowCount++;
    } else {
      totalOutflow += tx.amount;
      outflowCount++;
    }

    // Each transfer counts in ALL tiers it qualifies for (cumulative)
    // e.g., a 123K transfer counts in both 50K+ and 100K+
    for (const tier of TIERS) {
      if (tx.amount >= tier.min) {
        const tierData = tierMap.get(tier.label);
        if (tierData) {
          if (tx.direction === "inflow") {
            tierData.inflowCount++;
            tierData.inflowTotal += tx.amount;
          } else {
            tierData.outflowCount++;
            tierData.outflowTotal += tx.amount;
          }
        }
      }
    }
  }

  return {
    totalInflow,
    totalOutflow,
    netFlow: totalInflow - totalOutflow,
    inflowCount,
    outflowCount,
    tiers: TIERS.map((tier) => ({
      label: tier.label,
      min: tier.min,
      ...(tierMap.get(tier.label) || {
        inflowCount: 0,
        inflowTotal: 0,
        outflowCount: 0,
        outflowTotal: 0,
      }),
    })),
    lastUpdated: Date.now(),
  };
}
