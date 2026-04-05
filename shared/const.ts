export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// StakeStone (STO) Token Configuration
export const STO_TOKEN = {
  name: "StakeStone",
  symbol: "STO",
  contractAddress: "0x1D88713b483A8E45cfF0e5CD7c2e15E5Fab4534d",
  decimals: 18,
  chain: "Ethereum",
};

// Known Binance Ethereum wallet addresses (Etherscan labeled)
export const BINANCE_WALLETS: Record<string, string> = {
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
};

// All Binance wallet addresses as a Set for quick lookup (lowercase)
export const BINANCE_WALLET_SET = new Set(
  Object.keys(BINANCE_WALLETS).map((a) => a.toLowerCase())
);

// Amount tier thresholds (in STO tokens)
export const TIERS = [
  { label: "250K+", min: 250_000, color: "outflow" as const },
  { label: "100K+", min: 100_000, color: "warning" as const },
  { label: "50K+", min: 50_000, color: "inflow" as const },
];

// Etherscan free API (no key needed for basic calls, but rate limited)
export const ETHERSCAN_API_BASE = "https://api.etherscan.io/api";

// Polling interval in ms (30 seconds)
export const POLL_INTERVAL = 30_000;

// Time window in ms (1 hour)
export const TIME_WINDOW = 60 * 60 * 1000;
