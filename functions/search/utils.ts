import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../_shared/config.ts";
import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin, supabaseClient } from "../_utils/supabase.ts";
import {
  columns_auth,
  columns_paginated,
  transformLocationDataPaginated,
} from "../locations/utils.ts";
import { SearchResult } from "../_utils/interfaces.ts";

export async function getZeroShot({ prompt }: { prompt: string }) {
  try {
    const payload = { "prompt": prompt };
    const response = await fetch(
      SUPABASE_URL + "/functions/v1/zero-shot",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      console.error(response);
      return { error: "Issue with the zero-shot API." };
    }
    return { response };
  } catch (error) {
    return { error };
  }
}

export async function getEmbedding({ prompt }: { prompt: string }) {
  try {
    const payload = { "input": prompt };
    const response = await fetch(
      SUPABASE_URL + "/functions/v1/embedding",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      console.error(response);
      return { error: "Issue with the embedding API.", response: null };
    }
    return { response, error: null };
  } catch (error) {
    return { error, response: null };
  }
}

export async function getLocations(
  { ids, t0, endpoint, auth }: {
    ids: number[];
    t0: number;
    endpoint: string;
    auth: boolean;
  },
) {
  const columns = auth ? columns_paginated + columns_auth : columns_paginated;
  const { data, error } = await supabaseAdmin
    .from("locations")
    .select(columns)
    .in("id", ids);

  if (error) {
    console.error(error);
    return createResponse({
      responseData: "Data selection error",
      status: 404,
      t0,
      endpoint,
    });
  }

  const locations = transformLocationDataPaginated(data);
  locations.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  return locations;
}

export async function getNextLocations(
  { access_token, t0, endpoint, _next, _set }: {
    access_token: string;
    t0: number;
    endpoint: string;
    _next: number;
    _set: string;
  },
) {
  const { data: set_number, error: set_error } = await supabaseAdmin.rpc(
    "uuid_to_seq",
    { uuid_val: _set },
  );

  if (set_error) {
    console.error(set_error);
    return createResponse({
      responseData: "Set value conversion error.",
      status: 404,
      t0,
      endpoint,
    });
  }

  const { data, error } = await supabaseClient(access_token)
    .from("search")
    .select("location_id")
    .eq("_next", _next)
    .eq("_set", set_number);

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

export function addNextSubset(data: SearchResult[]): SearchResult[] {
  for (let i = 0; i < data.length; i++) {
    const currentSubset = data[i].subset;
    const nextSubsetIndex = i + 1;

    if (
      nextSubsetIndex < data.length &&
      data[nextSubsetIndex].subset === currentSubset
    ) {
      data[i]._next = data[nextSubsetIndex].subset;
    } else {
      data[i]._next = null;
    }
  }

  return data;
}
