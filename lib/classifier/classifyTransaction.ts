"use server";

import { Client } from "@gradio/client";
import { PredictionResponse } from "../../types/dto/predictionResponse";

export async function classifyTransaction(description: string) {
  const client = await Client.connect("reygish/finance-categorization");
  const result = await client.predict("/categorize", { description });

  const data = result.data as PredictionResponse[];
  return data[0].category;
}