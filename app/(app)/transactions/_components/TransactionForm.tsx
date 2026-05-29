"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { classifyTransaction } from "@/lib/classifier/classifyTransaction";
import { useCategories } from "@/app/_components/providers/CategoryProvider";
import { parseAmount } from "@/lib/utils/parseAmount";
import {
  TransactionFilter,
  TransactionPayload,
  TransactionType,
} from "../_lib/types";
import CategoryDropdown from "@/components/CategoryDropdown";

const AUTO_CATEGORY_VALUE = "__auto__";
const ACCOUNT_OPTIONS = ["Primary Checking", "Savings", "Corporate Card"];

function stripAmount(text: string) {
  return text
    .replace(/rp\.?\s*\d[\d.,]*/gi, " ")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:rb|ribu|jt|juta|k|m)\b/gi, " ")
    .replace(/\d[\d.,]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type FormState = {
  transaction_date: string;
  payment_method: string;
  description: string;
  category_id: string;
  type: TransactionType | null;
};

type TransactionFormProps = {
  defaultFilter: TransactionFilter;
  isSubmitting: boolean;
  onSubmit: (payload: TransactionPayload) => Promise<void>;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function TransactionForm({
  defaultFilter,
  isSubmitting,
  onSubmit,
}: TransactionFormProps) {
  const { categories: categoryOptions } = useCategories();
  const [formState, setFormState] = useState<FormState>({
    transaction_date: "",
    payment_method: "",
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
      const cleanedDescription = stripAmount(formState.description);
      const generated = await classifyTransaction(
        cleanedDescription || formState.description,
      );
      const matchedCategory = categoryOptions.find(
        (cat) => cat.name.toLowerCase() === generated.toLowerCase()
      );
      if (matchedCategory) {
        setFormState((prev) => ({ ...prev, category_id: matchedCategory.id }));
        setFieldErrors((prev) => ({ ...prev, category_id: undefined }));
      } else {
        setFormError(`AI generated "${generated}", but it doesn't match any system categories.`);
      }
    } catch {
      setFormError("Unable to auto-generate a category. Please try again.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    const field = name as keyof FormState;

    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelectChange = (category_id: string) => {
    if (category_id === AUTO_CATEGORY_VALUE) {
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

    const field = "category_id" as keyof FormState;
    setFormState((prev) => ({ ...prev, [field]: category_id }));
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

    if (!formState.description.trim()) {
      errors.description = "Description is required.";
    }

    const parsedAmount = parseAmount(formState.description);
    if (!parsedAmount || parsedAmount <= 0) {
      errors.description = "Include an amount in the description.";
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
      const parsedAmount = parseAmount(formState.description);
      if (!parsedAmount || parsedAmount <= 0) {
        setFieldErrors((prev) => ({
          ...prev,
          description: "Include an amount in the description.",
        }));
        return;
      }
      const cleanedDescription = stripAmount(formState.description);
      await onSubmit({
        transaction_date: formState.transaction_date,
        payment_method: formState.payment_method,
        amount: parsedAmount,
        description: cleanedDescription || formState.description.trim(),
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
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
            htmlFor="description"
          >
            Description (include amount)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formState.description}
            onChange={handleChange}
            placeholder="e.g. fried rice 15k"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
          <CategoryDropdown
            autoGenerate={true}
            category_id={formState.category_id}
            handleSelectChange={handleSelectChange}
          />
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
        className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
