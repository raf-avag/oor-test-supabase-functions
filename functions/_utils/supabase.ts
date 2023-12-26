import {
  createClient,
  PostgrestError,
} from "https://esm.sh/@supabase/supabase-js@2.36.0";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../_shared/config.ts";
import { InsertRowArgs, UpdateRowArgs, UpsertRowArgs } from "./interfaces.ts";

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

export const supabaseAnon = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

export function supabaseClient(key: string) {
  const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${key}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  return supabaseClient;
}

export async function supabaseCLientUpsert<T>(
  { tableName, record, access_token, onConflict }: UpsertRowArgs,
  // deno-lint-ignore no-explicit-any
): Promise<any | PostgrestError> {
  const { data, error } = await supabaseClient(access_token)
    .from(tableName)
    .upsert(record, { onConflict });

  if (error) {
    return { error };
  }
  return { data };
}

export async function supabaseCLientUpdate<T>(
  { tableName, record, access_token, match }: UpdateRowArgs,
  // deno-lint-ignore no-explicit-any
): Promise<any | PostgrestError> {
  const { data, error } = await supabaseClient(access_token)
    .from(tableName)
    .update(record)
    .match(match);

  if (error) {
    return { error };
  }
  return { data };
}

export async function supabaseCLientInsert<T>(
  { tableName, record, access_token }: InsertRowArgs,
  // deno-lint-ignore no-explicit-any
): Promise<any | PostgrestError> {
  const { data, error } = await supabaseClient(access_token)
    .from(tableName)
    .insert(record);

  if (error) {
    return { error };
  }
  return { data };
}
