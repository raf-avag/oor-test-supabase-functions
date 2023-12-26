import { createResponse } from "../_utils/tools.ts";
import { supabaseAdmin } from "../_utils/supabase.ts";
import {
  columns_auth,
  columns_single,
  transformLocationData,
} from "./utils.ts";

export async function locations_specific({ id, t0, endpoint, auth }: {
  id: number;
  t0: number;
  endpoint: string;
  auth: boolean;
}) {
  const columns = auth ? columns_single + columns_auth : columns_single;

  try {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select(columns)
      .eq("visible", true)
      .eq("id", id);

    if (error) {
      return createResponse({
        responseData: error.message,
        status: 400,
        t0,
        endpoint,
        error,
      });
    } else if (!data) {
      return createResponse({
        responseData: "Not Found",
        status: 404,
        t0,
        endpoint,
      });
    }

    const location = transformLocationData(data);
    return createResponse({
      responseData: location,
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
}
