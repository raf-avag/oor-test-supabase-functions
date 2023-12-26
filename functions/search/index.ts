// deno-lint-ignore-file no-explicit-any
import { getUserBlacklist } from "../locations/users.ts";
import {
  getUserPersonalityID,
  getUserSearchSetLocations,
} from "../users/tools.ts";
import { getUser } from "../users/utils.ts";
import { getTokens } from "../_utils/authorization.ts";
import { createResponse, createResponseOk, initiate } from "../_utils/tools.ts";
import { addNextSubset, getLocations, getNextLocations } from "./utils.ts";
import { get_top_choices } from "./get_tops.ts";

const endpoint = "search";
const t0 = initiate(endpoint);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createResponseOk();
  }
  if (req.method !== "POST") {
    return createResponse({
      responseData: "Forbidden",
      status: 403,
      t0,
      endpoint,
    });
  }

  let auth = true;
  let user_list: number[] = [];
  // deno-lint-ignore prefer-const
  let exclude_list: number[] = [];
  let personality_id: number | null = null;
  let ids;

  const promises = [];
  const { access_token } = getTokens(req);
  const [userResult, jsonResult] = await Promise.all([
    getUser(access_token),
    req.json(),
  ]);
  const { error } = userResult;
  const { prompt, _next, _set, coordinates, labels } = jsonResult;
  console.log("jsonResult: ", jsonResult);

  if (error) auth = false;

  try {
    if (labels) {
      const initialRequest = await get_top_choices(
        {
          labels,
          t0,
          endpoint,
          exclude_list,
          user_list,
          access_token,
        },
      );
      ids = initialRequest.map((item: any) => item.id);
    } else if (_set && _next) {
      ids = await getNextLocations({ access_token, t0, endpoint, _set, _next });
    } else {
      if (_set && !_next) {
        promises.push(
          (async () => {
            const previous_results: any = await getUserSearchSetLocations({
              access_token,
              t0,
              endpoint,
              _set,
            });
            exclude_list.push(previous_results);
          })(),
        );
      }

      if (auth) {
        promises.push(
          (async () => {
            const [user_list_fetched, personality_id_fetched] = await Promise
              .all(
                [
                  getUserBlacklist({
                    access_token,
                    t0,
                    endpoint,
                  }),
                  getUserPersonalityID({
                    access_token,
                    t0,
                    endpoint,
                  }),
                ],
              );
            user_list = user_list_fetched as unknown as number[];
            personality_id = personality_id_fetched;
          })(),
        );
      }

      // Wait for all promises to resolve
      await Promise.all(promises);

      const initialRequest = await get_top_choices(
        {
          prompt,
          t0,
          endpoint,
          exclude_list,
          user_list,
          personality_id,
          access_token,
          coordinates,
        },
      );

      ids = initialRequest.map((item: any) => item.id);
      const search_result = addNextSubset(initialRequest);
      console.log({ search_result });
    }

    const responseData = await getLocations({ ids, t0, endpoint, auth });
    return createResponse({
      responseData,
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
});
