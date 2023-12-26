import { createResponse } from "../_utils/tools.ts";
import { supabaseClient } from "../_utils/supabase.ts";

export async function getUserFavorites(
  { access_token, t0, endpoint }: {
    access_token: string;
    t0: number;
    endpoint: string;
  },
) {
  const { data, error } = await supabaseClient(access_token)
    .from("user_locations")
    .select("location_id")
    .eq("is_favorite", true);

  if (error) {
    console.error(error);
    return createResponse({
      responseData: "Data selection error",
      status: 404,
      t0,
      endpoint,
    });
  }

  return data;
}

export async function getUserBlacklist(
  { access_token, t0, endpoint }: {
    access_token: string;
    t0: number;
    endpoint: string;
  },
) {
  const { data, error } = await supabaseClient(access_token)
    .from("user_locations")
    .select("location_id")
    .eq("is_blacklist", true);

  if (error) {
    console.error(error);
    return createResponse({
      responseData: "Data selection error",
      status: 404,
      t0,
      endpoint,
    });
  }

  return data;
}
