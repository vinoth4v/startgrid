"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

export interface AIPrompt {
  id: string;
  key: string;
  name: string;
  description: string | null;
  persona: "startup" | "investor" | "system";
  category: string;
  system_prompt: string;
  user_prompt_template: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  version: number;
  updated_at: string;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  system_prompt: string;
  user_prompt_template: string;
  changed_by: string | null;
  change_note: string | null;
  created_at: string;
}

export async function getAllPrompts(): Promise<AIPrompt[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_prompts")
    .select("*")
    .order("persona")
    .order("name");
  return (data ?? []) as AIPrompt[];
}

export async function getPromptByKey(key: string): Promise<AIPrompt | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_prompts")
    .select("*")
    .eq("key", key)
    .eq("is_active", true)
    .single();
  return data as AIPrompt | null;
}

export async function savePrompt(
  id: string,
  updates: Partial<AIPrompt>,
  changeNote: string
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const admin = createAdminClient();

  // Get current version to archive it
  const { data: current } = await admin
    .from("ai_prompts")
    .select("*")
    .eq("id", id)
    .single();

  if (current) {
    // Archive current version
    await admin.from("ai_prompt_versions").insert({
      prompt_id: id,
      version: current.version,
      system_prompt: current.system_prompt,
      user_prompt_template: current.user_prompt_template,
      changed_by: user.id,
      change_note: changeNote,
    });
  }

  // Save new version
  const { error } = await admin
    .from("ai_prompts")
    .update({
      ...updates,
      version: (current?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return error ? { error: error.message } : {};
}

export async function togglePromptActive(id: string, isActive: boolean): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_prompts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  return error ? { error: error.message } : {};
}

export async function getPromptVersions(promptId: string): Promise<PromptVersion[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ai_prompt_versions")
    .select("*")
    .eq("prompt_id", promptId)
    .order("version", { ascending: false });
  return (data ?? []) as PromptVersion[];
}

export async function restorePromptVersion(promptId: string, versionId: string, changeNote: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  const { data: ver } = await admin
    .from("ai_prompt_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (!ver) return { error: "Version not found" };

  return savePrompt(promptId, {
    system_prompt: ver.system_prompt,
    user_prompt_template: ver.user_prompt_template,
  }, changeNote || `Restored to v${ver.version}`);
}

export async function testPrompt(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  maxTokens: number,
  temperature: number
): Promise<{ text?: string; inputTokens?: number; outputTokens?: number; costUsd?: number; error?: string }> {
  try {
    const client = new Anthropic();
    const start = Date.now();
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const elapsed = Date.now() - start;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const costUsd = (inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000);
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return { text, inputTokens, outputTokens, costUsd };
  } catch (e) {
    return { error: String(e) };
  }
}

// Helper used by all AI features to fetch prompt from DB, with fallback
export async function getPromptTemplate(key: string): Promise<{ systemPrompt: string; userTemplate: string; model: string; maxTokens: number } | null> {
  const prompt = await getPromptByKey(key);
  if (!prompt) return null;
  return {
    systemPrompt: prompt.system_prompt,
    userTemplate: prompt.user_prompt_template,
    model: prompt.model,
    maxTokens: prompt.max_tokens,
  };
}

// Log API usage
export async function logApiUsage(promptKey: string, inputTokens: number, outputTokens: number, userId?: string) {
  const admin = createAdminClient();
  const costUsd = (inputTokens * 3 / 1_000_000) + (outputTokens * 15 / 1_000_000);
  await admin.from("api_usage_log").insert({
    prompt_key: promptKey,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUsd,
    user_id: userId ?? null,
  });
}
