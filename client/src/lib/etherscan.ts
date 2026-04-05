/*
 * Multi-chain exchange flow API service
 * - Ethereum: Blockscout API V2 (free, no key)
 * - Solana: Public RPC (free, no key)
 * Fetches token transfers and identifies exchange flows
 */
import type { AssetConfig } from "../../../shared/const";
import { TIERS } from "../../../shared/const";
import type { ProcessedTransfer, FlowDirection, FlowSummary } from "./types";

// ─── Shared Helpers ─────────────────────────────────────────────────

function getTier(amount: number): "50K+" | "100K+" | "250K+" | null {
  if (amount >= 250_000) return "250K+";
  if (amount >= 100_000) return "100K+";
  if (amount >= 50_000) return "50K+";
  return null;
}

// ─── Ethereum / Blockscout ──────────────────────────────────────────

const BLOCKSCOUT_API = "https://eth.blockscout.com/api/v2";

function isExchangeAddressEth(
  address: string,
  metadata: any,
  walletSet: Set<string>,
  exchangeName: string
): boolean {
  const lower = address.toLowerCase();
  if (walletSet.has(lower)) return true;
  if (metadata?.tags) {
    return metadata.tags.some(
      (tag: any) =>
        tag.slug?.includes(exchangeName) ||
        tag.name?.toLowerCase().includes(exchangeName)
    );
  }
  return false;
}

function getExchangeLabelEth(
  address: string,
  metadata: any,
  wallets: Record<string, string>,
  exchangeName: string,
  exchangeLabel: string
): string {
  const lower = address.toLowerCase();
  if (wallets[lower]) return wallets[lower];
  if (metadata?.tags) {
    const nameTag = metadata.tags.find(
      (tag: any) =>
        tag.tagType === "name" &&
        tag.name?.toLowerCase().includes(exchangeName)
    );
    if (nameTag) return nameTag.name;
  }
  return exchangeLabel;
}

interface BlockscoutTransferItem {
  transaction_hash: string;
  block_number: number;
  timestamp: string;
  from: { hash: string; metadata?: any };
  to: { hash: string; metadata?: any };
  total: { value: string; decimals: string };
  method: string;
  token: { symbol: string; name: string; decimals: string };
}

