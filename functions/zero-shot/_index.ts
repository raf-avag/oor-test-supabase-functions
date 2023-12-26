import { env, HfInference } from "../_utils/deps_ai.ts";
import { serve } from "../_utils/deps.ts";
import { createResponse, initiate } from "../_utils/tools.ts";
import { HUGGING_FACE_ACCESS_TOKEN } from "../_shared/config.ts";

// Preparation for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

const endpoint = "zero-shot";
const t0 = initiate(endpoint);
const hf = new HfInference(HUGGING_FACE_ACCESS_TOKEN);

serve(async (req) => {
  try {
    // Read the request body as text
    const requestBody = new TextDecoder().decode(await req.arrayBuffer());
    console.log(requestBody);

    // Parse the JSON manually
    const { input } = JSON.parse(requestBody);

    // Escape double quotes in the input text
    const escapedInput = input.replace(/"/g, '\\"');

    const result = await hf.zeroShotClassification({
      inputs: escapedInput,
      parameters: {
        candidate_labels: ["location", "expensive", "cheap", "nearby"],
        multi_label: false,
      },
      model: "facebook/bart-large-mnli",
    }, { use_cache: true });

    return createResponse({
      responseData: result,
      t0,
      endpoint,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return createResponse({
      responseData: `Error processing request: ${error.message}`,
      status: 500,
      t0,
      endpoint,
    });
  }
});
