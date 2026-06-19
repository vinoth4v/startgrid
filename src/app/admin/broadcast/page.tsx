export const dynamic = "force-dynamic";

import { getBroadcastMessages } from "@/app/actions/broadcast";
import BroadcastClient from "./BroadcastClient";

export default async function AdminBroadcastPage() {
  const history = await getBroadcastMessages();
  return <BroadcastClient history={history} />;
}
