import { serve } from "../_utils/deps.ts";
import { getActivityTypes, getCapacity } from "./utils.ts";
import { createResponse, createResponseOk, initiate } from "../_utils/tools.ts";

const endpoint = "choices";
const t0 = initiate(endpoint);

serve(async (req) => {
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

  try {
    const [capacityResult, activityTypesResult] = await Promise.all([
      getCapacity(),
      getActivityTypes(),
    ]);

    const { capacity, error: getCapacityError } = capacityResult;
    const { activity_types, uniqueTypes, error: getActivityTypesError } =
      activityTypesResult;

    if (getCapacityError || getActivityTypesError) {
      console.error(`Capacity related: ${getCapacityError}
      Activity related: ${getActivityTypesError}`);
      return createResponse({
        responseData: "One of the resources was not found",
        status: 404,
        t0,
        endpoint,
      });
    }

    if (activity_types === undefined) {
      console.error("activity_types is undefined");
      return createResponse({
        responseData: "One of the resources was not found",
        status: 404,
        t0,
        endpoint,
      });
    }

    const data = {
      ///changed keys coz Mos is lazy
      "activities": {
        "name": "A place to",
        "maxCount": null,
        "options": uniqueTypes,
      },
      "types": {
        "name": "A place with",
        "maxCount": 1,
        "options": activity_types,
      },
      "capacity": {
        "name": "For people",
        "maxCount": null,
        "options": capacity,
      },
    };
    return createResponse({ responseData: data, t0, endpoint });
  } catch (error) {
    console.error(error);
    return createResponse({
      responseData: "Internal Server Error",
      status: 500,
      t0,
      endpoint,
    });
  }
});
