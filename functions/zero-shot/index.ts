import { env, OpenAI } from "../_utils/deps_ai.ts";
import { serve } from "../_utils/deps.ts";
import { createResponse, initiate } from "../_utils/tools.ts";
import { OPEN_AI_TEST_KEY } from "../_shared/config.ts";

// Preparation for Deno runtime
env.useBrowserCache = false;
env.allowLocalModels = false;

const endpoint = "zero-shot";
const t0 = initiate(endpoint);
const openai = new OpenAI({ apiKey: OPEN_AI_TEST_KEY });

serve(async (req) => {
  try {
    const { prompt } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content":
            `You're ethical classifier and help me guide people who are searching a location for a given occasion. Output in following format:
            {
            "Topic": null | string,
            "Nearby": boolean,
            "Location": null | string,
            "Place": null | string,
            "Proximity": boolean
            }
            Topic is the non-specific or general theme/occasion/topic of the prompt [null for inappropriate requests]. If the user requests similarity to another business, Topic is "Similarity".
            Nearby is true, if the prompt has concept about proximity to the Individual at the moment (not near a mentioned place or location).
            Location is the extracted country/region/city/street from prompt.
            Place is the registered business name of the service provider (null if no mention of specific registered business name), verbatim, extracted from prompt.
            Proximity is true only if the prompt has concept about proximity to the Place extracted before.`,
        },
        {
          "role": "user",
          "content": prompt,
        },
      ],
      temperature: 0.15,
      max_tokens: 512,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return createResponse({
      responseData: JSON.parse(
        response.choices[0].message.content ||
          '{"Topic": null, "Nearby": false, "Proximity": false, "Location": null, "Place": null}',
      ),
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
