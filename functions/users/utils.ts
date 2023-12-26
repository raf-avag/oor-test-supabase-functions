import { supabaseAdmin, supabaseAnon } from "../_utils/supabase.ts";

// deno-lint-ignore no-explicit-any
export function session_details(data: any) {
  const { access_token, refresh_token, expires_in } = data.session ?? {};
  return { access_token, refresh_token, expires_in };
}

export async function singUpWithEmail(email: string, password: string) {
  const { error } = await supabaseAnon.auth.signUp({ email, password });
  return { error };
}

export async function resendEmailOTP(
  { type, email, emailRedirectTo }: {
    type: "signup" | "email_change";
    email: string;
    emailRedirectTo?: string;
  },
) {
  const { error } = await supabaseAnon.auth.resend({
    type,
    email,
    options: { emailRedirectTo },
  });
  return { error };
}

export async function signInWithGoogle(key: string) {
  const { data, error } = await supabaseAnon.auth.signInWithIdToken({
    provider: "google",
    token: key,
  });

  if (error) {
    return { error, session: null };
  }

  const session = session_details(data);
  return { error: null, session };
}

export async function singInWithEmail(email: string, password: string) {
  const { error, data } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error, session: null };
  }

  const session = session_details(data);
  return { error: null, session };
}

export async function deleteUser(
  { user_id, shouldSoftDelete }: {
    user_id: string;
    shouldSoftDelete?: boolean;
  },
) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(
    user_id,
    shouldSoftDelete,
  );

  return { error };
}

export async function singOut(access_token: string) {
  const { error } = await supabaseAdmin.auth.admin.signOut(
    access_token,
    "local",
  );

  return { error };
}

export async function getUser(access_token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(access_token);

  if (error) {
    return { error, email: null, user_profile_id: null };
  }

  const { user } = data;
  const { email, id } = user;

  if (!email) {
    return { user_profile_id: id, email: "", error: null };
  }

  return { user_profile_id: id, email, error: null };
}

export async function resetPassword(
  { email, redirectTo }: { email: string; redirectTo: string },
) {
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
    email,
    {
      redirectTo,
    },
  );

  return { error };
}

export async function updateUser(
  { password, email }: { password?: string; email?: string },
) {
  const { error } = await supabaseAdmin.auth.updateUser({
    password,
    email,
  });

  return { error };
}

export async function refreshUserSession(
  { access_token, refresh_token }: {
    access_token: string;
    refresh_token: string;
  },
) {
  const { data, error } = await supabaseAdmin.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return { error, session: null };
  }

  const session = session_details(data);
  return { error: null, session };
}
