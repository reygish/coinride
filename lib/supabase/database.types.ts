/**
 * lib/supabase/database.types.ts
 * TypeScript types yang merepresentasikan schema database Supabase.
 *
 * File ini biasanya di-generate otomatis dari schema Supabase dengan perintah:
 *   npx supabase gen types typescript --project-id <project-id>
 *
 * Tapi untuk sekarang kita definisikan manual sesuai dengan rencana schema.
 * Backend team perlu membuat tabel-tabel ini di Supabase.
 *
 * SCHEMA SQL untuk backend team:
 * ─────────────────────────────
 * Lihat file: /docs/schema.sql (belum dibuat, backend team yang buat)
 */

export type Database = {
  public: {
    Tables: {
      /** Profil user yang extend dari auth.users */
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          currency: string;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          currency?: string;
          timezone?: string;
        };
      };

      /** Tabel utama pencatatan transaksi keuangan */
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          type: "expense" | "income";
          category_id: string;
          ai_classified: boolean;
          ai_confidence: number | null;
          date: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          type: "expense" | "income";
          category_id: string;
          ai_classified?: boolean;
          ai_confidence?: number | null;
          date: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          description?: string;
          amount?: number;
          type?: "expense" | "income";
          category_id?: string;
          ai_classified?: boolean;
          ai_confidence?: number | null;
          date?: string;
          note?: string | null;
        };
      };

      /** Budget per kategori per bulan */
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          month: number;
          year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          updated_at?: string;
        };
      };

      /** Achievement/badge yang sudah di-unlock user */
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: never;
      };

      /** Streak harian user */
      user_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_log_date: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_log_date: string;
          updated_at?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_log_date?: string;
          updated_at?: string;
        };
      };

      /** Konfigurasi reminder email */
      reminders: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          frequency: "hourly" | "daily";
          time: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          frequency: "hourly" | "daily";
          time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          frequency?: "hourly" | "daily";
          time?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
  };
};
