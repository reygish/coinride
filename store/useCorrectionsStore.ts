/**
 * store/useCorrectionsStore.ts
 * Menyimpan koreksi kategori yang dilakukan user ke localStorage.
 *
 * Ketika user mengoreksi kategori AI yang salah, kata-kata kunci dari
 * deskripsi transaksi disimpan di sini. Lain kali user input deskripsi
 * yang mirip, sistem langsung pakai koreksi ini — tanpa perlu AI.
 *
 * Contoh: user koreksi "tucanos dinner" → food
 * Disimpan: keywords ["tucanos", "dinner"] → "food"
 * Input berikutnya "makan di tucanos" → match "tucanos" → langsung food ✓
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CategoryId } from "@/types";

interface UserCorrection {
  keywords: string[];
  categoryId: CategoryId;
}

interface CorrectionsState {
  corrections: UserCorrection[];
  addCorrection: (description: string, categoryId: CategoryId) => void;
  findMatch: (input: string) => CategoryId | null;
  clearAll: () => void;
}

/** Ambil kata-kata bermakna dari deskripsi (panjang >= 3, bukan angka) */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !/^\d+$/.test(w));
}

export const useCorrectionsStore = create<CorrectionsState>()(
  persist(
    (set, get) => ({
      corrections: [],

      addCorrection: (description, categoryId) => {
        const keywords = extractKeywords(description);
        if (keywords.length === 0) return;

        set((state) => {
          // Hapus koreksi lama yang punya overlap keyword,
          // supaya koreksi terbaru yang menang
          const filtered = state.corrections.filter(
            (c) => !c.keywords.some((k) => keywords.includes(k))
          );
          return { corrections: [...filtered, { keywords, categoryId }] };
        });
      },

      findMatch: (input) => {
        const { corrections } = get();
        const normalizedInput = input.toLowerCase();

        // Cari dari koreksi terbaru (akhir array) ke yang paling lama
        for (let i = corrections.length - 1; i >= 0; i--) {
          const correction = corrections[i];
          const matched = correction.keywords.some((kw) =>
            normalizedInput.includes(kw)
          );
          if (matched) return correction.categoryId;
        }
        return null;
      },

      clearAll: () => set({ corrections: [] }),
    }),
    {
      name: "spendly-user-corrections",
    }
  )
);
