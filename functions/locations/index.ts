import { serve } from "../_utils/deps.ts";
import { createResponse, createResponseOk, initiate } from "../_utils/tools.ts";
import { locations_paginated } from "./locations_paginated.ts";
import { locations_specific } from "./locations_specific.ts";
import {
  supabaseCLientInsert,
  supabaseCLientUpsert,
} from "../_utils/supabase.ts";
import { randomLocationID } from "./utils.ts";
import { getTokens } from "../_utils/authorization.ts";
import { getUser } from "../users/utils.ts";

const endpoint = "locations";
const t0 = initiate(endpoint);

serve(async (req) => {
  const { method, url } = req;
  if (method === "OPTIONS") return createResponseOk();

  const { pathname, searchParams: query } = new URL(url);
  const { access_token } = getTokens(req);
  const { user_profile_id, error } = await getUser(access_token);
  let auth = true;

  if (error) auth = false;

  if (method === "GET") {
    const page = parseInt(query.get("page") || "1", 10);
    const pageSize = parseInt(query.get("pageSize") || "20", 10);
    const trending = query.get("trending");
    const category = query.get("category");
    const location_id = query.get("location_id");

    if (pathname === `/${endpoint}`) {
      if (trending) {
        return await locations_paginated(
          { page, pageSize, t0, endpoint, auth, trending },
        );
      } else if (category) {
        return await locations_paginated(
          { page, pageSize, t0, endpoint, auth, category },
        );
      } else if (location_id) {
        const id = parseInt(location_id, 10);
        if (isNaN(id)) {
          return createResponse({
            responseData: "Not Found",
            status: 404,
            t0,
            endpoint,
          });
        }
        return await locations_specific({ id, t0, endpoint, auth });
      } else {
        return await locations_paginated(
          { page, pageSize, t0, endpoint, auth },
        );
      }
    } else if (pathname === `/${endpoint}/surprise`) {
      const id = await randomLocationID();
      if (id) {
        return await locations_specific({ id, t0, endpoint, auth });
      } else {
        return createResponse({
          responseData: "Not Found",
          status: 404,
          t0,
          endpoint,
        });
      }
    } else {
      return createResponse({
        responseData: "Resource Not Found",
        status: 404,
        t0,
        endpoint,
      });
    }
  } else if (method === "POST") {
    if (!auth) {
      return createResponse({
        responseData: "User not found",
        status: 404,
        t0,
        endpoint,
      });
    }

    if (pathname === `/${endpoint}/review`) {
      //Types for data validation
      const {
        stars,
        hygiene,
        service,
        cuisine,
        value,
        ambiance,
        comment,
        location_id,
      } = await req.json();

      if (isNaN(location_id)) {
        return createResponse({
          responseData: "Location id is not a number",
          status: 400,
          t0,
          endpoint,
        });
      }

      const { data: RatingTableRow, error: RatingTableError } =
        await supabaseCLientInsert({
          tableName: "ratings",
          record: [{ hygiene, service, cuisine, value, ambiance }],
          access_token,
        });

      if (RatingTableError || !RatingTableRow) {
        return createResponse({
          responseData: `Location ${location_id} review not registered.`,
          status: 404,
          t0,
          endpoint,
          error: RatingTableError,
        });
      }

      const ratings_id = RatingTableRow[0].id;

      const { error: ReviewTableError } = await supabaseCLientInsert({
        tableName: "reviews",
        record: [{ user_profile_id, location_id, comment, stars, ratings_id }],
        access_token,
      });

      if (ReviewTableError) {
        return createResponse({
          responseData: `Location ${location_id} review not registered.`,
          status: 404,
          t0,
          endpoint,
          error: ReviewTableError,
        });
      }

      return createResponse({
        responseData: `Location ${location_id} review registered.`,
        status: 200,
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/blacklist`) {
      const { location_id } = await req.json();

      if (isNaN(location_id)) {
        return createResponse({
          responseData: "Location id is not a number",
          status: 400,
          t0,
          endpoint,
        });
      }

      const { error } = await supabaseCLientUpsert({
        tableName: "user_locations",
        record: [{
          user_profile_id,
          location_id,
          is_favorite: false,
          is_blacklist: true,
        }],
        access_token,
        onConflict: "user_profile_id, location_id",
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: `Location ${location_id} blacklist not registered.`,
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: `Location ${location_id} blacklist registered.`,
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/favorite`) {
      const { location_id } = await req.json();
      if (isNaN(location_id)) {
        return createResponse({
          responseData: "Location id is not a number.",
          status: 400,
          t0,
          endpoint,
        });
      }

      const { error } = await supabaseCLientUpsert({
        tableName: "user_locations",
        record: [{
          user_profile_id,
          location_id,
          is_blacklist: false,
          is_favorite: true,
        }],
        access_token,
        onConflict: "user_profile_id, location_id",
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: `Location ${location_id} favorite not registered.`,
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: `Location ${location_id} favorite registered.`,
        t0,
        endpoint,
      });
    } else {
      return createResponse({
        responseData: "Endpoint not found",
        status: 404,
        t0,
        endpoint,
      });
    }
  } else if (method === "DELETE") {
    if (!auth) {
      return createResponse({
        responseData: "User not found",
        status: 404,
        t0,
        endpoint,
      });
    }

    if (pathname === `/${endpoint}/blacklist`) {
      const { location_id } = await req.json();
      if (isNaN(location_id)) {
        return createResponse({
          responseData: "Location id is not a number",
          status: 400,
          t0,
          endpoint,
        });
      }

      const { error } = await supabaseCLientUpsert({
        tableName: "user_locations",
        record: [{
          user_profile_id,
          location_id,
          is_blacklist: false,
        }],
        access_token,
        onConflict: "user_profile_id, location_id",
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: `Location ${location_id} blacklist not registered.`,
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: `Location ${location_id} blacklist registered.`,
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/favorite`) {
      const { location_id } = await req.json();
      if (isNaN(location_id)) {
        return createResponse({
          responseData: "Location id is not a number",
          status: 400,
          t0,
          endpoint,
        });
      }

      const { error } = await supabaseCLientUpsert({
        tableName: "user_locations",
        record: [{
          user_profile_id,
          location_id,
          is_favorite: false,
        }],
        access_token,
        onConflict: "user_profile_id, location_id",
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: `Location ${location_id} favorite not registered.`,
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: `Location ${location_id} favorite registered.`,
        t0,
        endpoint,
      });
    } else {
      return createResponse({
        responseData: "Endpoint not found",
        status: 404,
        t0,
        endpoint,
      });
    }
  } else {
    return createResponse({
      responseData: "Method Not Allowed",
      status: 405,
      t0,
      endpoint,
    });
  }
});
