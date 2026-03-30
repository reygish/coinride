"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TransactionFilter, TransactionPayload, TransactionType } from "./types";

const AUTO_CATEGORY_VALUE = "__auto__";
const ACCOUNT_OPTIONS = ["Primary Checking", "Savings", "Corporate Card"];

type FormState = {
  date: string;
  account: string;
  amount: string;
  description: string;
  category: string;
  type: TransactionType | null;
};

type TransactionFormProps = {
  defaultFilter: TransactionFilter;
  categoryOptions: string[];
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
    date: "",
    account: "",
    amount: "",
    description: "",
    category: "",
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
      date: "",
      account: "",
      amount: "",
      description: "",
      category: "",
      type: defaultFilter === "all" ? null : defaultFilter,
    });
    setFieldErrors({});
    setFormError(null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const field = name as keyof FormState;
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (name === "category" && value === AUTO_CATEGORY_VALUE) {
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

  const generateCategory = async () => {
    try {
      setIsAutoGenerating(true);
      const generated = await onAutoGenerateCategory(formState.description);
      setFormState((prev) => ({ ...prev, category: generated }));
      setFieldErrors((prev) => ({ ...prev, category: undefined }));
    } catch (error) {
      setFormError("Unable to auto-generate a category. Please try again.");
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const validate = () => {
    const errors: FieldErrors = {};
    const resolvedType = defaultFilter === "all" ? formState.type : defaultFilter;

    if (!formState.date) {
      errors.date = "Date is required.";
    }

    if (!formState.account) {
      errors.account = "Please select an account.";
    }

    const numericAmount = Number(formState.amount);
    if (!formState.amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = "Enter a valid amount.";
    }

    if (!formState.description.trim()) {
      errors.description = "Description is required.";
    }

    if (!formState.category) {
      errors.category = "Choose a category.";
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
      await onSubmit({
        date: formState.date,
        account: formState.account,
        amount: Number(formState.amount),
        description: formState.description.trim(),
        category: formState.category,
        type: resolvedType,
      });
      resetForm();
    } catch (submitError) {
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
            name="date"
            type="date"
            value={formState.date}
            onChange={handleChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {fieldErrors.date && <p className="text-xs text-destructive">{fieldErrors.date}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="account">
            Account
          </label>
          <select
            id="account"
            name="account"
            value={formState.account}
            onChange={handleSelectChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select account</option>
            {ACCOUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.account && <p className="text-xs text-destructive">{fieldErrors.account}</p>}
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
            {fieldErrors.type && <p className="text-xs text-destructive">{fieldErrors.type}</p>}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="amount">
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
          {fieldErrors.amount && <p className="text-xs text-destructive">{fieldErrors.amount}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="description">
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
            <p className="text-xs text-destructive">{fieldErrors.description}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formState.category}
            onChange={handleSelectChange}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value={AUTO_CATEGORY_VALUE}>Auto Generate Category</option>
            <option value="">Select category</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {isAutoGenerating && (
            <p className="text-xs text-muted-foreground">Generating a category...</p>
          )}
          {fieldErrors.category && <p className="text-xs text-destructive">{fieldErrors.category}</p>}
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
