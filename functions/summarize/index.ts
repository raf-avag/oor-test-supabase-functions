import { env, HfInference } from "../_utils/deps_ai.ts";
import { serve } from "../_utils/deps.ts";
import { createResponse, initiate } from "../_utils/tools.ts";
import { HUGGING_FACE_ACCESS_TOKEN } from "../_shared/config.ts";

// Preparation for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

const endpoint = "summarize";
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

    if (escapedInput.length > 7000) {
      return createResponse({
        responseData:
          `AI Limit Exceeded: Expected less than 7000, received ${escapedInput.length}`,
        status: 406,
        t0,
        endpoint,
      });
    }

    const summary = await hf.summarization({
      inputs: escapedInput,
      model: "sshleifer/distilbart-cnn-12-6",
    }, { use_cache: true });

    if (!summary.summary_text) {
      return createResponse({
        responseData: `AI didn't return summary_text attribute, ${
          JSON.stringify(summary)
        }`,
        status: 404,
        t0,
        endpoint,
      });
    }

    return createResponse({
      responseData: summary.summary_text,
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
