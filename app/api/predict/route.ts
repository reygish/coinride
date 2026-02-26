import { Client } from "@gradio/client";

export async function POST(request: Request) {
  const { description } = await request.json();

  const client = await Client.connect("reygish/finance-categorization");
  const result = await client.predict("/categorize", {
    description,
  });

  return Response.json({
    data: result.data,
  });
}