import { createClient } from "@/lib/supabase/server";
import AcceptInviteForm from "./AcceptInviteForm";

interface Props {
  searchParams: { token?: string };
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">StartGrid</h1>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-destructive">{message}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please contact the person who sent your invitation.
          </p>
        </div>
      </div>
    </main>
  );
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    return <ErrorMessage message="No invitation token found in this link." />;
  }

  const supabase = createClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("email, role, used_at")
    .eq("token", token)
    .single();

  if (error || !invitation) {
    return <ErrorMessage message="This invitation link is invalid." />;
  }

  if (invitation.used_at) {
    return (
      <ErrorMessage message="This invitation has already been used. Please sign in instead." />
    );
  }

  if (!invitation.role) {
    return <ErrorMessage message="This invitation has no role assigned." />;
  }

  return (
    <AcceptInviteForm
      token={token}
      email={invitation.email}
      role={invitation.role}
    />
  );
}
