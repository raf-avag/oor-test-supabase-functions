import { serve } from "../_utils/deps.ts";
import { env } from "../_utils/deps_ai.ts";
import { HUGGING_FACE_ACCESS_TOKEN } from "../_shared/config.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Preparation for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

console.log(`Endpoint "embedding" was called!`);
// deno-lint-ignore no-explicit-any
async function query(data: any) {
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/meta-llama/Llama-2-7b-hf",
    {
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_ACCESS_TOKEN}`,
      },
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  const result = await response.json();
  return result;
}

serve(async (req) => {
  const { input } = await req.json();
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method !== "POST") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const embedding = await query({ "inputs": `${input}` });

    return new Response(JSON.stringify(embedding), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
