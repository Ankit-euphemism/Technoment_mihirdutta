import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const hasValidSupabaseConfig =
  typeof supabaseUrl === "string" &&
  supabaseUrl.trim().length > 0 &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.trim().length > 0;

if (!hasValidSupabaseConfig) {
  console.error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
  );
}

export const supabase = createClient(
  hasValidSupabaseConfig ? supabaseUrl : "https://placeholder.supabase.co",
  hasValidSupabaseConfig ? supabaseAnonKey : "placeholder-anon-key",
);
