const corsHeaders = new Headers();
corsHeaders.set("Access-Control-Allow-Origin", "*");
corsHeaders.set("Access-Control-Allow-Credentials", "true");
corsHeaders.set(
  "Access-Control-Allow-Methods",
  "GET, POST, DELETE, PUT, OPTIONS",
);
corsHeaders.set(
  "Access-Control-Allow-Headers",
  "authorization, x-client-info, apikey, content-type",
);
// corsHeaders.set("Access-Control-Max-Age", "86400");
export { corsHeaders };
