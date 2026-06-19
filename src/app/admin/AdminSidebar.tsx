"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/analytics",   icon: "📊", label: "Analytics" },
  { href: "/admin/dashboard",   icon: "👥", label: "Members" },
  { href: "/admin/moderation",  icon: "🔍", label: "Moderation" },
  { href: "/admin/prompts",     icon: "🤖", label: "AI Prompts" },
  { href: "/admin/matchmaking", icon: "⚡", label: "Matchmaking" },
  { href: "/admin/broadcast",   icon: "📣", label: "Broadcast" },
  { href: "/admin/report",      icon: "📈", label: "Report" },
  { href: "/admin/health",      icon: "❤️", label: "Health" },
];

interface Props { userEmail: string; userId: string }

export default function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav style={{
      position: "fixed", left: 0, top: 0,
      width: 220, height: "100vh",
      backgroundColor: "#0C1E35",
      display: "flex", flexDirection: "column",
      zIndex: 50,
      borderRight: "1px solid rgba(255,255,255,0.06)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>StartGrid</p>
        <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "white" }}>Admin Console</p>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, marginBottom: 2,
              backgroundColor: active ? "rgba(79,70,229,0.2)" : "transparent",
              color: active ? "#A5B4FC" : "#64748B",
              textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 500,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User + sign out */}
      <div style={{ padding: "12px 16px", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
        <p style={{ margin: "0 0 8px", fontSize: 11, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {userEmail}
        </p>
        <button type="button" onClick={handleSignOut} style={{
          width: "100%", padding: "7px 12px", borderRadius: 7,
          backgroundColor: "rgba(239,68,68,0.12)", border: "0.5px solid rgba(239,68,68,0.25)",
          color: "#F87171", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
        }}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
