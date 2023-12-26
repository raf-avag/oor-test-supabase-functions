import { env, pipeline } from "../_utils/deps_ai.ts";
import { serve } from "../_utils/deps.ts";
import { createResponse, initiate } from "../_utils/tools.ts";

const endpoint = "embedding";
const t0 = initiate(endpoint);

// Preparation for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

// Construct pipeline outside of serve for faster warm starts
const pipe = await pipeline(
  "feature-extraction",
  "Supabase/gte-small",
);

serve(async (req) => {
  const { input } = await req.json();
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method !== "POST") {
    return createResponse({
      responseData: "Forbidden",
      status: 403,
      t0: t0,
      endpoint: endpoint,
    });
  }

  try {
    const output = await pipe(input, {
      pooling: "mean",
      normalize: true,
    });
    const embedding = Array.from(output.data);

    return createResponse({
      responseData: embedding,
      t0: t0,
      endpoint: endpoint,
    });
  } catch (error) {
    return createResponse({
      responseData: error.message,
      status: 401,
      t0: t0,
      endpoint: endpoint,
    });
  }
});
