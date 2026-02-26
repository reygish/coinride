# 💰 SmartSpend — AI-Powered Money Management App

A personal finance tracker built with **Next.js** and **Supabase**, featuring an AI model hosted on **Hugging Face Spaces** that automatically classifies your transactions into categories.

---

## ✨ Features

- 📥 **Transaction Logging** — Add income and expense transactions quickly
- 🤖 **AI Auto-Classification** — Automatically categorizes transactions using a Hugging Face Spaces model
- 📊 **Dashboard & Analytics** — Visual spending breakdowns by category
- 🔐 **Authentication** — Secure sign-up and login via Supabase Auth
- 📱 **Responsive Design** — Works on both desktop and mobile

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | [Next.js](https://nextjs.org/)      |
| Database & Auth | [Supabase](https://supabase.com/) |
| AI Model   | [Hugging Face Spaces](https://huggingface.co/spaces/reygish/finance-categorization) |
| Styling    | Tailwind CSS                        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- A [Supabase](https://supabase.com/) account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <this repo>
   cd <folder name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   NEXT_PUBLIC_HF_SPACE_NAME=your_huggingface_space_name
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👨‍💻 Developers

- Regis
- Andrey
- Darren
- Alin
