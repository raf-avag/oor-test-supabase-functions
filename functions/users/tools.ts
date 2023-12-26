import { supabaseAdmin, supabaseClient } from "../_utils/supabase.ts";
import { createResponse } from "../_utils/tools.ts";

export async function getUserPersonalityID(
  { access_token, t0, endpoint }: {
    access_token: string;
    t0: number;
    endpoint: string;
  },
) {
  const { data, error } = await supabaseClient(access_token)
    .from("user_profiles")
    .select("personality_id")
    .single();

  if (error) {
    console.error(error);
    return createResponse({
      responseData: "Data selection error",
      status: 404,
      t0,
      endpoint,
    });
  }

  return data.personality_id;
}

export async function getUserTopicLocations(
  { access_token, Topic }: {
    access_token: string;
    Topic: string;
  },
) {
  const { data, error } = await supabaseClient(access_token)
    .from("search")
    .select("location_id")
    .eq("topic", Topic)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) return null;
  return data;
}

export async function getUserSearchSetLocations(
  { access_token, t0, endpoint, _set }: {
    access_token: string;
    t0: number;
    endpoint: string;
    _set: string;
  },
) {
  const { data: set_number, error: set_error } = await supabaseAdmin.rpc(
    "uuid_to_seq",
    { uuid_val: _set },
  );

  if (set_error) {
    return createResponse({
      responseData: "Set value conversion error.",
      status: 404,
      t0,
      endpoint,
      error: set_error,
    });
  }

  const { data, error } = await supabaseClient(access_token)
    .from("search")
    .select("location_id")
    .eq("_set", set_number);

  if (error) {
    return createResponse({
      responseData: "Data selection error.",
      status: 404,
      t0,
      endpoint,
      error,
    });
  }

  return data;
}
