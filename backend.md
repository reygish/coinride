# Spendly — Panduan Implementasi Backend

> **Untuk:** Backend Team
> **Dari:** Frontend Team
> **Tanggal:** 20 Mei 2026
>
> Frontend sudah **100% selesai**. Tugasmu adalah menghubungkan frontend ke Supabase dengan mengisi semua bagian yang ditandai `TODO (Backend)` di file-file API route.

---

## Daftar Isi

1. [Gambaran Arsitektur](#1-gambaran-arsitektur)
2. [Clone & Setup Project](#2-clone--setup-project)
3. [Buat Project Supabase](#3-buat-project-supabase)
4. [Buat Schema Database (SQL)](#4-buat-schema-database-sql)
5. [Setup Row Level Security (RLS)](#5-setup-row-level-security-rls)
6. [Setup Autentikasi Supabase](#6-setup-autentikasi-supabase)
7. [Isi File .env.local](#7-isi-file-envlocal)
8. [Implementasi API Routes](#8-implementasi-api-routes)
9. [Update Store & Hooks (Hapus Mock)](#9-update-store--hooks-hapus-mock)
10. [Aktifkan Route Protection (Middleware)](#10-aktifkan-route-protection-middleware)
11. [Setup Smart Reminders (Edge Function)](#11-setup-smart-reminders-edge-function)
12. [File yang HARUS Dihapus Sebelum Deploy](#12-file-yang-harus-dihapus-sebelum-deploy)
13. [Deploy ke Vercel](#13-deploy-ke-vercel)
14. [Checklist Final](#14-checklist-final)

---

## 1. Gambaran Arsitektur

```
Browser (React/Next.js)
    │
    ├─► /api/transactions    ← Next.js API Route (app/api/transactions/route.ts)
    ├─► /api/budget          ← Next.js API Route (app/api/budget/route.ts)
    ├─► /api/achievements    ← Next.js API Route (app/api/achievements/route.ts)
    ├─► /api/streak          ← Next.js API Route (app/api/streak/route.ts)
    ├─► /api/reminders       ← Next.js API Route (app/api/reminders/route.ts)
    └─► /api/ai/classify     ← Next.js API Route (app/api/ai/classify/route.ts)
                                    │
                                    ▼
                             Supabase (Database + Auth)
                                    │
                                    ├─ PostgreSQL Database
                                    ├─ Auth (email/password)
                                    └─ Edge Functions (cron reminder)
```

**Tech Stack:**
- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase
- **AI:** HuggingFace Inference API (MoritzLaurer/mDeBERTa-v3-base-mnli-xnli)
- **Email Reminder:** Resend (pilihan utama) atau SendGrid
- **Language:** TypeScript

---

## 2. Clone & Setup Project

### 2a. Pull branch dari repository

```bash
# Pull branch frontend (branch dari teman kamu yang push)
git pull origin <nama-branch-frontend>

# Masuk ke folder project
cd spendly
```

### 2b. Install dependencies

```bash
npm install
```

### 2c. Buat file environment

```bash
# Copy template env
cp .env.local.example .env.local
```

File `.env.local` akan diisi nanti di **Langkah 7**.

---

## 3. Buat Project Supabase

### 3a. Buat akun & project baru

1. Buka **https://supabase.com** → Sign up / Login
2. Klik tombol **"New Project"**
3. Isi:
   - **Organization:** pilih organisasimu
   - **Name:** `spendly` (atau nama bebas)
   - **Database Password:** buat password yang kuat, **simpan baik-baik** (ini buat database PostgreSQL-nya)
   - **Region:** pilih **Southeast Asia (Singapore)** — paling dekat ke Indonesia
4. Klik **"Create new project"** — tunggu ±2 menit sampai siap

### 3b. Ambil API Keys

Setelah project siap:
1. Di sidebar kiri, klik **"Project Settings"** (ikon gear)
2. Klik tab **"API"**
3. Salin nilai berikut (butuh untuk `.env.local`):
   - **Project URL** → ini `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → ini `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → ini `SUPABASE_SERVICE_ROLE_KEY` (**RAHASIA! Jangan pernah commit ke git!**)

---

## 4. Buat Schema Database (SQL)

Jalankan SQL ini di **Supabase SQL Editor**:
> Sidebar kiri → **"SQL Editor"** → **"New query"** → paste SQL di bawah → klik **"Run"**

### Langkah 1: Tabel `user_profiles`

```sql
-- Tabel profil user (extend dari auth.users Supabase)
CREATE TABLE public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT NOT NULL DEFAULT 'IDR',
  timezone    TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: otomatis buat profil saat user baru register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Langkah 2: Tabel `transactions`

```sql
CREATE TABLE public.transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description    TEXT NOT NULL,
  amount         BIGINT NOT NULL CHECK (amount > 0),
  type           TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  category_id    TEXT NOT NULL,
  ai_classified  BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence  NUMERIC(4,3),
  date           DATE NOT NULL,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk query performa
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
```

### Langkah 3: Tabel `budgets`

```sql
CREATE TABLE public.budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id  TEXT NOT NULL,
  amount       BIGINT NOT NULL CHECK (amount > 0),
  month        SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year         SMALLINT NOT NULL CHECK (year >= 2020),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Satu user hanya boleh punya 1 budget per kategori per bulan
  UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX idx_budgets_user_month ON public.budgets(user_id, month, year);
```

### Langkah 4: Tabel `user_achievements`

```sql
CREATE TABLE public.user_achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Achievement tidak bisa di-unlock dua kali
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
```

### Langkah 5: Tabel `user_streaks`

```sql
CREATE TABLE public.user_streaks (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_log_date   DATE NOT NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Langkah 6: Tabel `reminders`

```sql
CREATE TABLE public.reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  frequency   TEXT NOT NULL CHECK (frequency IN ('hourly', 'daily')),
  time        TEXT,            -- Format "HH:MM", null untuk hourly
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Satu user hanya boleh punya 1 reminder
  UNIQUE (user_id)
);
```

---

## 5. Setup Row Level Security (RLS)

RLS memastikan user hanya bisa akses data miliknya sendiri. Jalankan di SQL Editor:

```sql
-- ─── Enable RLS di semua tabel ─────────────────────────────────────────────
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders         ENABLE ROW LEVEL SECURITY;

-- ─── Policies: user_profiles ───────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── Policies: transactions ────────────────────────────────────────────────
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Policies: budgets ─────────────────────────────────────────────────────
CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Policies: user_achievements ───────────────────────────────────────────
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─── Policies: user_streaks ────────────────────────────────────────────────
CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Policies: reminders ───────────────────────────────────────────────────
CREATE POLICY "Users can manage own reminders"
  ON public.reminders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 6. Setup Autentikasi Supabase

### 6a. Aktifkan Email/Password Auth

1. Sidebar kiri → **"Authentication"** → **"Providers"**
2. Pastikan **"Email"** sudah **enabled** (biasanya sudah on by default)
3. Atur:
   - **Confirm email:** ON (user harus verifikasi email)
   - **Secure email change:** ON

### 6b. Daftarkan Redirect URL

1. Sidebar kiri → **"Authentication"** → **"URL Configuration"**
2. Di bagian **"Redirect URLs"**, klik **"Add URL"** dan tambahkan:
   ```
   http://localhost:3000/api/auth/callback
   ```
3. Nanti setelah deploy, tambahkan juga:
   ```
   https://domain-kamu.vercel.app/api/auth/callback
   ```

### 6c. Set Site URL

Masih di **"URL Configuration"**:
- **Site URL:** `http://localhost:3000` (untuk development)
- Nanti ganti ke URL production setelah deploy

---

## 7. Isi File `.env.local`

Buka file `D:\...\spendly\.env.local` (yang tadi kamu copy dari `.env.local.example`) dan isi:

```env
# ─── Supabase Configuration ─────────────────────────────────────────────────
# Salin dari: Supabase Dashboard → Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── HuggingFace API ─────────────────────────────────────────────────────────
# Daftar di: https://huggingface.co/settings/tokens
# Pilih "New token" → Type: Read → Copy
# (Opsional — kalau tidak diisi, AI pakai keyword fallback, tetap jalan)
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Email Reminder ───────────────────────────────────────────────────────────
# Daftar di: https://resend.com → API Keys → Create API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=reminder@spendly.app

# ─── App Configuration ────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **PENTING:** File `.env.local` sudah ada di `.gitignore` — jangan pernah commit file ini!

---

## 8. Implementasi API Routes

Berikut semua file yang perlu kamu edit. Untuk setiap file, **hapus comment `/** TODO (Backend): ... */`** dan **ganti placeholder return** dengan kode aslinya.

---

### 8.1 `app/api/transactions/route.ts`

**Fungsi:** GET (list transaksi) dan POST (buat transaksi baru)

**Yang perlu dilakukan:**
1. Hapus baris placeholder: `return NextResponse.json({ data: [], meta: ... error: null });` di GET
2. Uncomment semua kode di dalam comment `/** ... */` di fungsi GET
3. Untuk POST: hapus `return NextResponse.json({ data: null, error: "Not implemented..." }, { status: 501 });`
4. Uncomment kode di POST, dan **tambahkan dua pemanggilan** setelah insert berhasil:

```typescript
// Setelah insert transaksi berhasil, tambahkan 2 baris ini:
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/streak`, {
  method: "PATCH",
  headers: { cookie: request.headers.get("cookie") ?? "" },
});
await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/achievements`, {
  method: "POST",
  headers: { cookie: request.headers.get("cookie") ?? "" },
});
```

---

### 8.2 `app/api/transactions/[id]/route.ts`

**Fungsi:** GET satu transaksi, PATCH update, DELETE hapus

**Yang perlu dilakukan:**
- Di setiap handler (GET, PATCH, DELETE): hapus `return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });`
- Uncomment kode TODO di dalam masing-masing handler

---

### 8.3 `app/api/budget/route.ts`

**Fungsi:** GET semua budget bulan ini (dengan spending aktual), POST buat budget baru

**Yang perlu dilakukan:**
- GET: hapus `return NextResponse.json({ data: [], error: null });` dan uncomment kode TODO
- POST: hapus `return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });` dan uncomment kode TODO

---

### 8.4 `app/api/budget/[id]/route.ts`

**Fungsi:** PATCH update nominal budget, DELETE hapus budget

**Yang perlu dilakukan:**
- Di PATCH dan DELETE: hapus return `{ status: 501 }` dan uncomment kode TODO

---

### 8.5 `app/api/achievements/route.ts`

**Fungsi:** GET achievements yang sudah di-unlock, POST untuk cek & unlock achievement baru

**Yang perlu dilakukan:**
- GET: hapus `return NextResponse.json({ data: [], error: null });` dan uncomment kode TODO
- POST: uncomment kode TODO dan **buat fungsi helper** `checkAchievementCondition`:

```typescript
// Tambahkan fungsi ini di bawah file, setelah semua handler:
async function checkAchievementCondition(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  userId: string,
  achievementId: string
): Promise<boolean> {
  // Cek apakah achievement sudah di-unlock
  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .single();
  
  if (existing) return false; // Sudah di-unlock, skip

  switch (achievementId) {
    case "first_transaction": {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return (count ?? 0) >= 1;
    }
    case "streak_7": {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .single();
      return (data?.current_streak ?? 0) >= 7;
    }
    case "streak_30": {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .single();
      return (data?.current_streak ?? 0) >= 30;
    }
    case "logger_30": {
      const { data } = await supabase
        .from("user_streaks")
        .select("longest_streak")
        .eq("user_id", userId)
        .single();
      return (data?.longest_streak ?? 0) >= 30;
    }
    case "first_saver": {
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const startDate = `${lastMonthYear}-${String(lastMonth).padStart(2, "0")}-01`;
      const endDate = new Date(lastMonthYear, lastMonth, 0).toISOString().split("T")[0];
      const { data: txs } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate);
      const income = txs?.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0) ?? 0;
      const expense = txs?.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) ?? 0;
      return income > expense;
    }
    case "ai_trainer": {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("ai_classified", false);
      return (count ?? 0) >= 10;
    }
    default:
      return false;
  }
}
```

---

### 8.6 `app/api/streak/route.ts`

**Fungsi:** GET data streak, PATCH update streak setelah transaksi

**Yang perlu dilakukan:**
- GET: hapus `return NextResponse.json({ data: null, error: null });` dan uncomment kode TODO
- PATCH: hapus `return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });` dan uncomment kode TODO

---

### 8.7 `app/api/reminders/route.ts`

**Fungsi:** GET konfigurasi reminder user, POST buat/update reminder

**Yang perlu dilakukan:**
- GET: hapus `return NextResponse.json({ data: null, error: null });` dan uncomment kode TODO
- POST: hapus return `{ status: 501 }` dan uncomment kode TODO

---

### 8.8 `app/api/ai/classify/route.ts`

**File ini TIDAK perlu diubah.** Sudah selesai dan berfungsi. AI classifier sudah ada fallback keyword otomatis jika `HUGGINGFACE_API_TOKEN` tidak diisi.

---

### 8.9 `app/api/auth/callback/route.ts`

**File ini TIDAK perlu diubah.** Sudah selesai dan siap pakai.

---

### 8.10 `app/api/categories/route.ts`

**File ini TIDAK perlu diubah.** Kategori bersifat static, tidak butuh database.

---

### 8.11 `app/(auth)/login/page.tsx`

**File:** `app/(auth)/login/page.tsx`

Cari fungsi `handleLogin` (sekitar baris 41). Hapus kode mock dan ganti dengan Supabase:

```typescript
// HAPUS ini (mock):
await new Promise((resolve) => setTimeout(resolve, 1000));
toast.success("Welcome back! 👋");
router.push("/dashboard");

// GANTI dengan ini:
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  if (error.message.includes("Invalid login credentials")) {
    toast.error("Email atau password salah");
  } else {
    toast.error(error.message);
  }
  return;
}

toast.success("Welcome back! 👋");
router.push("/dashboard");
```

Tambahkan juga import di bagian atas file:
```typescript
import { createClient } from "@/lib/supabase/client";
```

**Untuk tombol Google OAuth** (opsional — jika ingin aktifkan login Google):
```typescript
// Di onClick tombol "Continue with Google":
const supabase = createClient();
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`,
  },
});
```
> Aktifkan Google provider dulu di: Supabase Dashboard → Authentication → Providers → Google

---

### 8.12 `app/(auth)/register/page.tsx`

**File:** `app/(auth)/register/page.tsx`

Cari fungsi `handleRegister` (sekitar baris 47). Hapus mock dan ganti:

```typescript
// HAPUS ini (mock):
await new Promise((resolve) => setTimeout(resolve, 1200));
toast.success("Account created! Welcome to Spendly 🎉");
router.push("/dashboard");

// GANTI dengan ini:
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName },
  },
});

if (error) {
  toast.error(error.message);
  return;
}

if (data.user) {
  // Buat profil user di tabel user_profiles
  await supabase.from("user_profiles").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    currency: "IDR",
    timezone: "Asia/Jakarta",
  });
}

toast.success("Akun berhasil dibuat! Cek email untuk verifikasi 📧");
router.push("/login");
```

> Catatan: jika trigger `on_auth_user_created` di database sudah aktif (Langkah 4), insert ke `user_profiles` sudah otomatis. Kamu bisa skip bagian `await supabase.from("user_profiles").insert(...)` jika trigger sudah berjalan.

---

### 8.13 `app/(app)/settings/page.tsx`

**File:** `app/(app)/settings/page.tsx`

**Fungsi `handleSaveProfile`** — ganti kode mock:

```typescript
// HAPUS:
await new Promise((r) => setTimeout(r, 800));
toast.success("Profile updated!");

// GANTI dengan:
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;

const { error } = await supabase
  .from("user_profiles")
  .update({ full_name: fullName })
  .eq("id", user.id);

if (error) {
  toast.error("Gagal menyimpan profil");
  return;
}
toast.success("Profile updated!");
```

**Fungsi `handleSaveReminder`** — ganti kode mock:

```typescript
// HAPUS:
await new Promise((r) => setTimeout(r, 800));
toast.success("Reminder settings saved! 📬");

// GANTI dengan:
const response = await fetch("/api/reminders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: reminderEmail,
    frequency: reminderFrequency,
    time: reminderFrequency === "daily" ? reminderTime : null,
    is_active: reminderEnabled,
  }),
});

if (!response.ok) {
  toast.error("Gagal menyimpan pengaturan reminder");
  return;
}
toast.success("Reminder settings saved! 📬");
```

---

## 9. Update Store & Hooks (Hapus Mock)

Setelah semua API route selesai diimplementasi, kamu perlu menghapus penggunaan mock data dari dua file ini:

---

### 9.1 Edit `store/useAppStore.ts`

**File:** `store/useAppStore.ts`

**Yang perlu diubah:**

1. **Hapus semua import mock data** (baris 27–33):
   ```typescript
   // HAPUS baris-baris ini:
   import {
     MOCK_TRANSACTIONS,
     MOCK_BUDGETS,
     MOCK_STREAK,
     MOCK_USER_ACHIEVEMENTS,
     MOCK_DASHBOARD_SUMMARY,
     MOCK_CATEGORY_SPENDING,
     MOCK_MONTHLY_DATA,
   } from "@/lib/mock/data";
   ```

2. **Hapus fungsi `initializeMockData`** dari interface dan implementasi (cari `initializeMockData` dan hapus semua yang berkaitan)

3. **Hapus method `initializeMockData`** dari object yang di-return di dalam `create()`

---

### 9.2 Edit `hooks/useTransactions.ts`

**File:** `hooks/useTransactions.ts`

Untuk setiap fungsi (`createTransaction`, `correctCategory`, `removeTransaction`), lakukan ini:

**`createTransaction`** — hapus bagian mock dan uncomment bagian TODO:

```typescript
// HAPUS ini (mock implementation):
const newTransaction: Transaction = {
  id: `t${Date.now()}`,
  user_id: "user-123",
  ...input,
  created_at: new Date().toISOString(),
};
addTransaction(newTransaction);
toast.success("Transaction added! 🎉");
return true;

// UNCOMMENT ini (real API call):
const response = await fetch("/api/transactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(input),
});
if (!response.ok) throw new Error("Failed to create transaction");
const data = await response.json();
addTransaction(data.data);
toast.success("Transaction added! 🎉");
return true;
```

**`correctCategory`** — uncomment TODO untuk PATCH:

```typescript
// HAPUS mock:
updateTransaction(transactionId, {
  category_id: newCategoryId as Transaction["category_id"],
  ai_classified: false,
});
toast.success("Category updated!");
return true;

// UNCOMMENT:
const response = await fetch(`/api/transactions/${transactionId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ category_id: newCategoryId, ai_classified: false }),
});
if (!response.ok) throw new Error("Failed to update category");
updateTransaction(transactionId, { category_id: newCategoryId as Transaction["category_id"], ai_classified: false });
toast.success("Category updated!");
return true;
```

**`removeTransaction`** — uncomment TODO untuk DELETE:

```typescript
// HAPUS mock:
deleteTransaction(transactionId);
toast.success("Transaction deleted");
return true;

// UNCOMMENT:
const response = await fetch(`/api/transactions/${transactionId}`, { method: "DELETE" });
if (!response.ok) throw new Error("Failed to delete transaction");
deleteTransaction(transactionId);
toast.success("Transaction deleted");
return true;
```

---

### 9.3 `hooks/useGamification.ts`

**File ini TIDAK perlu diubah.** Hook ini hanya membaca data dari Zustand store (`streak` dan `achievements`). Selama store diisi dengan data real (dilakukan di Langkah 9.4), hook ini langsung berfungsi.

---

### 9.4 Update `store/useAppStore.ts` — Tambah Setters

**File:** `store/useAppStore.ts`

Setelah menghapus mock di Langkah 9.1, tambahkan dua setter baru ke store karena `categorySpending` dan `monthlyData` belum punya setter. Tambahkan di interface `AppState` dan di dalam `create()`:

**Di interface `AppState`** — tambahkan setelah baris `setSummary`:
```typescript
setCategorySpending: (data: CategorySpending[]) => void;
setMonthlyData: (data: MonthlyData[]) => void;
```

**Di dalam `create()`** — tambahkan setelah `setSummary`:
```typescript
setCategorySpending: (categorySpending) => set({ categorySpending }),
setMonthlyData: (monthlyData) => set({ monthlyData }),
```

---

### 9.5 Update `app/(app)/layout.tsx` — Ganti initializeMockData

**File:** `app/(app)/layout.tsx`

Ini adalah perubahan terpenting. File ini saat ini memanggil `initializeMockData()` saat app dibuka. Setelah backend siap, ganti dengan fetch data real dari API.

**Ganti seluruh isi file dengan ini:**

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, CategorySpending, MonthlyData, DashboardSummary } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    setTransactions, setBudgets, setStreak, setAchievements,
    setSummary, setCategorySpending, setMonthlyData,
  } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch semua data secara paralel untuk performa
      const [txRes, budgetRes, streakRes, achRes] = await Promise.all([
        fetch("/api/transactions?per_page=100"),
        fetch("/api/budget"),
        fetch("/api/streak"),
        fetch("/api/achievements"),
      ]);

      const [txData, budgetData, streakData, achData] = await Promise.all([
        txRes.json(),
        budgetRes.json(),
        streakRes.json(),
        achRes.json(),
      ]);

      const transactions: Transaction[] = txData.data ?? [];
      setTransactions(transactions);
      setBudgets(budgetData.data ?? []);
      if (streakData.data) setStreak(streakData.data);
      setAchievements(achData.data ?? []);

      // Hitung summary dari transaksi
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const thisMonth = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });

      const total_income = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const total_expense = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      const summary: DashboardSummary = {
        total_income,
        total_expense,
        net_balance: total_income - total_expense,
        transaction_count: thisMonth.length,
        month,
        year,
      };
      setSummary(summary);

      // Hitung spending per kategori (pie chart)
      const expenseByCategory = new Map<string, number>();
      thisMonth.filter((t) => t.type === "expense").forEach((t) => {
        expenseByCategory.set(t.category_id, (expenseByCategory.get(t.category_id) ?? 0) + t.amount);
      });
      const categorySpending: CategorySpending[] = Array.from(expenseByCategory.entries()).map(([category_id, total]) => ({
        category_id: category_id as CategorySpending["category_id"],
        total,
        percentage: total_expense > 0 ? (total / total_expense) * 100 : 0,
        transaction_count: thisMonth.filter((t) => t.category_id === category_id).length,
      }));
      setCategorySpending(categorySpending);

      // Hitung data 6 bulan terakhir (bar chart)
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(year, month - 1 - i, 1);
        return { label: d.toLocaleString("en-US", { month: "short" }), month: d.getMonth() + 1, year: d.getFullYear() };
      }).reverse();

      const monthlyData: MonthlyData[] = months.map(({ label, month: m, year: y }) => {
        const monthTx = transactions.filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() + 1 === m && d.getFullYear() === y;
        });
        return {
          month: label,
          income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expense: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
      setMonthlyData(monthlyData);
    };

    loadData();
  }, [setTransactions, setBudgets, setStreak, setAchievements, setSummary, setCategorySpending, setMonthlyData, router]);

  return (
    <div className="gradient-mesh flex h-full min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 10. Aktifkan Route Protection (Middleware)

**File:** `proxy.ts` (ini adalah middleware Next.js)

Cari bagian ini (sekitar baris 54–66):

```typescript
/**
 * TODO (Backend): Uncomment setelah auth Supabase siap
 *
 * const protectedRoutes = ["/dashboard", "/transactions", "/budget", "/achievements", "/settings"];
 * const authRoutes = ["/login", "/register"];
 *
 * if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
 *   return NextResponse.redirect(new URL("/login", request.url));
 * }
 * if (authRoutes.some((r) => pathname.startsWith(r)) && user) {
 *   return NextResponse.redirect(new URL("/dashboard", request.url));
 * }
 */
```

**Uncomment** semua kode di dalam `/** ... */` tersebut (hapus `/**`, `*/`, dan `*` di awal setiap baris).

Setelah diubah, hasilnya seperti ini:

```typescript
const protectedRoutes = ["/dashboard", "/transactions", "/budget", "/achievements", "/settings"];
const authRoutes = ["/login", "/register"];

if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
  return NextResponse.redirect(new URL("/login", request.url));
}
if (authRoutes.some((r) => pathname.startsWith(r)) && user) {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
```

---

## 11. Setup Smart Reminders (Edge Function)

Fitur ini mengirim email pengingat ke user secara otomatis (cron job).

### 11a. Install Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 11b. Buat Edge Function

Buat file baru: `supabase/functions/send-reminders/index.ts`

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const now = new Date();
  const currentHour = now.getUTCHours() + 7; // Convert ke WIB
  const currentTime = `${String(currentHour % 24).padStart(2, "0")}:00`;

  // Ambil semua reminder aktif yang jadwalnya cocok
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_active", true)
    .or(`frequency.eq.hourly,and(frequency.eq.daily,time.eq.${currentTime})`);

  if (!reminders?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  let sent = 0;

  for (const reminder of reminders) {
    // Kirim email menggunakan Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL") ?? "reminder@spendly.app",
        to: reminder.email,
        subject: "Jangan lupa catat pengeluaranmu hari ini! 💰",
        html: `
          <h2>Hai! 👋</h2>
          <p>Sudah catat transaksi hari ini belum?</p>
          <p>Yuk buka <a href="${Deno.env.get("NEXT_PUBLIC_APP_URL")}/dashboard">Spendly</a> dan catat pengeluaranmu sekarang!</p>
          <p>Jaga streak-mu tetap hidup! 🔥</p>
          <hr>
          <small>Untuk berhenti menerima reminder, buka Settings di Spendly.</small>
        `,
      }),
    });

    if (res.ok) sent++;
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});
```

### 11c. Deploy Edge Function

```bash
supabase functions deploy send-reminders --project-ref <project-ref-kamu>
```

> `project-ref` bisa ditemukan di Supabase Dashboard URL: `https://supabase.com/dashboard/project/**ini-project-ref-kamu**`

### 11d. Set Environment Variables di Edge Function

Di Supabase Dashboard:
1. Sidebar → **"Edge Functions"** → pilih `send-reminders`
2. Tab **"Settings"** → **"Environment Variables"**
3. Tambahkan semua env vars dari `.env.local` (RESEND_API_KEY, RESEND_FROM_EMAIL, NEXT_PUBLIC_APP_URL)

### 11e. Buat Cron Job

1. Supabase Dashboard → **"Database"** → **"Extensions"**
2. Aktifkan extension **`pg_cron`** (cari dan klik toggle)
3. Buka **SQL Editor** dan jalankan:

```sql
-- Jalankan Edge Function setiap jam
SELECT cron.schedule(
  'send-reminders-hourly',
  '0 * * * *',  -- setiap jam tepat
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
  ) AS request_id;
  $$
);
```

> Ganti `<project-ref>` dengan Project Ref Supabase-mu, dan `<SUPABASE_SERVICE_ROLE_KEY>` dengan service role key aslinya.

---

## 12. File yang HARUS Dihapus Sebelum Deploy

> Setelah semua implementasi selesai dan sudah ditest, hapus file-file ini sebelum deploy ke production.

### File yang HARUS dihapus:

| File | Lokasi | Alasan |
|------|--------|--------|
| `data.ts` | `lib/mock/data.ts` | Data dummy — tidak boleh ada di production |

### Cara menghapus:

```bash
# Hapus file mock data
rm lib/mock/data.ts
```

### Setelah menghapus, pastikan semua langkah ini sudah dikerjakan:

1. `store/useAppStore.ts` — import mock dihapus, setter baru ditambahkan (Langkah 9.1 + 9.4)
2. `hooks/useTransactions.ts` — mock diganti real API calls (Langkah 9.2)
3. `app/(app)/layout.tsx` — `initializeMockData()` diganti fetch real data (Langkah 9.5)
4. `app/(auth)/login/page.tsx` — Supabase auth diimplementasi (Langkah 8.11)
5. `app/(auth)/register/page.tsx` — Supabase auth diimplementasi (Langkah 8.12)
6. `app/(app)/settings/page.tsx` — save profil & reminder diimplementasi (Langkah 8.13)
7. Tidak ada file lain yang masih import dari `lib/mock/data`

**Cara cek apakah masih ada yang import mock:**
```bash
grep -r "lib/mock/data" --include="*.ts" --include="*.tsx" .
# Kalau tidak ada output = aman untuk dihapus
```

---

## 13. Deploy ke Vercel

### 13a. Persiapan

1. Pastikan project sudah di push ke GitHub (ke branch masing-masing)
2. Pastikan `node_modules/` dan `.env.local` ada di `.gitignore` ✅ (sudah ada)

### 13b. Deploy

1. Buka **https://vercel.com** → Login dengan GitHub
2. Klik **"Add New Project"** → Import repository Spendly
3. **Framework Preset:** otomatis terdeteksi sebagai Next.js ✅
4. **Root Directory:** `spendly` (jika repo memiliki folder lain di root)

### 13c. Set Environment Variables di Vercel

Di halaman konfigurasi deploy Vercel, klik **"Environment Variables"** dan tambahkan semua variable dari `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL         = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY    = eyJ...
SUPABASE_SERVICE_ROLE_KEY        = eyJ...
HUGGINGFACE_API_TOKEN            = hf_xxx
RESEND_API_KEY                   = re_xxx
RESEND_FROM_EMAIL                = reminder@spendly.app
NEXT_PUBLIC_APP_URL              = https://spendly-kamu.vercel.app
```

> **PENTING:** `NEXT_PUBLIC_APP_URL` harus diisi dengan URL Vercel yang asli (bukan localhost)

### 13d. Setelah Deploy

1. Copy URL deployment Vercel (contoh: `https://spendly-xxx.vercel.app`)
2. Kembali ke Supabase Dashboard → **"Authentication"** → **"URL Configuration"**
3. Tambahkan URL production ke Redirect URLs:
   ```
   https://spendly-xxx.vercel.app/api/auth/callback
   ```
4. Update **Site URL** ke URL production

---

## 14. Checklist Final

Centang setiap item sebelum push ke production:

### Setup Supabase
- [ ] Project Supabase sudah dibuat
- [ ] Semua 6 tabel sudah dibuat (user_profiles, transactions, budgets, user_achievements, user_streaks, reminders)
- [ ] Trigger `on_auth_user_created` sudah aktif
- [ ] RLS sudah diaktifkan di semua tabel
- [ ] Semua policies sudah dibuat
- [ ] Auth email/password sudah diaktifkan
- [ ] Redirect URL sudah didaftarkan

### Konfigurasi
- [ ] `.env.local` sudah diisi semua variable
- [ ] `NEXT_PUBLIC_APP_URL` sudah sesuai (localhost untuk dev, URL Vercel untuk production)

### Implementasi Halaman Auth & Settings
- [ ] `app/(auth)/login/page.tsx` — Supabase signIn diimplementasi
- [ ] `app/(auth)/register/page.tsx` — Supabase signUp + insert profil diimplementasi
- [ ] `app/(app)/settings/page.tsx` — save profil dan save reminder diimplementasi

### Implementasi API Routes
- [ ] `app/api/transactions/route.ts` — GET dan POST sudah diimplementasi
- [ ] `app/api/transactions/[id]/route.ts` — GET, PATCH, DELETE sudah diimplementasi
- [ ] `app/api/budget/route.ts` — GET dan POST sudah diimplementasi
- [ ] `app/api/budget/[id]/route.ts` — PATCH dan DELETE sudah diimplementasi
- [ ] `app/api/achievements/route.ts` — GET dan POST sudah diimplementasi
- [ ] `app/api/streak/route.ts` — GET dan PATCH sudah diimplementasi
- [ ] `app/api/reminders/route.ts` — GET dan POST sudah diimplementasi

### Hapus Mock & Update Layout
- [ ] Import mock data di `store/useAppStore.ts` sudah dihapus
- [ ] Setter `setCategorySpending` dan `setMonthlyData` ditambahkan ke store
- [ ] `initializeMockData` di `store/useAppStore.ts` dan `layout.tsx` sudah dihapus
- [ ] `app/(app)/layout.tsx` sudah diganti dengan kode fetch data real (Langkah 9.5)
- [ ] Mock implementation di `hooks/useTransactions.ts` sudah diganti real API calls
- [ ] File `lib/mock/data.ts` sudah dihapus
- [ ] Tidak ada file lain yang masih import mock data (`grep -r "lib/mock/data" .`)

### Route Protection
- [ ] `proxy.ts` — route protection sudah di-uncomment

### Email Reminder (Opsional tapi direkomendasikan)
- [ ] Akun Resend sudah dibuat dan API key sudah didapat
- [ ] Edge Function `send-reminders` sudah di-deploy
- [ ] Cron job sudah diset

### Deploy
- [ ] `lib/mock/data.ts` sudah dihapus
- [ ] Project berhasil di-build (`npm run build` tanpa error)
- [ ] Deploy ke Vercel berhasil
- [ ] URL production sudah ditambahkan ke Supabase Redirect URLs
- [ ] Test login/register di URL production berhasil
- [ ] Test tambah transaksi berhasil tersimpan di database

---

## Referensi

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JavaScript Client:** https://supabase.com/docs/reference/javascript
- **Next.js App Router API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Resend Email API:** https://resend.com/docs
- **HuggingFace Inference API:** https://huggingface.co/docs/api-inference

---

*Kalau ada pertanyaan tentang struktur frontend atau TypeScript types, lihat `types/index.ts` — semua interface sudah terdefinisi lengkap di sana.*
