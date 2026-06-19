import { getMatchPairs } from "@/app/actions/matchmaking";
import MatchmakingClient from "./MatchmakingClient";

export default async function AdminMatchmakingPage() {
  const pairs = await getMatchPairs();
  return <MatchmakingClient pairs={pairs} />;
}