async function fetchBlockscoutPage(
  contractAddress: string,
  nextPageParams?: { index: number; block_number: number }
): Promise<{
  items: BlockscoutTransferItem[];
  next_page_params: { index: number; block_number: number } | null;
}> {
  let url = `${BLOCKSCOUT_API}/tokens/${contractAddress}/transfers`;
  if (nextPageParams) {
    url += `?index=${nextPageParams.index}&block_number=${nextPageParams.block_number}`;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Blockscout API error: ${response.status}`);
    const data = await response.json();
    return { items: data.items || [], next_page_params: data.next_page_params || null };
  } catch (error) {
    console.error("Blockscout fetch error:", error);
    return { items: [], next_page_params: null };
  }
}

async function fetchEthereumTransfers(
  asset: AssetConfig,
  timeWindowMs: number
): Promise<ProcessedTransfer[]> {
  const walletSet = new Set(Object.keys(asset.exchangeWallets).map((a) => a.toLowerCase()));
  const allTransfers: ProcessedTransfer[] = [];
  const seenHashes = new Set<string>();
  const cutoff = Date.now() - timeWindowMs;
  const exchangeName = asset.exchange;

  let nextPageParams: { index: number; block_number: number } | undefined;
  let pageCount = 0;
  const maxPages = Math.min(20, Math.ceil(timeWindowMs / (60 * 60 * 1000)) * 10);

  while (pageCount < maxPages) {
    const { items, next_page_params } = await fetchBlockscoutPage(
      asset.contractAddress,
      nextPageParams
    );
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

      const isExFrom = isExchangeAddressEth(fromAddr, fromMeta, walletSet, exchangeName);
      const isExTo = isExchangeAddressEth(toAddr, toMeta, walletSet, exchangeName);

      if (!isExFrom && !isExTo) continue;
      if (isExFrom && isExTo) continue;

      const valueStr = item.total?.value || "0";
      const decimals = parseInt(item.total?.decimals || String(asset.decimals));
      const amount = parseFloat(valueStr) / Math.pow(10, decimals);
      const tier = getTier(amount);
      if (tier === null) continue;

      let direction: FlowDirection;
      let exchangeWalletLabel: string;

      if (isExTo && !isExFrom) {
        direction = "inflow";
        exchangeWalletLabel = getExchangeLabelEth(toAddr, toMeta, asset.exchangeWallets, exchangeName, asset.exchangeLabel);
      } else {
        direction = "outflow";
        exchangeWalletLabel = getExchangeLabelEth(fromAddr, fromMeta, asset.exchangeWallets, exchangeName, asset.exchangeLabel);
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
        exchangeWalletLabel,
        tier,
        assetId: asset.id,
        symbol: asset.symbol,
        chain: asset.chain,
      });
    }

    if (oldestTimestamp < cutoff) break;
    if (!next_page_params) break;
    nextPageParams = next_page_params;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  allTransfers.sort((a, b) => b.timestamp - a.timestamp);
  return allTransfers;
}

// ─── Solana / RPC ───────────────────────────────────────────────────

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function solanaRpc(method: string, params: any[]): Promise<any> {
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function fetchSolanaTransfers(
  asset: AssetConfig,
  timeWindowMs: number
): Promise<ProcessedTransfer[]> {
  if (!asset.solanaTokenAccount || !asset.solanaExchangeOwner) {
    console.error("Missing Solana config for", asset.symbol);
    return [];
  }

  const tokenAccount = asset.solanaTokenAccount;
  const exchangeOwner = asset.solanaExchangeOwner.toLowerCase();
  const cutoff = Math.floor((Date.now() - timeWindowMs) / 1000); // unix seconds
  const allTransfers: ProcessedTransfer[] = [];
  const seenSigs = new Set<string>();

  let before: string | undefined;
  let pageCount = 0;
  const maxPages = Math.min(30, Math.ceil(timeWindowMs / (60 * 60 * 1000)) * 15);

  while (pageCount < maxPages) {
    const sigParams: any = { limit: 50 };
    if (before) sigParams.before = before;

    const sigs = await solanaRpc("getSignaturesForAddress", [tokenAccount, sigParams]);
    pageCount++;

    if (!sigs || sigs.length === 0) break;

    let oldestBlockTime = Infinity;

    // Fetch each transaction to parse the transfer
    for (const sig of sigs) {
      if (sig.err) continue;
      if (seenSigs.has(sig.signature)) continue;
      if (sig.blockTime && sig.blockTime < cutoff) {
        oldestBlockTime = Math.min(oldestBlockTime, sig.blockTime);
        continue;
      }

      seenSigs.add(sig.signature);
      oldestBlockTime = Math.min(oldestBlockTime, sig.blockTime || Infinity);

      try {
        const tx = await solanaRpc("getTransaction", [
          sig.signature,
          { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
        ]);

        if (!tx || !tx.meta) continue;

        // Find SPL token transfer instructions
        const instructions = tx.transaction?.message?.instructions || [];
        const innerIxs = (tx.meta.innerInstructions || []).flatMap((i: any) => i.instructions || []);
        const allIxs = [...instructions, ...innerIxs];

        for (const ix of allIxs) {
          if (!ix.parsed) continue;
          const { type, info } = ix.parsed;

          if (type !== "transfer" && type !== "transferChecked") continue;
          if (!info) continue;

          // Check if this transfer involves our token
          const mint = info.mint;
          if (type === "transferChecked" && mint !== asset.contractAddress) continue;

          const amount =
            type === "transferChecked"
              ? parseFloat(info.tokenAmount?.uiAmountString || "0")
              : parseFloat(info.amount || "0") / Math.pow(10, asset.decimals);

          if (amount <= 0) continue;

          const tier = getTier(amount);
          if (tier === null) continue;

          const source = (info.source || "").toLowerCase();
          const destination = (info.destination || "").toLowerCase();
          const authority = (info.authority || "").toLowerCase();

          // Determine direction based on exchange token account
          const exchangeTokenAcct = tokenAccount.toLowerCase();
          let direction: FlowDirection;

          if (destination === exchangeTokenAcct) {
            direction = "inflow";
          } else if (source === exchangeTokenAcct || authority === exchangeOwner) {
            direction = "outflow";
          } else {
            continue;
          }

          allTransfers.push({
            id: sig.signature + "-" + direction,
            hash: sig.signature,
            timestamp: (sig.blockTime || Math.floor(Date.now() / 1000)) * 1000,
            direction,
            amount,
            from: info.authority || info.source || "",
            to: info.destination || "",
            exchangeWalletLabel: asset.exchangeLabel,
            tier,
            assetId: asset.id,
            symbol: asset.symbol,
            chain: asset.chain,
          });
          break; // One transfer per tx is enough
        }
      } catch (err) {
        console.warn("Failed to parse Solana tx:", sig.signature, err);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (oldestBlockTime < cutoff) break;
    before = sigs[sigs.length - 1]?.signature;
    if (!before) break;
  }

  allTransfers.sort((a, b) => b.timestamp - a.timestamp);
  return allTransfers;
}

// ─── Public API ─────────────────────────────────────────────────────

export async function fetchExchangeTransfers(
  asset: AssetConfig,
  timeWindowMs: number
): Promise<ProcessedTransfer[]> {
  if (asset.chain === "ethereum") {
    return fetchEthereumTransfers(asset, timeWindowMs);
  } else if (asset.chain === "solana") {
    return fetchSolanaTransfers(asset, timeWindowMs);
  }
  return [];
}

export function filterByTimeWindow(
  transfers: ProcessedTransfer[],
  windowMs: number
): ProcessedTransfer[] {
  const cutoff = Date.now() - windowMs;
  return transfers.filter((t) => t.timestamp >= cutoff);
}

export function computeSummary(transfers: ProcessedTransfer[]): FlowSummary {
  let totalInflow = 0;
  let totalOutflow = 0;
  let inflowCount = 0;
  let outflowCount = 0;

  const tierMap = new Map<
    string,
    { inflowCount: number; inflowTotal: number; outflowCount: number; outflowTotal: number }
  >();

  for (const tier of TIERS) {
    tierMap.set(tier.label, { inflowCount: 0, inflowTotal: 0, outflowCount: 0, outflowTotal: 0 });
  }

  for (const tx of transfers) {
    if (tx.direction === "inflow") {
      totalInflow += tx.amount;
      inflowCount++;
    } else {
      totalOutflow += tx.amount;
      outflowCount++;
    }

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
