import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Discount tier for energy subscription.
 * <= 800: 10% | <1500: 15% | >=1500: 20%
 */
export function getDiscountPercent(monthlyBill: number): number {
  if (monthlyBill <= 800) return 0.1;
  if (monthlyBill < 1500) return 0.15;
  return 0.2;
}

export function calculateSavings(monthlyBill: number) {
  const pct = getDiscountPercent(monthlyBill);
  const monthlySavings = monthlyBill * pct;
  const annualSavings = monthlySavings * 12;
  return {
    percent: pct,
    monthly: monthlySavings,
    annual: annualSavings,
    newBill: monthlyBill - monthlySavings,
  };
}
