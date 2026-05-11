"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import {
  TransactionFilter,
  TransactionPayload,
  TransactionType,
} from "./types";
import { Category } from "@/lib/category/types";

const AUTO_CATEGORY_VALUE = "__auto__";
const ACCOUNT_OPTIONS = ["Primary Checking", "Savings", "Corporate Card"];

type FormState = {
  transaction_date: string;
  payment_method: string;
  amount: string;
  description: string;
  category_id: string;
  type: TransactionType | null;
};

type TransactionFormProps = {
  defaultFilter: TransactionFilter;
  categoryOptions: Category[];
  isSubmitting: boolean;
  onSubmit: (payload: TransactionPayload) => Promise<void>;
  onAutoGenerateCategory: (description: string) => Promise<string>;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function TransactionForm({
  defaultFilter,
  categoryOptions,
  isSubmitting,
  onSubmit,
  onAutoGenerateCategory,
}: TransactionFormProps) {
  const [formState, setFormState] = useState<FormState>({
    transaction_date: "",
    payment_method: "",
    amount: "",
    description: "",
    category_id: "",
    type: defaultFilter === "all" ? null : defaultFilter,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  useEffect(() => {
    if (defaultFilter === "all") {
      return;
    }
    setFormState((prev) => ({ ...prev, type: defaultFilter }));
  }, [defaultFilter]);

  const submitLabel = useMemo(() => {
    if (defaultFilter === "income") {
      return "Add income";
    }
    if (defaultFilter === "expense") {
      return "Add expense";
    }
    return "Add transaction";
  }, [defaultFilter]);

  const resetForm = () => {
    setFormState({
      transaction_date: "",
      payment_method: "",
      amount: "",
      description: "",
      category_id: "",
      type: defaultFilter === "all" ? null : defaultFilter,
    });
    setFieldErrors({});
    setFormError(null);
  };

  const generateCategory = async () => {
    try {
      setIsAutoGenerating(true);
      const generated = await onAutoGenerateCategory(formState.description);
      setFormState((prev) => ({ ...prev, category_id: generated }));
      setFieldErrors((prev) => ({ ...prev, category_id: undefined }));
    } catch {
      setFormError("Unable to auto-generate a category. Please try again.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const field = name as keyof FormState;

    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === "category_id" && value === AUTO_CATEGORY_VALUE) {
      if (!formState.description.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          description: "Add a description before auto-generating a category.",
        }));
        return;
      }
      generateCategory();
      return;
    }

    const field = name as keyof FormState;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTypeChange = (selectedType: TransactionType) => {
    setFormState((prev) => ({ ...prev, type: selectedType }));
    setFieldErrors((prev) => ({ ...prev, type: undefined }));
  };

  const validate = () => {
    const errors: FieldErrors = {};
    const resolvedType =
      defaultFilter === "all" ? formState.type : defaultFilter;

    if (!formState.transaction_date) {
      errors.transaction_date = "Date is required.";
    }

    if (!formState.payment_method) {
      errors.payment_method = "Please select a payment method.";
    }

    const numericAmount = Number(formState.amount);
    if (
      !formState.amount ||
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      errors.amount = "Enter a valid amount.";
    }

    if (!formState.description.trim()) {
      errors.description = "Description is required.";
    }

    if (!formState.category_id) {
      errors.category_id = "Choose a category.";
    }

    if (!resolvedType) {
      errors.type = "Select income or expense.";
    }

    setFieldErrors(errors);
    return { isValid: Object.keys(errors).length === 0, resolvedType };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const { isValid, resolvedType } = validate();
    if (!isValid || !resolvedType) {
      return;
    }

    try {
        console.log("TYPE: ", resolvedType);
      await onSubmit({
        transaction_date: formState.transaction_date,
        payment_method: formState.payment_method,
        amount: Number(formState.amount),
        description: formState.description.trim(),
        category_id: formState.category_id,
        type: resolvedType,
      });

      resetForm();
    } catch {
      setFormError("Something went wrong while saving the transaction.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="transaction_date"
            type="date"
            value={formState.transaction_date}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {fieldErrors.transaction_date && (
            <p className="text-xs text-destructive">
              {fieldErrors.transaction_date}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="payment_method"
          >
            Payment Method
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={formState.payment_method}
            onChange={handleSelectChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select payment method</option>
            {ACCOUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.payment_method && (
            <p className="text-xs text-destructive">
              {fieldErrors.payment_method}
            </p>
          )}
        </div>

        {defaultFilter === "all" && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(["income", "expense"] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    formState.type === type
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
            {fieldErrors.type && (
              <p className="text-xs text-destructive">{fieldErrors.type}</p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.amount}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {fieldErrors.amount && (
            <p className="text-xs text-destructive">{fieldErrors.amount}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formState.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {fieldErrors.description && (
            <p className="text-xs text-destructive">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="category_id"
          >
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formState.category_id}
            onChange={handleSelectChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value={AUTO_CATEGORY_VALUE}>Auto Generate Category</option>
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {isAutoGenerating && (
            <p className="text-xs text-muted-foreground">
              Generating a category...
            </p>
          )}
          {fieldErrors.category_id && (
            <p className="text-xs text-destructive">
              {fieldErrors.category_id}
            </p>
          )}
        </div>
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
