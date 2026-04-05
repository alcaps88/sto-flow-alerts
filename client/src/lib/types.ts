import type { ChainType } from "../../../shared/const";

export type FlowDirection = "inflow" | "outflow";

export interface ProcessedTransfer {
  id: string;
  hash: string;
  timestamp: number;
  direction: FlowDirection;
  amount: number;
  from: string;
  to: string;
  exchangeWalletLabel: string;
  tier: "50K+" | "100K+" | "250K+" | null;
  /** Which asset this transfer belongs to */
  assetId: string;
  symbol: string;
  chain: ChainType;
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
