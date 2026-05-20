/**
 * lib/utils/formatters.ts
 * Utility functions untuk formatting tampilan data di UI.
 * Semua fungsi adalah pure functions (tidak ada side effects) sehingga mudah di-test.
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";
import { id } from "date-fns/locale"; // Locale Indonesia untuk format tanggal

/**
 * Format angka menjadi string rupiah.
 * Contoh: 15000 → "Rp 15.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka besar menjadi shorthand yang ringkas untuk ditampilkan di chart/card.
 * Contoh: 1500000 → "1.5M", 250000 → "250K"
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Rp ${Math.round(amount / 1_000)}K`;
  }
  return `Rp ${amount}`;
}

/**
 * Format tanggal transaksi menjadi string yang ramah untuk ditampilkan.
 * - Hari ini → "Today, 14:30"
 * - Kemarin → "Yesterday, 09:00"
 * - Lebih lama → "15 Jan 2024"
 */
export function formatTransactionDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today`;
  if (isYesterday(date)) return `Yesterday`;
  return format(date, "d MMM yyyy");
}

/**
 * Format tanggal relatif (berapa lama yang lalu).
 * Contoh: "3 minutes ago", "2 days ago"
 */
export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

/**
 * Format tanggal lengkap untuk header atau judul.
 * Contoh: "Januari 2024"
 */
export function formatMonthYear(date: Date = new Date()): string {
  return format(date, "MMMM yyyy", { locale: id });
}

/**
 * Format persentase dengan 1 desimal.
 * Contoh: 0.756 → "75.6%"
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Hitung warna status budget berdasarkan persentase terpakai.
 * - Hijau: < 75% (aman)
 * - Kuning/Orange: 75-100% (warning)
 * - Merah: > 100% (exceeded)
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage > 100) return "#EF4444"; // red
  if (percentage > 75) return "#F59E0B";  // amber
  return "#10B981";                       // emerald
}

/**
 * Clamp nilai antara min dan max.
 * Berguna untuk progress bar yang tidak boleh melebihi 100%.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Gabungkan class names dengan tailwind-merge.
 * Ini mencegah konflik class Tailwind (misalnya "text-red-500" dan "text-blue-500").
 * Digunakan di semua komponen UI.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
