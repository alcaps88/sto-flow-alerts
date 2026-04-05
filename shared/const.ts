export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// ─── Asset Configuration ─────────────────────────────────────────────

export type ChainType = "ethereum" | "solana";

export interface AssetConfig {
  id: string;
  name: string;
  symbol: string;
  chain: ChainType;
  exchange: string;
  exchangeLabel: string;
  /** Token contract address (Ethereum) or mint address (Solana) */
  contractAddress: string;
  decimals: number;
  /** Known exchange wallet addresses (lowercase) → label */
  exchangeWallets: Record<string, string>;
  /** Explorer base URL for transactions */
  explorerTxUrl: (hash: string) => string;
  /** Explorer base URL for token page */
  tokenPageUrl: string;
  /** Exchange trading page */
  exchangeUrl: string;
  /** Solana-specific: exchange wallet owner address */
  solanaExchangeOwner?: string;
  /** Solana-specific: exchange token account for this mint */
  solanaTokenAccount?: string;
}

// ─── StakeStone (STO) — Ethereum / Binance ──────────────────────────

const STO_CONFIG: AssetConfig = {
  id: "sto",
  name: "StakeStone",
  symbol: "STO",
  chain: "ethereum",
  exchange: "binance",
  exchangeLabel: "Binance",
  contractAddress: "0x1D88713b483A8E45cfF0e5CD7c2e15E5Fab4534d",
  decimals: 18,
  exchangeWallets: {
    "0xf977814e90da44bfa03b6295a0616a897441acec": "Binance: Hot Wallet 20",
    "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 14",
    "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 15",
    "0xdfd5293d8e347dfe59e90efd55b2956a1343963d": "Binance 16",
    "0x56eddb7aa87536c09ccc2793473599fd21a8b17f": "Binance 17",
    "0x9696f59e4d72e237be84ffd425dcad154bf96976": "Binance 18",
    "0x4d9ff50ef4da947364bb9650892b2554e7be5e2b": "Binance 19",
    "0x4976a4a02f38326660d17bf34b431dc6e2eb2327": "Binance 20",
    "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "Binance",
    "0xd551234ae421e3bcba99a0da6d736074f22192ff": "Binance 2",
    "0x564286362092d8e7936f0549571a803b203aaced": "Binance 3",
    "0x0681d8db095565fe8a346fa0277bffde9c0edbbf": "Binance 4",
    "0xfe9e8709d3215310075d67e3ed32a380ccf451c8": "Binance 5",
    "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67": "Binance 6",
    "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": "Binance 7",
    "0xf35a6bd6e0459a4b53a27862c51a2a7292b383d1": "Binance 8",
    "0x708396f17127c42383e3b9014072679b2f60b82f": "Binance: Hot Wallet 12",
    "0xe2fc31f816a9b94326492132018c3aecc4a93ae1": "Binance 32",
    "0x8894e0a0c962cb723c1ef8a1b3fde0aac0a5fcf8": "Binance Hot Wallet 6",
    "0x5a52e96bacdabb82fd05763e25335261b270efcb": "Binance 12",
    "0x835678a611b28684005a5e2233695fb6cbbb0007": "Binance: Deposit Hot Wallet",
    "0x515b72ed8a97f42c568d6a143232775018f133c8": "Binance: Hot Wallet 12",
  },
  explorerTxUrl: (hash) => `https://etherscan.io/tx/${hash}`,
  tokenPageUrl: "https://etherscan.io/token/0x1D88713b483A8E45cfF0e5CD7c2e15E5Fab4534d",
  exchangeUrl: "https://www.binance.com/en/price/stakestone",
};

// ─── Pudgy Penguins (PENGU) — Solana / Binance ─────────────────────

const PENGU_CONFIG: AssetConfig = {
  id: "pengu",
  name: "Pudgy Penguins",
  symbol: "PENGU",
  chain: "solana",
  exchange: "binance",
  exchangeLabel: "Binance",
  contractAddress: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
  decimals: 6,
  solanaExchangeOwner: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
  solanaTokenAccount: "45xJxTULWEBTRcpQDMGZNHUvpzXv5An8fZZ2SjCEqntW",
  exchangeWallets: {
    "5tzfkikscxhk5zxcgbxzxdw7gtjjd1mbwuofbhuvuai9": "Binance Hot Wallet",
  },
  explorerTxUrl: (hash) => `https://solscan.io/tx/${hash}`,
  tokenPageUrl: "https://solscan.io/token/2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
  exchangeUrl: "https://www.binance.com/en/price/pudgy-penguins",
};

// ─── Pippin (PIPPIN) — Solana / Gate.io ─────────────────────────────

const PIPPIN_CONFIG: AssetConfig = {
  id: "pippin",
  name: "Pippin",
  symbol: "PIPPIN",
  chain: "solana",
  exchange: "gateio",
  exchangeLabel: "Gate.io",
  contractAddress: "Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump",
  decimals: 6,
  solanaExchangeOwner: "u6PJ8DtQuPFnfmwHbGFULQ4u4EgjDiyYKjVEsynXq2w",
  solanaTokenAccount: "DxeYg4UPtJmvNoz3Mo3n5ZKzhtcCUonZqZ2M5ncA3rPe",
  exchangeWallets: {
    "u6pj8dtqupfnfmwhbgfulq4u4egjdiykjveesynxq2w": "Gate.io",
  },
  explorerTxUrl: (hash) => `https://solscan.io/tx/${hash}`,
  tokenPageUrl: "https://solscan.io/token/Dfh5DzRgSvvCFDoYc2ciTkMrbDfRKybA4SoFbPmApump",
  exchangeUrl: "https://www.gate.io/trade/PIPPIN_USDT",
};

// ─── Registry ───────────────────────────────────────────────────────

export const ASSETS: AssetConfig[] = [STO_CONFIG, PENGU_CONFIG, PIPPIN_CONFIG];

export const ASSET_MAP: Record<string, AssetConfig> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a])
);

export const DEFAULT_ASSET_ID = "sto";

// ─── Time Range Options ─────────────────────────────────────────────

export interface TimeRangeOption {
  label: string;
  hours: number;
  ms: number;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { label: "1H", hours: 1, ms: 1 * 60 * 60 * 1000 },
  { label: "2H", hours: 2, ms: 2 * 60 * 60 * 1000 },
  { label: "4H", hours: 4, ms: 4 * 60 * 60 * 1000 },
  { label: "8H", hours: 8, ms: 8 * 60 * 60 * 1000 },
  { label: "12H", hours: 12, ms: 12 * 60 * 60 * 1000 },
  { label: "24H", hours: 24, ms: 24 * 60 * 60 * 1000 },
];

export const DEFAULT_TIME_RANGE = TIME_RANGES[0]; // 1H

// ─── Amount Tier Thresholds ─────────────────────────────────────────

export const TIERS = [
  { label: "250K+", min: 250_000, color: "outflow" as const },
  { label: "100K+", min: 100_000, color: "warning" as const },
  { label: "50K+", min: 50_000, color: "inflow" as const },
];

// ─── Polling ────────────────────────────────────────────────────────

export const POLL_INTERVAL = 30_000;
