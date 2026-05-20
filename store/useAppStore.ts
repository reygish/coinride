/**
 * store/useAppStore.ts
 * Global state management menggunakan Zustand.
 *
 * Zustand dipilih karena:
 * - Ringan dan tidak boilerplate seperti Redux
 * - API yang simpel dan intuitif
 * - Mendukung TypeScript dengan baik
 * - Scalable: bisa dipecah menjadi multiple slices jika perlu
 *
 * State yang dikelola di sini adalah state yang perlu dishare antar banyak komponen.
 * Untuk state lokal komponen, gunakan React useState saja.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Transaction,
  BudgetWithSpending,
  UserStreak,
  UserAchievement,
  DashboardSummary,
  CategorySpending,
} from "@/types";
import {
  MOCK_TRANSACTIONS,
  MOCK_BUDGETS,
  MOCK_STREAK,
  MOCK_USER_ACHIEVEMENTS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_CATEGORY_SPENDING,
  MOCK_MONTHLY_DATA,
} from "@/lib/mock/data";
import type { MonthlyData } from "@/types";

/** Shape dari seluruh global state */
interface AppState {
  // ─── Transactions ───────────────────────────────────────────────────────────
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;

  // ─── Budget ─────────────────────────────────────────────────────────────────
  budgets: BudgetWithSpending[];
  isLoadingBudgets: boolean;
  setBudgets: (budgets: BudgetWithSpending[]) => void;

  // ─── Gamification ───────────────────────────────────────────────────────────
  streak: UserStreak | null;
  achievements: UserAchievement[];
  setStreak: (streak: UserStreak) => void;
  setAchievements: (achievements: UserAchievement[]) => void;

  // ─── Dashboard Analytics ────────────────────────────────────────────────────
  summary: DashboardSummary | null;
  categorySpending: CategorySpending[];
  monthlyData: MonthlyData[];
  setSummary: (summary: DashboardSummary) => void;

  // ─── UI State ───────────────────────────────────────────────────────────────
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // ─── Initialization ─────────────────────────────────────────────────────────
  initializeMockData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ─── Initial State ─────────────────────────────────────────────────────────
      transactions: [],
      isLoadingTransactions: false,
      budgets: [],
      isLoadingBudgets: false,
      streak: null,
      achievements: [],
      summary: null,
      categorySpending: [],
      monthlyData: [],
      isSidebarOpen: false,

      // ─── Transaction Actions ───────────────────────────────────────────────────
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setTransactions: (transactions) => set({ transactions }),

      // ─── Budget Actions ────────────────────────────────────────────────────────
      setBudgets: (budgets) => set({ budgets }),

      // ─── Gamification Actions ──────────────────────────────────────────────────
      setStreak: (streak) => set({ streak }),
      setAchievements: (achievements) => set({ achievements }),

      // ─── Dashboard Actions ─────────────────────────────────────────────────────
      setSummary: (summary) => set({ summary }),

      // ─── UI Actions ───────────────────────────────────────────────────────────
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // ─── Initialize mock data ──────────────────────────────────────────────────
      // Transaksi hanya diisi mock jika belum ada data tersimpan (kunjungan pertama).
      // Data lain (budgets, streak, dll) selalu diisi ulang dari mock.
      initializeMockData: () => {
        const existing = get().transactions;
        set({
          ...(existing.length === 0 && { transactions: MOCK_TRANSACTIONS }),
          budgets: MOCK_BUDGETS,
          streak: MOCK_STREAK,
          achievements: MOCK_USER_ACHIEVEMENTS,
          summary: MOCK_DASHBOARD_SUMMARY,
          categorySpending: MOCK_CATEGORY_SPENDING,
          monthlyData: MOCK_MONTHLY_DATA,
        });
      },
    }),
    {
      name: "spendly-app-state",
      // Hanya simpan transaksi ke localStorage — data lain di-generate ulang dari mock
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);
