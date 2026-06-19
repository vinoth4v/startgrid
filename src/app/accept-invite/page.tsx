import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AcceptInviteForm from "./AcceptInviteForm";

interface Props {
  searchParams: { token?: string };
}

function ErrorMessage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Left panel */}
      <div style={{
        width: "50%", minHeight: "100vh",
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "40px 48px",
      }} className="hidden md:flex">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 11,
          }}>SG</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "white", letterSpacing: "-0.3px" }}>StartGrid</span>
        </div>
        <div>
          <h2 style={{ fontSize: 30, fontWeight: 700, color: "white", lineHeight: 1.2, margin: "0 0 14px", letterSpacing: "-0.6px" }}>
            The European startup-investor platform.
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: 0 }}>
            Invitation-only. Standardised profiles. Facilitated connections.
          </p>
        </div>
        <div style={{ borderLeft: "2.5px solid #4F46E5", paddingLeft: 20 }}>
          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 10px" }}>
            "The quality of conversations on StartGrid is unlike anything I've seen on other platforms."
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Early investor, Munich</p>
        </div>
      </div>

      {/* Right panel — error state */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#F8FAFC", padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            backgroundColor: "#FEF2F2", border: "1.5px solid #FECACA",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: 22,
          }}>✕</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px", margin: "0 0 10px" }}>
            Invalid invitation link
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65, margin: "0 0 28px" }}>
            This invitation link is invalid or has already been used. Please contact the person who sent your invitation.
          </p>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center",
            background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
            color: "white", fontSize: 13, fontWeight: 600, padding: "10px 22px",
            borderRadius: 9, textDecoration: "none",
            boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
          }}>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    return <ErrorMessage />;
  }

  const supabase = createClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("email, role, used_at")
    .eq("token", token)
    .single();

  if (error || !invitation) {
    return <ErrorMessage />;
  }

  if (invitation.used_at) {
    return <ErrorMessage />;
  }

  if (!invitation.role) {
    return <ErrorMessage />;
  }

  return (
    <AcceptInviteForm
      token={token}
      email={invitation.email}
      role={invitation.role}
    />
  );
}
