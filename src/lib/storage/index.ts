import { LocalStorageAdapter } from "./local";
import type { StorageAdapter } from "./types";

export function getStorageAdapter(): StorageAdapter {
  // Supabase wiring lives in supabase.ts. Until the user is authenticated and
  // env vars are set, we fall back to localStorage. The app context promotes to
  // a SupabaseStorageAdapter when a session appears.
  return new LocalStorageAdapter();
}

export * from "./types";
