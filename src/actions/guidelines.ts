"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGuidelines() {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("guidelines")
    .select("*")
    .order("type");

  if (error) throw error;
  return data;
}

export async function updateGuideline(id: string, content: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("guidelines")
    .update({ content })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/guidelines");
}

export async function toggleGuideline(id: string, isActive: boolean) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("guidelines")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/guidelines");
}
