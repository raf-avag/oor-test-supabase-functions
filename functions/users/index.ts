import { serve } from "../_utils/deps.ts";
import { createResponse, createResponseOk, initiate } from "../_utils/tools.ts";
import { getTokens } from "../_utils/authorization.ts";
import { supabaseCLientUpdate } from "../_utils/supabase.ts";
import {
  deleteUser,
  getUser,
  refreshUserSession,
  resendEmailOTP,
  resetPassword,
  signInWithGoogle,
  singInWithEmail,
  singOut,
  singUpWithEmail,
  updateUser,
} from "./utils.ts";
import { UserProfile } from "../_utils/interfaces.ts";
// import * as jwt from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const endpoint = "users";
const t0 = initiate(endpoint);
const emailRedirectTo = "https://test.oor.am?verified=success";
const redirectTo = "https://test.oor.am";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return createResponseOk();
  }

  const { access_token, refresh_token } = getTokens(req);
  const { method, url } = req;
  const { pathname } = new URL(url);
  const { error, email, user_profile_id } = await getUser(
    access_token,
  );
  let auth = false;

  if (error || !user_profile_id) {
    auth = true;
  }

  if (method === "GET") {
    if (pathname === `/${endpoint}`) {
      if (!auth) {
        console.error(error);
        return createResponse({
          responseData: "User Not Found",
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: user_profile_id,
        t0,
        endpoint,
      });
    } else {
      return createResponse({
        responseData: "Forbidden",
        status: 403,
        t0,
        endpoint,
      });
    }
  } else if (method === "POST") {
    if (pathname === `/${endpoint}/signup/email`) {
      const { email, password } = await req.json();
      const { error } = await singUpWithEmail(email, password);

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "Forbidden",
          status: 403,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: "Please check your email for signup confirmation",
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/signin/email`) {
      const { email, password } = await req.json();
      const { session, error } = await singInWithEmail(email, password);

      if (error) {
        const { message } = error;

        if (message.includes("Invalid login credentials")) {
          return createResponse({
            responseData: "Invalid login credentials",
            status: 401,
            t0,
            endpoint,
            error,
          });
        } else if (message.includes("Email not confirmed")) {
          return createResponse({
            responseData: "Email not confirmed",
            status: 403,
            t0,
            endpoint,
            error,
          });
        } else {
          return createResponse({
            responseData: "Failed login attempt",
            status: 404,
            t0,
            endpoint,
            error,
          });
        }
      }

      return createResponse({
        responseData: "Login Successful",
        t0,
        endpoint,
        session,
      });
    } else if (pathname === `/${endpoint}/signup/google`) {
      const { token } = await req.json();
      const { session, error } = await signInWithGoogle(token);

      if (error) {
        return createResponse({
          responseData: "Signup with Google failed.",
          status: 404,
          t0,
          endpoint,
        });
      }
      return createResponse({
        responseData: session,
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/signin/google`) {
      const { token } = await req.json();
      const { session, error } = await signInWithGoogle(token);

      if (error) {
        return createResponse({
          responseData: "Sign in with Google failed.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: session,
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/signout`) {
      const { error } = await singOut(access_token);

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "Not Session was Found",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "Successfully sign the user out.",
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/resend-otp`) {
      if (!email) {
        return createResponse({
          responseData: "No email to resend otp",
          status: 401,
          t0,
          endpoint,
        });
      }

      const { type } = await req.json();
      const { error } = await resendEmailOTP({ type, email, emailRedirectTo });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "Wasn't able to resend otp email.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "Successfully resent otp email.",
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/reset-password`) {
      if (!email) {
        return createResponse({
          responseData: "No email to resend otp",
          status: 401,
          t0,
          endpoint,
        });
      }

      const { error } = await resetPassword({
        email,
        redirectTo,
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "Wasn't able to send reset email.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "Successfully sent reset email.",
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/refresh`) {
      const { session, error } = await refreshUserSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "Wasn't able to refresh the session.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "Session successfully refreshed.",
        t0,
        endpoint,
        session,
      });
    } else {
      return createResponse({
        responseData: "Endpoint isn't defined",
        status: 403,
        t0,
        endpoint,
      });
    }
  } else if (method === "DELETE") {
    if (!auth || !user_profile_id) {
      console.error(error);
      return createResponse({
        responseData: "User Not Found",
        status: 404,
        t0,
        endpoint,
      });
    }
    if (pathname === `/${endpoint}`) {
      const { error } = await deleteUser({ user_id: user_profile_id });
      if (error) {
        console.error(error);
        return createResponse({
          responseData: "User not deleted.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "User deleted successfully.",
        t0,
        endpoint,
      });
    } else {
      return createResponse({
        responseData: "Endpoint isn't defined",
        status: 403,
        t0,
        endpoint,
      });
    }
  } else if (method === "PUT") {
    if (!auth) {
      console.error(error);
      return createResponse({
        responseData: "User Not Found",
        status: 404,
        t0,
        endpoint,
      });
    }
    if (pathname === `/${endpoint}`) {
      const { email, password } = await req.json();

      const { error } = await updateUser({ email, password });
      if (error) {
        console.error(error);
        return createResponse({
          responseData: "User wasn't updated.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "User updated successfully.",
        t0,
        endpoint,
      });
    } else if (pathname === `/${endpoint}/details`) {
      const payload: UserProfile = await req.json();

      if (Object.keys(payload).length == 0) {
        return createResponse({
          responseData: "Payload is empty or missing required properties.",
          status: 404,
          t0,
          endpoint,
        });
      }

      const { error } = await supabaseCLientUpdate({
        tableName: "ratings",
        record: [payload],
        access_token,
        match: { user_id: user_profile_id },
      });

      if (error) {
        console.error(error);
        return createResponse({
          responseData: "User data wasn't updated.",
          status: 404,
          t0,
          endpoint,
        });
      }

      return createResponse({
        responseData: "User updated successfuly.",
        t0,
        endpoint,
      });
    } else {
      return createResponse({
        responseData: "Endpoint isn't defined",
        status: 403,
        t0,
        endpoint,
      });
    }
  } else {
    return createResponse({
      responseData: "Forbidden",
      status: 403,
      t0,
      endpoint,
    });
  }
});
