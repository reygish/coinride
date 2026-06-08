# CoinRide — Project Documentation

> **CoinRide** is an AI-powered personal finance tracker built with Next.js and Supabase, featuring automatic transaction categorization via a Hugging Face model and a gamification system to keep users consistently engaged.

**Live App:** https://coinride.vercel.app
**GitHub:** https://github.com/reygish/coinride

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [AI Classification System](#7-ai-classification-system)
8. [Gamification System](#8-gamification-system)
9. [Pages & Features Reference](#9-pages--features-reference)
10. [Authentication & Security](#10-authentication--security)
11. [Getting Started (Local Development)](#11-getting-started-local-development)
12. [Environment Variables](#12-environment-variables)
13. [Scripts](#13-scripts)
14. [Team](#14-team)

---

## 1. Project Overview

CoinRide solves a common problem among young adults (students and young professionals, ages 17–30): the lack of a simple, engaging habit for tracking daily finances. Most finance apps are too complex, have long forms, and offer no motivation to keep using them consistently.

CoinRide addresses this by combining:

- **Simplicity**: Fast transaction logging with natural language input (supports Bahasa Indonesia & English)
- **Intelligence**: AI-powered auto-categorization — type "nasi goreng 15k" and the app automatically categorizes it as _Food_
- **Engagement**: A gamification system (XP, Levels, Streaks, Achievements, Leaderboard) that makes saving money feel like a game

### Core Philosophy

> _"The key to consistency is simplicity."_

Every design decision prioritizes getting out of the user's way. Logging a transaction should take under 10 seconds.

---

## 2. Features

### Transaction Management

- Log income and expense transactions with a text description
- AI auto-categorizes the transaction on submission
- Manual category override available if AI is wrong
- Filter transactions by type, category, or date
- Payment method tracking

### Dashboard & Analytics

- **Spending by Category** — donut chart showing expense breakdown per category
- **Weekly Spending Chart** — bar chart of the past 7 days
- **Monthly Spending Chart** — month-over-month spending overview
- Real-time data from Supabase, updated on each transaction

### Budget Management

- Set spending limits per category (daily, weekly, or monthly)
- Edit or delete budgets
- Summary of total budgeted amount
- Budget periods auto-compute end date from start date

### Saving Goals

- Create goals with a target amount and optional deadline
- Visual progress bar showing percentage completion
- Update current saved amount at any time
- Automatically marks goal as `completed` when target is reached

### Gamification

| Feature                   | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| **XP System**             | Earn XP on every transaction logged                                       |
| **Level System**          | Level up every 1000 XP — `Level = floor(total_xp / 1000) + 1`             |
| **Streak System**         | Daily logging streak — the longer the streak, the more XP per transaction |
| **Achievements / Badges** | Unlock badges at level milestones                                         |
| **Leaderboard**           | Top 10 users ranked by level and total XP                                 |

### Achievements Available

| Badge          | Unlock Condition           |
| -------------- | -------------------------- |
| Beginner Badge | Log your first transaction |
| Bronze Saver   | Reach Level 5              |
| Silver Saver   | Reach Level 10             |
| Gold Saver     | Reach Level 30             |
| Gold+ Saver    | Reach Level 50             |
| Diamond Saver  | Reach Level 80             |

### Notifications

- In-app notification center for reminders and budget alerts
- Mark all as read functionality
- Read/unread status per notification

### Profile & Settings

- Upload profile picture and set bio
- Switch preferred currency (IDR, USD, EUR, SGD)
- Toggle dark/light mode
- Enable or disable notification preferences

### Authentication

- Email/password sign-up and login via Supabase Auth
- Google OAuth button (UI ready, backend integration in progress)
- Secure session management with server-side validation
- Auto-redirect to dashboard if already authenticated

---

## 3. Tech Stack

| Layer              | Technology                                                                          | 
| ------------------ | ----------------------------------------------------------------------------------- | 
| Frontend Framework | [Next.js](https://nextjs.org/)                                                      | 
| UI Library         | [React](https://react.dev/)                                                         | 
| Language           | TypeScript                                                                          | 
| Styling            | [Tailwind CSS](https://tailwindcss.com/)                                            | 
| UI Components      | [Radix UI](https://www.radix-ui.com/)                                               | 
| Animation          | [Framer Motion](https://www.framer.com/motion/)                                     |
| Charts             | [Recharts](https://recharts.org/)                                                   |
| State Management   | [Zustand](https://zustand-demo.pmnd.rs/)                                            | 
| Database & Auth    | [Supabase](https://supabase.com/)                                                   | 
| AI Model           | [Hugging Face Spaces](https://huggingface.co/spaces/reygish/finance-categorization) | 
| AI Client          | [@gradio/client](https://www.npmjs.com/package/@gradio/client)                      |
| Icons              | [Lucide React](https://lucide.dev/)                                                 |
| Testing            | [Vitest](https://vitest.dev/)                                                       | 
| Deployment         | [Vercel](https://vercel.com/)                                                       | 

---

## 4. Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────┐
│              Browser (Client)                │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │         Next.js App (React 19)          │ │
│  │                                         │ │
│  │  ┌──────────┐   ┌──────────────────┐    │ │
│  │  │  Pages   │   │   Components     │    │ │
│  │  │ /dash    │   │ Sidebar, Charts  │    │ │
│  │  │ /trans   │   │ Forms, Topbar    │    │ │
│  │  │ /budget  │   │ ThemeToggle      │    │ │
│  │  │ ...      │   └──────────────────┘    │ │
│  │  └────┬─────┘                           │ │
│  └───────┼─────────────────────────────────┘ │
└──────────┼───────────────────────────────────┘
           │
    ┌──────┴──────────────────────────┐
    │                                 │
    ▼                                 ▼
┌──────────────────┐      ┌───────────────────────┐
│    Supabase      │      │  Hugging Face Spaces  │
│                  │      │                       │
│  PostgreSQL DB   │      │  reygish/finance-     │
│  Auth (JWT)      │      │  categorization       │
│  DB Triggers     │      │  (Gradio API)         │
└──────────────────┘      └───────────────────────┘

```

### Data Flow: Adding a Transaction

```
User types description →
  Client calls classifyTransaction() (Server Action) →
    Gradio API at Hugging Face returns category →
  User reviews & confirms →
  Client inserts to Supabase transactions table →
    PostgreSQL trigger fires (trg_apply_transaction_xp) →
      Updates user_profiles: XP, level, streak →
  Client re-fetches transactions →
  Dashboard charts auto-refresh
```

### Authentication Flow

```
User submits login form →
  lib/auth/auth.ts calls Supabase Auth →
    Supabase validates credentials →
    JWT stored in HTTP-only cookie →
  Next.js middleware checks cookie on every request →
    Valid: pass through to protected route
    Invalid: redirect to /login
```

---

## 5. Project Structure

```
coinride/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root HTML layout, ThemeProvider, UserProvider
│   ├── page.tsx                  # Landing page (public)
│   ├── global.css                # Global styles, CSS variables, theme tokens
│   │
│   ├── (app)/                    # Protected route group (requires auth)
│   │   ├── layout.tsx            # App shell: Sidebar + Topbar wrapper
│   │   ├── _components/          # Layout components
│   │   │   ├── Sidebar.tsx       # Navigation sidebar with all menu items
│   │   │   ├── Topbar.tsx        # Top navigation bar
│   │   │   └── ThemeToggle.tsx   # Dark/light mode toggle button
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Charts: Spending by Category, Weekly, Monthly
│   │   │
│   │   ├── transactions/
│   │   │   ├── page.tsx          # Transaction list + add form
│   │   │   └── _components/      # TransactionManager component
│   │   │   └── _lib/             # queries.ts, types.ts for transactions
│   │   │
│   │   ├── budgets/
│   │   │   └── page.tsx          # Budget creation, list, edit, delete
│   │   │
│   │   ├── saving-goals/
│   │   │   └── page.tsx          # Saving goal creation, progress tracking
│   │   │
│   │   ├── achievements/
│   │   │   └── page.tsx          # All achievements grid (locked/unlocked)
│   │   │
│   │   ├── leaderboard/
│   │   │   └── page.tsx          # Top 10 users by level + XP
│   │   │
│   │   ├── notifications/
│   │   │   └── page.tsx          # Notification list + mark all read
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile view and edit
│   │   │
│   │   └── settings/
│   │       └── page.tsx          # Currency, notifications, theme settings
│   │
│   └── (auth)/                   # Public auth route group
│       ├── login/
│       │   └── page.tsx          # Login form (email/password + Google OAuth)
│       └── register/
│           └── page.tsx          # Registration form
│
├── components/                   # Shared reusable components
│   ├── ui/                       # Base components (Radix UI wrappers)
│   ├── charts/
│   │   ├── SpendingChart.tsx     # Category spending donut chart
│   │   ├── WeeklySpendingChart.tsx  # 7-day bar chart
│   │   └── MonthlySpendingChart.tsx # Monthly area chart
│   ├── CategoryDropdown.tsx      # AI-powered category selector
│   └── currentYear.tsx           # Utility component for copyright year
│
├── lib/                          # Utility functions and service clients
│   ├── supabase/
│   │   ├── client.ts             # Browser-side Supabase client
│   │   ├── server.ts             # Server-side Supabase client (cookies)
│   │   └── proxy.ts              # Auth session refresh route handler
│   ├── auth/
│   │   └── auth.ts               # loginWithPassword, register functions
│   ├── classifier/
│   │   └── classifyTransaction.ts  # Server Action calling Hugging Face AI
│   ├── category/                 # Category utility functions
│   ├── utils/
│   │   ├── formatters.ts         # formatCurrency, formatDate utilities
│   │   └── utils.ts              # cn() class merging utility (clsx + twMerge)
│   └── utils.ts                  # Root utils export
│
├── types/                        # TypeScript type definitions
│   ├── achievement.ts
│   ├── budget.ts
│   ├── category.ts
│   ├── notification.ts
│   ├── saving_goal.ts
│   └── dto/
│       └── predictionResponse.ts # Hugging Face API response type
│
├── supabase/
│   └── migrations/
│       ├── 20260525101840_remote_schema.sql  # Full DB schema
│       ├── 20260525121400_create_xp_level_streak.sql  # XP columns
│       └── 20260525122046_xp_triggers.sql    # XP calculation trigger
│
├── public/                       # Static assets
├── env/                          # Environment variable types
├── package.json                  # Dependencies
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── vitest.config.ts              # Vitest test configuration
```

---

## 6. Database Schema

### Tables Overview

| Table           | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `user_profiles` | Extended user data: balance, preferences, XP, level, streak |
| `transactions`  | All income and expense records                              |
| `categories`    | Transaction categories (system defaults + user-created)     |
| `budgets`       | Spending limits per category per time period                |
| `saving_goals`  | Financial goals with progress tracking                      |
| `achievements`  | Unlocked badges per user                                    |
| `notifications` | In-app notifications and reminders                          |

### Table Definitions

#### `user_profiles`

```sql
CREATE TABLE user_profiles (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name             TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  profile_picture_url   TEXT,
  bio                   TEXT,
  total_balance         NUMERIC(15,2) DEFAULT 0,
  available_balance     NUMERIC(15,2) DEFAULT 0,
  currency              TEXT DEFAULT 'IDR',
  dark_mode             BOOLEAN DEFAULT false,
  receive_notifications BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  -- Gamification columns (added via migration)
  total_xp              NUMERIC(15,2) DEFAULT 0,
  level                 INTEGER DEFAULT 1,
  streak_count          INTEGER DEFAULT 0,
  last_streak_date      DATE
);
```

#### `transactions`

```sql
CREATE TABLE transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id      UUID NOT NULL REFERENCES categories ON DELETE SET NULL,
  budget_id        UUID REFERENCES budgets ON DELETE SET NULL,
  description      TEXT,
  amount           NUMERIC(15,2) NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  transaction_date TIMESTAMPTZ NOT NULL,
  payment_method   TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

#### `categories`

```sql
CREATE TABLE categories (
  id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,  -- NULL = system category
  name    TEXT NOT NULL,
  icon    TEXT,
  color   TEXT
);
```

#### `budgets`

```sql
CREATE TABLE budgets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories ON DELETE CASCADE,
  amount      NUMERIC(15,2) NOT NULL,
  period      TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ NOT NULL
);
```

#### `saving_goals`

```sql
CREATE TABLE saving_goals (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title            TEXT NOT NULL,
  target_amount    NUMERIC(15,2) NOT NULL,
  current_amount   NUMERIC(15,2) DEFAULT 0,
  allocated_amount NUMERIC(15,2) DEFAULT 0,
  target_date      TIMESTAMPTZ,
  is_completed     BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

#### `achievements`

```sql
CREATE TABLE achievements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now()
);
```

#### `notifications`

```sql
CREATE TABLE notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes

```sql
CREATE INDEX idx_transactions_user_id        ON transactions(user_id);
CREATE INDEX idx_transactions_category_id    ON transactions(category_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_budgets_user_id             ON budgets(user_id);
CREATE INDEX idx_saving_goals_user_id        ON saving_goals(user_id);
CREATE INDEX idx_notifications_user_id       ON notifications(user_id);
```

### Database Triggers

#### `trg_apply_transaction_xp`

Fires `AFTER INSERT` on `transactions`. Calculates and updates XP, level, and streak in `user_profiles`.

**Logic:**

```
IF last_streak_date == today      → keep streak as-is
ELSE IF last_streak_date == yesterday → streak += 1
ELSE                               → streak = 1

xp_gain = 10 × streak_count
total_xp += xp_gain
level = floor(total_xp / 1000) + 1
```

#### `handle_new_user_profile`

Fires `AFTER INSERT` on `auth.users`. Auto-creates a `user_profiles` record with default values when a new user registers.

---

## 7. AI Classification System

### Model

- **Space:** `reygish/finance-categorization`
- **Platform:** Hugging Face Spaces (Gradio)
- **Client library:** `@gradio/client`

### How It Works

The classifier accepts a free-text transaction description and returns a category string.

```typescript
// lib/classifier/classifyTransaction.ts
"use server";

import { Client } from "@gradio/client";
import { PredictionResponse } from "../../types/dto/predictionResponse";

export async function classifyTransaction(description: string) {
  const client = await Client.connect("reygish/finance-categorization");
  const result = await client.predict("/categorize", { description });
  const data = result.data as PredictionResponse[];
  return data[0].category;
}
```

This is a **Next.js Server Action** (`"use server"`), which means:

- The Hugging Face API call happens on the server, not in the browser
- No API keys exposed to the client
- Reduces client-side bundle size

### Input Examples

| User Input               | Detected Category |
| ------------------------ | ----------------- |
| `nasi goreng 15k`        | Food              |
| `bayar listrik 200rb`    | Bills             |
| `mcdonalds 80k`          | Food              |
| `monthly gym membership` | Health            |
| `isi bensin motor`       | Transport         |
| `beli buku kuliah`       | Education         |
| `netflix subscription`   | Entertainment     |

### Manual Override

If the AI classification is wrong, users can manually select the correct category from the `CategoryDropdown` component before submitting.

---

## 8. Gamification System

### Overview

The gamification system is implemented entirely at the **database level** using PostgreSQL triggers. This ensures XP is always calculated correctly regardless of the client state.

### XP Calculation

Every time a user inserts a new transaction:

```
streak_gain:
  - If logged today already       → streak stays the same
  - If logged yesterday           → streak += 1
  - If missed a day or more       → streak resets to 1

xp_per_transaction = 10 × streak_count

Examples:
  Day 1 (streak=1): +10 XP
  Day 2 (streak=2): +20 XP
  Day 3 (streak=3): +30 XP
  Day 5 after missing Day 4: streak resets → +10 XP
```

### Level System

```
Level = floor(total_xp / 1000) + 1

XP needed per level:
  Level 1: 0 XP
  Level 2: 1,000 XP
  Level 3: 2,000 XP
  Level 10: 9,000 XP
  Level 50: 49,000 XP
```

### Achievement Unlock Conditions

Achievements are stored in the `achievements` table. The system checks level milestones:

| Achievement    | Required Level          |
| -------------- | ----------------------- |
| Beginner Badge | Any (first transaction) |
| Bronze Saver   | Level 5                 |
| Silver Saver   | Level 10                |
| Gold Saver     | Level 30                |
| Gold+ Saver    | Level 50                |
| Diamond Saver  | Level 80                |

### Leaderboard

Query on `user_profiles` ordered by `level DESC, total_xp DESC`, limited to top 10 users. Visible to all authenticated users.

---

## 9. Pages & Features Reference

### Landing Page (`/`)

- Hero section with animated gradient background and mockup dashboard
- Feature highlights: Adaptive Categorization, Live Insights, Goal Tracking
- Gamification showcase: Badges, Streak, XP, Leaderboard
- CTA buttons: "Get started free" → `/register`, "Sign in" → `/login`
- Auto-redirects to `/dashboard` if user already has a session

### Dashboard (`/dashboard`)

Three charts rendered with Recharts:

- `SpendingChart` — spending breakdown by category
- `WeeklySpendingChart` — last 7 days spending bar chart
- `MonthlySpendingChart` — monthly aggregate chart

### Transactions (`/transactions`)

- Lists all transactions with type, category, amount, date
- Filter by: income/expense type, category, date range
- Add transaction form with:
  - Description field (triggers AI classification)
  - Amount input with currency display
  - Category dropdown (pre-filled by AI, manually overridable)
  - Date picker
  - Payment method selector

### Budgets (`/budgets`)

Two-panel layout:

- **Left**: Form to create new budget (category, amount, period, start date)
- **Right**: List of active budgets with edit/delete per item
- Summary card showing total budgeted amount

### Saving Goals (`/saving-goals`)

Two-panel layout:

- **Left**: Form to create new goal (name, target amount, current saved, optional deadline)
- **Right**: Goal cards with:
  - Progress bar (percentage of target reached)
  - Inline update of current saved amount
  - Auto-marks complete when `current_amount >= target_amount`

### Achievements (`/achievements`)

Grid of all 6 achievement cards:

- **Unlocked**: Full opacity, primary icon color, unlock date shown
- **Locked**: Dimmed, muted icon, "Not unlocked yet"

### Leaderboard (`/leaderboard`)

Ranked list (1–10) of all users by level + XP:

- Rank number, full name, level, total XP
- Medal icon for visual flair

### Notifications (`/notifications`)

- Chronological list of all notifications
- Each item: title, message, date, read/unread badge
- "Mark all read" button

### Profile (`/profile`)

- Display and edit: full name, bio, profile picture
- Shows user stats: level, XP, streak

### Settings (`/settings`)

- Currency preference: IDR, USD, EUR, SGD
- Notifications toggle
- Save settings button updates `user_profiles`

### Login (`/login`)

- Email + password form
- Google OAuth button (UI only, pending backend implementation)
- "Remember me" checkbox
- Link to forgot password
- Link to register

### Register (`/register`)

- Full name, email, password form
- Supabase Auth creates user + `handle_new_user_profile` trigger fires
- Auto-redirects to `/dashboard` on success

---

## 10. Authentication & Security

### Authentication Flow

1. User submits credentials → `loginWithPassword()` in `lib/auth/auth.ts`
2. Supabase Auth validates and returns a JWT
3. JWT stored in HTTP-only secure cookies via `@supabase/ssr`
4. Next.js middleware (`middleware.ts`) validates the cookie on every request to `(app)` routes
5. On expiry, `lib/supabase/proxy.ts` handles session refresh

### Categories: System vs. User-Owned

The `categories` table has a nullable `user_id`:

- `user_id = NULL` → system category (visible to all users)
- `user_id = <uuid>` → user-created category (visible only to that user)

Query filter: `.or('user_id.eq.${user.id},user_id.is.null')`

---

## 11. Getting Started (Local Development)

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9+
- A [Supabase](https://supabase.com/) account and project

### 1. Clone the Repository

```bash
git clone https://github.com/reygish/coinride.git
cd coinride
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_HF_SPACE_NAME=reygish/finance-categorization
```

Find your Supabase URL and anon key in: Supabase Dashboard → Project Settings → API

### 4. Apply Database Migrations

Run the SQL migration files in your Supabase SQL Editor in order:

1. `supabase/migrations/20260525101840_remote_schema.sql`
2. `supabase/migrations/20260525121400_create_xp_level_streak.sql`
3. `supabase/migrations/20260525122046_xp_triggers.sql`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 12. Environment Variables

| Variable                               | Required | Description                          |
| -------------------------------------- | -------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | ✅       | Your Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon/public key             |
| `NEXT_PUBLIC_HF_SPACE_NAME`            | ✅       | Hugging Face Space name for AI model |

---

## 13. Scripts

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Start development server at localhost:3000 |
| `npm run build` | Build production bundle                    |
| `npm run start` | Start production server                    |
| `npm run lint`  | Run ESLint                                 |
| `npm run test`  | Run Vitest unit tests                      |

---

## 14. Team

| Name                   | NIM        | Role                                                                                   |
| ---------------------- | ---------- | -------------------------------------------------------------------------------------- |
| Andrey Apriliady       | 2802493752 | Documentation / Upgrading AI Features / Tests                                          |
| Alin Lorensia          | 2802495764 | Full-stack / Supabase Integration / DB Schema / Initial Web Structure                  |
| Daniel Regis Febrianto | 2802477452 | Full-stack / AI Integration via HuggingFace / Redesigning / Logo / Tests / Deployment  |
| Darren Vincent         | 2802478581 | Backend                                                                                |

**Repository:** https://github.com/reygish/coinride
**Live App:** https://coinride.vercel.app

---

_Built for Software Engineering course — Bina Nusantara University, 2025/2026_
