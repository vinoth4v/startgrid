export const dynamic = "force-dynamic";

import { getAllPrompts } from "@/app/actions/ai-prompts";
import PromptsClient from "./PromptsClient";

export default async function AdminPromptsPage() {
  const prompts = await getAllPrompts();
  return <PromptsClient prompts={prompts} />;
}
