export const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
export const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
export const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
export const SUPABASE_JWT_SECRET = Deno.env.get("_SUPABASE_JWT_SECRET") || "";
export const AWS_BUCKET_MEDIA_LINK = Deno.env.get("AWS_BUCKET_MEDIA_LINK") ||
  "";
export const HUGGING_FACE_ACCESS_TOKEN = Deno.env.get(
  "HUGGING_FACE_ACCESS_TOKEN",
) || "";
export const OPEN_AI_TEST_KEY = Deno.env.get("OPEN_AI_TEST_KEY") || "";
