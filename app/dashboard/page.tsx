"use client";

import { classifyTransaction } from "@/lib/actions/classifyTransaction";
import { useState } from "react";

export default function Page() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const category = await classifyTransaction(description)
    setResult(category);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Lunch at Somewhere"
          className="border border-input text-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !description}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? "Classifying..." : "Classify"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-1">Result:</p>
          <p className="font-semibold text-foreground">{result}</p>
        </div>
      )}
    </div>
  );
}