/**
 * types/index.ts
 * Definisi semua TypeScript types dan interfaces yang digunakan di seluruh aplikasi Spendly.
 * Dengan mendefinisikan types di sini, kita menerapkan prinsip Single Source of Truth (SST)
 * dan memudahkan refactoring di masa depan (Maintainable & Extensible).
 */

// ─── User & Auth ──────────────────────────────────────────────────────────────

/** Data profil user yang tersimpan di database */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  currency: string; // e.g. "IDR"
  timezone: string; // e.g. "Asia/Jakarta"
}

// ─── Categories ───────────────────────────────────────────────────────────────

/** ID kategori yang valid untuk transaksi */
export type CategoryId =
  | "food"
  | "transport"
  | "bills"
  | "shopping"
  | "entertainment"
  | "health"
  | "education"
  | "salary"
  | "freelance"
  | "other";

/** Informasi lengkap sebuah kategori */
export interface Category {
  id: CategoryId;
  label: string;        // Nama tampilan, e.g. "Food & Drinks"
  icon: string;         // Emoji icon
  color: string;        // Hex color untuk chart
  type: "expense" | "income" | "both"; // Apakah kategori ini untuk pengeluaran, pemasukan, atau keduanya
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/** Tipe transaksi: pengeluaran atau pemasukan */
export type TransactionType = "expense" | "income";

/** Data transaksi yang tersimpan di database */
export interface Transaction {
  id: string;
  user_id: string;
  description: string;        // Deskripsi input user, e.g. "beli nasi goreng 15rb"
  amount: number;             // Nominal dalam IDR, e.g. 15000
  type: TransactionType;
  category_id: CategoryId;
  ai_classified: boolean;     // true jika kategori ditentukan oleh AI, false jika manual
  ai_confidence: number | null; // Confidence score dari AI (0-1)
  date: string;               // ISO date string, e.g. "2024-01-15"
  created_at: string;
  note: string | null;        // Catatan tambahan opsional
}

/**
 * Data yang dibutuhkan untuk membuat transaksi baru.
 * Omit fields yang otomatis diisi oleh server (id, user_id, created_at).
 */
export type CreateTransactionInput = Omit<
  Transaction,
  "id" | "user_id" | "created_at"
>;

/** Hasil parsing AI untuk sebuah input teks */
export interface AIClassificationResult {
  category: CategoryId;
  confidence: number;     // 0-1, seberapa yakin AI dengan klasifikasinya
  amount: number | null;  // Nominal yang berhasil di-parse dari teks
}

// ─── Budget ───────────────────────────────────────────────────────────────────

/** Budget yang ditetapkan user untuk sebuah kategori */
export interface Budget {
  id: string;
  user_id: string;
  category_id: CategoryId;
  amount: number;           // Target budget per bulan dalam IDR
  month: number;            // 1-12
  year: number;
  created_at: string;
  updated_at: string;
}

/**
 * Budget dengan data pengeluaran aktual (untuk ditampilkan di dashboard).
 * Digabungkan dari tabel budget + aggregasi transactions.
 */
export interface BudgetWithSpending extends Budget {
  spent: number;            // Total pengeluaran di kategori ini bulan ini
  remaining: number;        // Sisa budget = amount - spent
  percentage: number;       // Persentase terpakai = (spent / amount) * 100
  status: "safe" | "warning" | "exceeded"; // safe < 75%, warning 75-100%, exceeded > 100%
}

export type CreateBudgetInput = Omit<Budget, "id" | "user_id" | "created_at" | "updated_at">;

// ─── Gamification ─────────────────────────────────────────────────────────────

/** ID achievement yang tersedia */
export type AchievementId =
  | "first_transaction"   // Transaksi pertama
  | "streak_7"            // 7 hari streak
  | "streak_30"           // 30 hari streak
  | "first_saver"         // Pertama kali income > expense dalam sebulan
  | "budget_master"       // Tidak exceed budget semua kategori selama 1 bulan
  | "frugal_foodie"       // Pengeluaran food < budget minggu ini
  | "logger_30"           // Log transaksi 30 hari berturut-turut
  | "ai_trainer";         // Koreksi kategori AI sebanyak 10x

/** Definisi sebuah achievement */
export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;           // Emoji
  rarity: "common" | "rare" | "epic" | "legendary";
}

/** Achievement yang sudah di-unlock user */
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: AchievementId;
  unlocked_at: string;
}

/** Data streak harian user */
export interface UserStreak {
  user_id: string;
  current_streak: number;   // Streak hari ini (berapa hari berturut-turut)
  longest_streak: number;   // Rekor streak terpanjang
  last_log_date: string;    // Tanggal terakhir user log transaksi
  updated_at: string;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

/** Frekuensi pengiriman reminder */
export type ReminderFrequency = "hourly" | "daily";

/** Konfigurasi reminder email user */
export interface Reminder {
  id: string;
  user_id: string;
  email: string;
  frequency: ReminderFrequency;
  time: string | null;      // HH:MM format untuk daily reminder, null untuk hourly
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateReminderInput = Omit<Reminder, "id" | "user_id" | "created_at" | "updated_at">;

// ─── Dashboard Analytics ──────────────────────────────────────────────────────

/** Data summary untuk dashboard */
export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;      // income - expense
  transaction_count: number;
  month: number;
  year: number;
}

/** Data untuk chart spending per kategori */
export interface CategorySpending {
  category_id: CategoryId;
  total: number;
  percentage: number;       // Persentase dari total pengeluaran
  transaction_count: number;
}

/** Data untuk chart monthly trend */
export interface MonthlyData {
  month: string;            // e.g. "Jan 2024"
  income: number;
  expense: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────

/** Standar format response API */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  message?: string;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** Response dengan pagination */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error: string | null;
}
