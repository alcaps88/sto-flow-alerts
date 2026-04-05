import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AssetConfig } from "../../../shared/const";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 0): string {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return sign + (abs / 1_000_000).toFixed(2) + "M";
  }
  if (abs >= 1_000) {
    return sign + (abs / 1_000).toFixed(decimals > 0 ? decimals : 1) + "K";
  }
  return num.toFixed(decimals);
}

export function formatFullNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(num);
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  if (address.length > 20) {
    // Solana addresses are longer
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function getExplorerTxUrl(asset: AssetConfig, hash: string): string {
  return asset.explorerTxUrl(hash);
}
