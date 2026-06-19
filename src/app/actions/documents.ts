"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface StartupDocument {
  id: string;
  startup_id: string;
  name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  is_public: boolean;
  created_at: string;
}

export async function getDocuments(startupId: string): Promise<StartupDocument[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("startup_documents")
    .select("*")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });
  return (data ?? []) as StartupDocument[];
}

export async function uploadDocument(formData: FormData): Promise<{ error?: string; doc?: StartupDocument }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { data: sp } = await admin.from("startup_profiles").select("id").eq("user_id", user.id).single();
  if (!sp) return { error: "Startup profile not found" };

  const file = formData.get("file") as File | null;
  const name = (formData.get("name") as string | null) ?? file?.name ?? "Document";
  const isPublic = formData.get("is_public") === "true";

  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `docs/${sp.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("startgrid-assets")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("startgrid-assets").getPublicUrl(path);

  const { data: doc, error: dbError } = await admin.from("startup_documents").insert({
    startup_id: sp.id,
    name,
    file_url: publicUrl,
    file_size: file.size,
    mime_type: file.type,
    is_public: isPublic,
  }).select().single();

  if (dbError) return { error: dbError.message };
  return { doc: doc as StartupDocument };
}

export async function deleteDocument(docId: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("startup_documents").delete().eq("id", docId);
  return error ? { error: error.message } : {};
}

export async function toggleDocumentVisibility(docId: string, isPublic: boolean): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();
  const { error } = await admin.from("startup_documents").update({ is_public: isPublic }).eq("id", docId);
  return error ? { error: error.message } : {};
}
