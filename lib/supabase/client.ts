import { createBrowserClient } from "@supabase/ssr";

// Production project used by the SPPG Jambu website.
// The publishable key is safe for browser use; access is still controlled by
// Supabase RLS/Auth policies.
const SUPABASE_URL = "https://zqnpgjmejaetafgahzlw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_u18uwF1WOtCI84YtZUt1DA__d6QF-KV";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
