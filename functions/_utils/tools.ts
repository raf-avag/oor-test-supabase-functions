// deno-lint-ignore-file no-explicit-any
import { Cookie, setCookie } from "./deps.ts";
import { corsHeaders as headers } from "../_shared/cors.ts";

export function createResponseOk(): Response {
  return new Response("ok", { headers });
}

/**
 * Creates an HTTP response with the provided data and optional parameters.
 *
 * @param {Object} options - The options for creating the response.
 * @param {any} options.responseData - The data to be included in the response body.
 * @param {number} [options.status=200] - The HTTP status code for the response.
 * @param {number} options.t0 - The start time (in milliseconds) of the request processing.
 * @param {string} options.endpoint - The endpoint that the response corresponds to.
 * @param {Object} [options.session] - The user session data (optional).
 * @returns {Response} The created HTTP response.
 */
export function createResponse({
  responseData,
  status = 200,
  t0,
  endpoint,
  session,
  error,
}: {
  responseData: any;
  status?: number;
  t0: number;
  endpoint: string;
  session?: any;
  error?: any;
}): Response {
  const t1 = performance.now();
  console.info(`Endpoint "${endpoint}" finished after ${t1 - t0} ms!`);

  if (session) {
    const { refresh_token, access_token, expires_in } = session;

    const accessCookie: Cookie = {
      name: "access_token",
      value: access_token,
      httpOnly: true,
      secure: true, // Use 'secure' attribute if served over HTTPS
      // sameSite: "Strict", // Adjust SameSite attribute as needed
      expires: new Date(Date.now() + expires_in * 1000), // Convert seconds to milliseconds
    };
    setCookie(headers, accessCookie);

    // Set refresh token as a HttpOnly and Secure cookie
    const refreshCookie: Cookie = {
      name: "refresh_token",
      value: refresh_token,
      httpOnly: true,
      secure: true, // Use 'secure' attribute if served over HTTPS
      // sameSite: "Strict", // Adjust SameSite attribute as needed
    };
    setCookie(headers, refreshCookie);
  }
  headers.append("Content-Type", "application/json");

  if (error) console.error(error);

  return new Response(JSON.stringify(responseData), {
    headers,
    status,
  });
}

export function createResponsePaginated({
  responseData,
  status = 200,
  start,
  end,
  total,
  session,
  error,
}: {
  responseData: any;
  status?: number;
  start: number;
  end: number;
  total: number;
  session?: any;
  error?: any;
}): Response {
  if (session) {
    const { refresh_token, access_token, expires_in } = session;

    const accessCookie: Cookie = {
      name: "access_token",
      value: access_token,
      httpOnly: true,
      secure: true, // Use 'secure' attribute if served over HTTPS
      // sameSite: "Strict", // Adjust SameSite attribute as needed
      expires: new Date(Date.now() + expires_in * 1000), // Convert seconds to milliseconds
    };
    setCookie(headers, accessCookie);

    // Set refresh token as a HttpOnly and Secure cookie
    const refreshCookie: Cookie = {
      name: "refresh_token",
      value: refresh_token,
      httpOnly: true,
      secure: true, // Use 'secure' attribute if served over HTTPS
      // sameSite: "Strict", // Adjust SameSite attribute as needed
    };
    setCookie(headers, refreshCookie);
  }
  headers.append("Content-Type", "application/json");
  headers.append("Accept-Ranges", "items");
  headers.append("Content-Range", `${start}-${end}/${total}`);

  if (error) console.error(error);

  return new Response(JSON.stringify(responseData), {
    headers,
    status,
  });
}

export function initiate(
  endpoint: string,
): number {
  console.info(`Endpoint "${endpoint}" was called!`);
  const t0 = performance.now();
  return t0;
}
