export type FlowDirection = "inflow" | "outflow";

export interface TokenTransfer {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gasPrice: string;
  gasUsed: string;
}

export interface ProcessedTransfer {
  id: string;
  hash: string;
  timestamp: number;
  direction: FlowDirection;
  amount: number;
  from: string;
  to: string;
  binanceWalletLabel: string;
  tier: "50K+" | "100K+" | "250K+" | null;
}

export interface TierSummary {
  label: string;
  min: number;
  inflowCount: number;
  inflowTotal: number;
  outflowCount: number;
  outflowTotal: number;
}

export interface FlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  inflowCount: number;
  outflowCount: number;
  tiers: TierSummary[];
  lastUpdated: number;
}
