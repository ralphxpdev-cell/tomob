"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ApiSettings } from "@/types";

export async function getApiSettings(): Promise<ApiSettings | null> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("api_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function saveApiSettings(
  settings: Partial<Omit<ApiSettings, "id" | "user_id" | "created_at" | "updated_at">>
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if settings already exist
  const existing = await getApiSettings();

  if (existing) {
    const { error } = await supabase
      .from("api_settings")
      .update(settings)
      .eq("user_id", user.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("api_settings")
      .insert({ user_id: user.id, ...settings });

    if (error) throw error;
  }

  revalidatePath("/settings");
}
