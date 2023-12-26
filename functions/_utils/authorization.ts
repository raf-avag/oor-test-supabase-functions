import { getUser } from "../users/utils.ts";
// import { verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

export function getTokens(req: Request) {
  const authorizationHeader = req.headers.get("Authorization");
  const refreshTokenHeader = req.headers.get("Refresh-Token");

  const access_token = authorizationHeader
    ? authorizationHeader.replace("Bearer ", "")
    : "";
  const refresh_token = refreshTokenHeader || "";
  return { access_token, refresh_token };
}

export async function checkAuthorization(
  req: Request,
): Promise<
  {
    access_token: string | false;
    refresh_token: string | false;
    user_profile_id: string | undefined;
  }
> {
  const origin = req.headers.get("Origin");
  if (!(origin && origin.startsWith("https://oor.am"))) {
    return {
      access_token: false,
      refresh_token: false,
      user_profile_id: undefined,
    };
  }

  const { access_token, refresh_token } = getTokens(req);
  if (typeof access_token === "boolean") {
    return {
      access_token: false,
      refresh_token: false,
      user_profile_id: undefined,
    };
  }

  const { user_profile_id, error } = await getUser(access_token);

  if (!user_profile_id || error) {
    return {
      access_token: false,
      refresh_token: false,
      user_profile_id: undefined,
    };
  }

  return { access_token, refresh_token, user_profile_id };
}

// export async function checkTokenAuthorization(req: Request): Promise<boolean> {
//   // Get the authorization header from the request
//   const authHeader = req.headers.get("Authorization");

//   // If the authorization header is not present, the request is not authorized
//   if (!authHeader) {
//     return false;
//   }

//   // Extract the bearer token from the authorization header
//   const token = authHeader.replace("Bearer ", "");

//   try {
//     // Get the environment variable as a string
//     const data = new TextEncoder().encode(SUPABASE_JWT_SECRET);
//     // Convert the string to an ArrayBuffer
//     const buffer = await crypto.subtle.digest("SHA-256", data);

//     // Convert the ArrayBuffer to a CryptoKey
//     const key = await crypto.subtle.importKey(
//       "raw",
//       buffer,
//       { name: "AES-GCM", length: 256 },
//       false,
//       ["encrypt", "decrypt"],
//     );

//     // Verify the token using the Supabase JWT secret
//     await verify(token, key);
//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// }
