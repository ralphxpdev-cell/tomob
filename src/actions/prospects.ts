"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProspectStatus } from "@/types";

export async function getProspects() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("prospects")
    .select("*, generation:generations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProspect(url: string) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Extract company name from URL
  const companyName = extractCompanyName(url);

  const { data, error } = await supabase
    .from("prospects")
    .insert({ user_id: user.id, url, company_name: companyName })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
  return data;
}

export async function createBulkProspects(urls: string[]) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const records = urls.map((url) => ({
    user_id: user.id,
    url: url.trim(),
    company_name: extractCompanyName(url.trim()),
  }));

  const { data, error } = await supabase
    .from("prospects")
    .insert(records)
    .select();

  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
  return data;
}

export async function updateProspectStatus(id: string, status: ProspectStatus) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from("prospects")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/campaigns");
}

export async function deleteProspect(id: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("prospects").delete().eq("id", id);

  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/campaigns");
}

export async function getDashboardStats() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("prospects")
    .select("status")
    .eq("user_id", user.id);

  if (error) throw error;

  const stats = {
    total: data.length,
    queued: data.filter((p) => p.status === "queued").length,
    analyzing: data.filter((p) => p.status === "analyzing").length,
    generated: data.filter((p) => p.status === "generated").length,
    approved: data.filter((p) => p.status === "approved").length,
    sent: data.filter((p) => p.status === "sent").length,
    error: data.filter((p) => p.status === "error").length,
  };

  return stats;
}

function extractCompanyName(url: string): string {
  try {
    const hostname = new URL(
      url.startsWith("http") ? url : `https://${url}`
    ).hostname;
    return hostname.replace(/^www\./, "").split(".")[0];
  } catch {
    return url;
  }
}
