import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract domain from email address */
export function emailToDomain(email: string): string {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : email.toLowerCase();
}

/** Normalize a domain to a brand name (best-effort) */
export function domainToBrand(domain: string): string {
  // Remove common suffixes and www
  const cleaned = domain
    .replace(/^www\./, "")
    .replace(/\.(com|net|org|de|io|co|uk|fr|es|it|nl|be|at|ch|app|email|mail|newsletter)(\.[a-z]{2})?$/, "")
    .split(".")[0];

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Truncate string to maxLength with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "…";
}

/** Format relative time (e.g., "2 days ago") */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays !== 1 ? "en" : ""}`;
  if (diffWeeks < 5) return `vor ${diffWeeks} Woche${diffWeeks !== 1 ? "n" : ""}`;
  if (diffMonths < 12) return `vor ${diffMonths} Monat${diffMonths !== 1 ? "en" : ""}`;
  return d.toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "numeric" });
}

/** Format a number with thousands separator */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n);
}

/** Format currency */
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(amount);
}

/** Get score color class (green / yellow / red) */
export function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

/** Get risk level label */
export function getRiskLabel(score: number): string {
  if (score >= 75) return "Hohes Risiko";
  if (score >= 50) return "Mittleres Risiko";
  if (score >= 25) return "Geringes Risiko";
  return "Kein Risiko";
}

export function getRiskColor(score: number): string {
  if (score >= 75) return "text-red-600";
  if (score >= 50) return "text-amber-600";
  if (score >= 25) return "text-yellow-600";
  return "text-emerald-600";
}
