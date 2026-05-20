/**
 * lib/mock/data.ts
 * Data dummy untuk development dan demo.
 *
 * Data ini digunakan selama development frontend sebelum backend siap.
 * Backend team perlu mengganti penggunaan data ini dengan API calls yang sesungguhnya.
 *
 * CATATAN: File ini tidak boleh dipakai di production!
 */

import type {
  Transaction,
  Budget,
  BudgetWithSpending,
  UserAchievement,
  UserStreak,
  CategorySpending,
  MonthlyData,
  DashboardSummary,
} from "@/types";

/** Sample transactions untuk bulan ini */
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    user_id: "user-123",
    description: "nasi goreng 15rb",
    amount: 15000,
    type: "expense",
    category_id: "food",
    ai_classified: true,
    ai_confidence: 0.95,
    date: "2026-05-20",
    created_at: "2026-05-20T08:30:00Z",
    note: null,
  },
  {
    id: "2",
    user_id: "user-123",
    description: "Gojek ke kampus",
    amount: 18000,
    type: "expense",
    category_id: "transport",
    ai_classified: true,
    ai_confidence: 0.92,
    date: "2026-05-20",
    created_at: "2026-05-20T07:15:00Z",
    note: null,
  },
  {
    id: "3",
    user_id: "user-123",
    description: "bayar listrik 200k",
    amount: 200000,
    type: "expense",
    category_id: "bills",
    ai_classified: true,
    ai_confidence: 0.98,
    date: "2026-05-19",
    created_at: "2026-05-19T10:00:00Z",
    note: null,
  },
  {
    id: "4",
    user_id: "user-123",
    description: "Gaji bulan Mei",
    amount: 3500000,
    type: "income",
    category_id: "salary",
    ai_classified: false,
    ai_confidence: null,
    date: "2026-05-15",
    created_at: "2026-05-15T09:00:00Z",
    note: "Gaji bulanan",
  },
  {
    id: "5",
    user_id: "user-123",
    description: "McDonalds 80k",
    amount: 80000,
    type: "expense",
    category_id: "food",
    ai_classified: true,
    ai_confidence: 0.88,
    date: "2026-05-18",
    created_at: "2026-05-18T13:00:00Z",
    note: null,
  },
  {
    id: "6",
    user_id: "user-123",
    description: "Spotify premium 54k",
    amount: 54000,
    type: "expense",
    category_id: "entertainment",
    ai_classified: true,
    ai_confidence: 0.91,
    date: "2026-05-17",
    created_at: "2026-05-17T00:00:00Z",
    note: null,
  },
  {
    id: "7",
    user_id: "user-123",
    description: "Bensin motor 50rb",
    amount: 50000,
    type: "expense",
    category_id: "transport",
    ai_classified: true,
    ai_confidence: 0.94,
    date: "2026-05-16",
    created_at: "2026-05-16T07:00:00Z",
    note: null,
  },
  {
    id: "8",
    user_id: "user-123",
    description: "Buku catatan kampus",
    amount: 25000,
    type: "expense",
    category_id: "education",
    ai_classified: true,
    ai_confidence: 0.87,
    date: "2026-05-14",
    created_at: "2026-05-14T10:30:00Z",
    note: null,
  },
  {
    id: "9",
    user_id: "user-123",
    description: "Freelance desain logo",
    amount: 500000,
    type: "income",
    category_id: "freelance",
    ai_classified: false,
    ai_confidence: null,
    date: "2026-05-12",
    created_at: "2026-05-12T14:00:00Z",
    note: "Proyek desain logo client",
  },
  {
    id: "10",
    user_id: "user-123",
    description: "Obat flu apotek",
    amount: 35000,
    type: "expense",
    category_id: "health",
    ai_classified: true,
    ai_confidence: 0.89,
    date: "2026-05-11",
    created_at: "2026-05-11T16:00:00Z",
    note: null,
  },
];

/** Sample budgets untuk bulan ini */
export const MOCK_BUDGETS: BudgetWithSpending[] = [
  {
    id: "b1",
    user_id: "user-123",
    category_id: "food",
    amount: 500000,
    spent: 380000,
    remaining: 120000,
    percentage: 76,
    status: "warning",
    month: 5,
    year: 2026,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "b2",
    user_id: "user-123",
    category_id: "transport",
    amount: 300000,
    spent: 186000,
    remaining: 114000,
    percentage: 62,
    status: "safe",
    month: 5,
    year: 2026,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "b3",
    user_id: "user-123",
    category_id: "bills",
    amount: 250000,
    spent: 200000,
    remaining: 50000,
    percentage: 80,
    status: "warning",
    month: 5,
    year: 2026,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
  {
    id: "b4",
    user_id: "user-123",
    category_id: "entertainment",
    amount: 150000,
    spent: 54000,
    remaining: 96000,
    percentage: 36,
    status: "safe",
    month: 5,
    year: 2026,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-20T00:00:00Z",
  },
];

/** Sample streak data */
export const MOCK_STREAK: UserStreak = {
  user_id: "user-123",
  current_streak: 7,
  longest_streak: 14,
  last_log_date: "2026-05-20",
  updated_at: "2026-05-20T08:30:00Z",
};

/** Sample achievements yang sudah di-unlock */
export const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [
  {
    id: "ua1",
    user_id: "user-123",
    achievement_id: "first_transaction",
    unlocked_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "ua2",
    user_id: "user-123",
    achievement_id: "streak_7",
    unlocked_at: "2026-05-20T08:30:00Z",
  },
  {
    id: "ua3",
    user_id: "user-123",
    achievement_id: "first_saver",
    unlocked_at: "2026-04-30T23:59:00Z",
  },
];

/** Summary dashboard bulan ini */
export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  total_income: 4000000,
  total_expense: 1057000,
  net_balance: 2943000,
  transaction_count: 10,
  month: 5,
  year: 2026,
};

/** Data spending per kategori untuk pie chart */
export const MOCK_CATEGORY_SPENDING: CategorySpending[] = [
  { category_id: "food", total: 475000, percentage: 44.9, transaction_count: 4 },
  { category_id: "transport", total: 186000, percentage: 17.6, transaction_count: 2 },
  { category_id: "bills", total: 200000, percentage: 18.9, transaction_count: 1 },
  { category_id: "entertainment", total: 54000, percentage: 5.1, transaction_count: 1 },
  { category_id: "education", total: 25000, percentage: 2.4, transaction_count: 1 },
  { category_id: "health", total: 35000, percentage: 3.3, transaction_count: 1 },
  { category_id: "shopping", total: 82000, percentage: 7.8, transaction_count: 2 },
];

/** Data trend bulanan untuk bar chart (6 bulan terakhir) */
export const MOCK_MONTHLY_DATA: MonthlyData[] = [
  { month: "Dec", income: 3500000, expense: 2100000 },
  { month: "Jan", income: 3500000, expense: 1800000 },
  { month: "Feb", income: 4000000, expense: 2300000 },
  { month: "Mar", income: 3800000, expense: 1950000 },
  { month: "Apr", income: 4500000, expense: 2200000 },
  { month: "May", income: 4000000, expense: 1057000 },
];
