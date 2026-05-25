"use client";

import { SpendingChart } from "@/components/charts/SpendingChart";
import { classifyTransaction } from "@/lib/classifier/classifyTransaction";
import { useState } from "react";

export default function Page() {

  return (
    <div className="p-6 max-w-md mx-auto">
      <SpendingChart></SpendingChart>
    </div>
  );
}
