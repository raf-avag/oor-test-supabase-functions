import { createResponse, createResponsePaginated } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import {
  columns_auth,
  columns_paginated,
  transformLocationDataPaginated,
} from "./utils.ts";

export async function locations_paginated({
  page,
  pageSize,
  t0,
  endpoint,
  category,
  trending,
  auth,
}: {
  page: number;
  pageSize: number;
  t0: number;
  endpoint: string;
  auth: boolean;
  category?: string;
  trending?: string;
}) {
  const start = (page - 1) * pageSize;
  const end = page * pageSize - 1;
  const columns = auth ? columns_paginated + columns_auth : columns_paginated;

  try {
    let query;
    if (category) {
      query = supabaseAdmin
        .from("locations")
        .select(
          columns + ",locations_by_category!inner(category!inner(slug))",
          {
            count: "exact",
          },
        )
        .filter("locations_by_category.category.slug", "eq", category)
        .eq("visible", true)
        .range(start, end);
    } else if (trending) {
      query = supabaseAdmin
        .from("locations")
        .select(
          columns + ",locations_by_trending!inner(trending!inner(slug))",
          {
            count: "exact",
          },
        )
        .filter("locations_by_trending.trending.slug", "eq", trending)
        .eq("visible", true)
        .range(start, end);
    } else {
      query = supabaseAdmin
        .from("locations")
        .select(columns, { count: "exact" })
        .eq("visible", true)
        .range(start, end);
    }

    const { data, error, count } = await query;
    if (error) {
      return createResponse({
        responseData: error.message,
        status: 404,
        t0,
        endpoint,
        error,
      });
    } else if (!data || !count) {
      return createResponse({
        responseData: "Data not found",
        status: 404,
        t0,
        endpoint,
      });
    }

    const locations = transformLocationDataPaginated(data);
    return createResponsePaginated({
      responseData: locations,
      start,
      end,
      total: count,
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
}
