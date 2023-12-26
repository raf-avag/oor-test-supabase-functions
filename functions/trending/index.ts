import { getTrending } from "./utils.ts";
import { serve } from "../_utils/deps.ts";
import { createResponse, createResponseOk, initiate } from "../_utils/tools.ts";

const endpoint = "trending";
const t0 = initiate(endpoint);

// deno-lint-ignore no-explicit-any
serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return createResponseOk();
  }

  if (req.method !== "GET") {
    return createResponse({
      responseData: "Forbidden",
      status: 403,
      t0,
      endpoint,
    });
  }
  const { pathname } = new URL(req.url);

  if (pathname === `/${endpoint}`) {
    try {
      const trending = await getTrending(t0, endpoint);
      return createResponse({
        responseData: trending,
        t0,
        endpoint,
      });
    } catch (error) {
      return createResponse({
        responseData: "Internal Server Error",
        status: 500,
        t0,
        endpoint,
        error,
      });
    }
  } else {
    return createResponse({
      responseData: "Recource Not Found",
      status: 404,
      t0,
      endpoint,
    });
  }
});
