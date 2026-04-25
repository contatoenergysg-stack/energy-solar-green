"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ── Magic link (email) ────────────────────────────────────
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  try {
    const supabase = await createClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
    const callbackUrl = `${siteUrl}/auth/callback${
      redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
    }`;

    console.log("[signInWithMagicLink] URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20));
    console.log("[signInWithMagicLink] Sending OTP to:", email);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      console.error("[signInWithMagicLink] Error:", error);
      return { ok: false, error: error.message };
    }

    console.log("[signInWithMagicLink] OTP sent successfully");
    return { ok: true };
  } catch (err) {
    console.error("[signInWithMagicLink] Exception:", err);
    return { ok: false, error: String(err) };
  }
}

// ── Email + password ──────────────────────────────────────
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ── Sign out ──────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function signOutToDashboard() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/dashboard");
}

// ── Get current session user (server) ────────────────────
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
