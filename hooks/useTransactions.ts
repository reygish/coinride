/**
 * hooks/useTransactions.ts
 * Custom hook untuk mengelola transaksi: fetch, create, update, delete.
 *
 * classifyInput memanggil /api/ai/classify (server route) bukan classifyTransaction
 * langsung, karena HUGGINGFACE_API_TOKEN hanya tersedia di server, bukan browser.
 */

"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCorrectionsStore } from "@/store/useCorrectionsStore";
import type { Transaction, CreateTransactionInput, AIClassificationResult } from "@/types";
import toast from "react-hot-toast";

export function useTransactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, setTransactions } =
    useAppStore();
  const { findMatch, addCorrection } = useCorrectionsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  /**
   * Fetch semua transaksi user dari API.
   * TODO (Backend): Implementasi GET /api/transactions dengan Supabase query
   */
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      setTransactions(data.data ?? []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [setTransactions]);

  /**
   * Klasifikasi teks via /api/ai/classify (server route).
   *
   * PENTING: Tidak boleh panggil classifyTransaction() langsung dari sini
   * karena HUGGINGFACE_API_TOKEN adalah server-only env var dan akan
   * undefined di browser, menyebabkan HuggingFace API selalu return 401.
   */
  const classifyInput = useCallback(
    async (text: string): Promise<AIClassificationResult | null> => {
      if (!text.trim() || text.length < 3) return null;
      setIsClassifying(true);
      try {
        const response = await fetch("/api/ai/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const result: AIClassificationResult | null = data.data ?? null;
        if (!result) return null;

        // Cek apakah user pernah koreksi input serupa sebelumnya.
        // Jika ya, override kategori AI dengan koreksi user — confidence 0.95.
        const correctedCategory = findMatch(text);
        if (correctedCategory) {
          return { ...result, category: correctedCategory, confidence: 0.95 };
        }

        return result;
      } catch (error) {
        console.error("Classification error:", error);
        return null;
      } finally {
        setIsClassifying(false);
      }
    },
    [findMatch]
  );

  /**
   * Buat transaksi baru dan simpan ke database.
   * TODO (Backend): Implementasi POST /api/transactions dengan Supabase insert
   */
  const createTransaction = useCallback(
    async (input: CreateTransactionInput): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Mock: tambah ke state lokal dulu (sebelum backend siap)
        const newTransaction: Transaction = {
          id: `t${Date.now()}`,
          user_id: "user-123",
          ...input,
          created_at: new Date().toISOString(),
        };
        addTransaction(newTransaction);
        toast.success("Transaction added! 🎉");
        return true;

        /**
         * TODO (Backend): Uncomment setelah API siap
         *
         * const response = await fetch("/api/transactions", {
         *   method: "POST",
         *   headers: { "Content-Type": "application/json" },
         *   body: JSON.stringify(input),
         * });
         * if (!response.ok) throw new Error("Failed to create transaction");
         * const data = await response.json();
         * addTransaction(data.data);
         * toast.success("Transaction added! 🎉");
         * return true;
         */
      } catch (error) {
        console.error("Error creating transaction:", error);
        toast.error("Failed to add transaction");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [addTransaction]
  );

  /**
   * Update kategori transaksi secara manual (override AI classification).
   * TODO (Backend): Implementasi PATCH /api/transactions/[id]
   */
  const correctCategory = useCallback(
    async (transactionId: string, newCategoryId: string): Promise<boolean> => {
      try {
        // Simpan koreksi ini ke corrections store supaya input serupa
        // di masa depan langsung pakai kategori yang benar
        const transaction = transactions.find((t) => t.id === transactionId);
        if (transaction) {
          addCorrection(transaction.description, newCategoryId as Transaction["category_id"]);
        }

        updateTransaction(transactionId, {
          category_id: newCategoryId as Transaction["category_id"],
          ai_classified: false,
        });
        toast.success("Category updated!");
        return true;

        /**
         * TODO (Backend): Uncomment setelah API siap
         *
         * const response = await fetch(`/api/transactions/${transactionId}`, {
         *   method: "PATCH",
         *   headers: { "Content-Type": "application/json" },
         *   body: JSON.stringify({ category_id: newCategoryId, ai_classified: false }),
         * });
         * if (!response.ok) throw new Error("Failed to update category");
         * updateTransaction(transactionId, { category_id: newCategoryId as Transaction["category_id"], ai_classified: false });
         * toast.success("Category updated!");
         * return true;
         */
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
        return false;
      }
    },
    [updateTransaction, transactions, addCorrection]
  );

  /**
   * Hapus transaksi.
   * TODO (Backend): Implementasi DELETE /api/transactions/[id]
   */
  const removeTransaction = useCallback(
    async (transactionId: string): Promise<boolean> => {
      try {
        // Mock: hapus dari state lokal
        deleteTransaction(transactionId);
        toast.success("Transaction deleted");
        return true;

        /**
         * TODO (Backend): Uncomment setelah API siap
         *
         * const response = await fetch(`/api/transactions/${transactionId}`, { method: "DELETE" });
         * if (!response.ok) throw new Error("Failed to delete transaction");
         * deleteTransaction(transactionId);
         * toast.success("Transaction deleted");
         * return true;
         */
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
        return false;
      }
    },
    [deleteTransaction]
  );

  return {
    transactions,
    isLoading,
    isClassifying,
    fetchTransactions,
    classifyInput,
    createTransaction,
    correctCategory,
    removeTransaction,
  };
}
