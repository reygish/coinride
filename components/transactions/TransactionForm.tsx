/**
 * components/transactions/TransactionForm.tsx
 * Form utama untuk menambah transaksi baru dengan AI auto-classification.
 *
 * Flow:
 * 1. User ketik deskripsi (e.g. "beli nasi goreng 15rb")
 * 2. Setelah berhenti mengetik (debounce 600ms), AI mengklasifikasi teks
 * 3. AI menampilkan prediksi kategori + nominal yang di-parse
 * 4. User bisa koreksi kategori jika AI salah
 * 5. Submit → simpan transaksi
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { getCategoryById, getCategoriesByType, CATEGORIES } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/formatters";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/formatters";
import type { CategoryId, TransactionType } from "@/types";

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  // ─── Form state ────────────────────────────────────────────────────────────
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("food");
  const [transactionType, setTransactionType] = useState<TransactionType>("expense");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");

  // ─── AI state ──────────────────────────────────────────────────────────────
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: CategoryId;
    confidence: number;
    amount: number | null;
  } | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  const { createTransaction, classifyInput, isLoading, isClassifying } =
    useTransactions();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  /**
   * Debounce AI classification: panggil AI 600ms setelah user berhenti mengetik.
   * Ini menghemat API calls ke HuggingFace.
   */
  const handleDescriptionChange = useCallback(
    (value: string) => {
      setDescription(value);
      setAiSuggestion(null);
      setAiAccepted(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length >= 3) {
        debounceRef.current = setTimeout(async () => {
          const result = await classifyInput(value);
          if (result) {
            setAiSuggestion(result);
            // Auto-apply jika confidence tinggi (> 80%)
            if (result.confidence > 0.8) {
              setCategoryId(result.category);
              if (result.amount) setAmount(String(result.amount));
              setAiAccepted(true);
            }
          }
        }, 600);
      }
    },
    [classifyInput]
  );

  // Cleanup debounce saat unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Terima saran AI secara manual */
  const acceptAISuggestion = () => {
    if (!aiSuggestion) return;
    setCategoryId(aiSuggestion.category);
    if (aiSuggestion.amount) setAmount(String(aiSuggestion.amount));
    setAiAccepted(true);
  };

  /** Submit form */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const success = await createTransaction({
      description: description.trim(),
      amount: parsedAmount,
      type: transactionType,
      category_id: categoryId,
      ai_classified: aiAccepted,
      ai_confidence: aiAccepted ? (aiSuggestion?.confidence ?? null) : null,
      date,
      note: note.trim() || null,
    });

    if (success) {
      // Reset form setelah berhasil
      setDescription("");
      setAmount("");
      setNote("");
      setAiSuggestion(null);
      setAiAccepted(false);
      setCategoryId("food");
      onSuccess?.();
    }
  };

  // Daftar kategori sesuai tipe transaksi
  const categoryOptions = getCategoriesByType(transactionType).map((cat) => ({
    value: cat.id,
    label: `${cat.icon} ${cat.label}`,
  }));

  const selectedCategory = getCategoryById(categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipe transaksi toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
        {(["expense", "income"] as TransactionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTransactionType(type);
              // Reset category ke default sesuai tipe
              setCategoryId(type === "income" ? "salary" : "food");
            }}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200",
              transactionType === type
                ? type === "expense"
                  ? "bg-red-500/20 text-red-300 shadow"
                  : "bg-emerald-500/20 text-emerald-300 shadow"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {type === "expense" ? "💸 Expense" : "💰 Income"}
          </button>
        ))}
      </div>

      {/* Input deskripsi — trigger AI classification */}
      <div>
        <Input
          label="What did you spend on?"
          placeholder="e.g. nasi goreng 15rb, bayar listrik 200k..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rightElement={
            isClassifying ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
            ) : description.length >= 3 ? (
              <Sparkles size={16} className="text-violet-400" />
            ) : null
          }
          helperText="AI will auto-detect category and amount"
        />

        {/* AI suggestion banner */}
        {aiSuggestion && !aiAccepted && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Sparkles size={16} className="text-violet-400 shrink-0" />
              <div>
                <p className="text-xs text-violet-300 font-medium">
                  AI suggests:{" "}
                  <span className="font-bold">
                    {getCategoryById(aiSuggestion.category).icon}{" "}
                    {getCategoryById(aiSuggestion.category).label}
                  </span>
                  {aiSuggestion.amount && (
                    <span className="ml-1 text-emerald-300">
                      • {formatCurrency(aiSuggestion.amount)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-violet-400/70">
                  {Math.round(aiSuggestion.confidence * 100)}% confident
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={acceptAISuggestion}
              className="shrink-0 rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        {/* AI accepted confirmation */}
        {aiAccepted && (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 size={14} />
            <span>AI classification applied</span>
          </div>
        )}
      </div>

      {/* Amount input */}
      <Input
        label="Amount (IDR)"
        type="number"
        placeholder="e.g. 15000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        step="1"
        helperText={amount ? `= ${formatCurrency(parseFloat(amount) || 0)}` : undefined}
      />

      {/* Kategori — manual override */}
      <Select
        label="Category"
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value as CategoryId);
          setAiAccepted(false); // User manual override
        }}
        options={categoryOptions}
      />

      {/* Date picker */}
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={format(new Date(), "yyyy-MM-dd")}
      />

      {/* Optional note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">
          Note <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          className="h-20 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant={transactionType === "income" ? "primary" : "danger"}
        size="lg"
        isLoading={isLoading}
        className="w-full"
        disabled={!description.trim() || !amount || parseFloat(amount) <= 0}
      >
        {transactionType === "expense" ? "💸 Log Expense" : "💰 Log Income"}
      </Button>
    </form>
  );
}
