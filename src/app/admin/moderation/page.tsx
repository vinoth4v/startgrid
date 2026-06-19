import { getModerationQueue } from "@/app/actions/moderation";
import ModerationClient from "./ModerationClient";

export default async function AdminModerationPage() {
  const items = await getModerationQueue();
  return <ModerationClient items={items} />;
}
