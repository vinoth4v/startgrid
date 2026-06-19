"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NotificationBell from "@/components/NotificationBell";
import DarkModeToggle from "@/components/DarkModeToggle";

function LogoMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="4" height="18" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="5" width="4" height="16" rx="1" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const navByRole: Record<string, { href: string; icon: () => JSX.Element; label: string }[]> = {
  startup: [
    { href: "/startup/dashboard", icon: GridIcon, label: "Dashboard" },
    { href: "/feed", icon: FeedIcon, label: "Feed" },
    { href: "/startup/pitch-coach", icon: BookIcon, label: "Pitch Coach" },
    { href: "/startup/documents", icon: FolderIcon, label: "Documents" },
    { href: "/connections", icon: PeopleIcon, label: "Connections" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
  investor: [
    { href: "/investor/dashboard", icon: CompassIcon, label: "Discover" },
    { href: "/feed", icon: FeedIcon, label: "Feed" },
    { href: "/investor/pipeline", icon: PipelineIcon, label: "Pipeline" },
    { href: "/connections", icon: PeopleIcon, label: "Connections" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
  admin: [
    { href: "/admin/dashboard", icon: ShieldIcon, label: "Admin" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
};

const profileHrefByRole: Record<string, string> = {
  startup: "/startup/dashboard",
  investor: "/investor/dashboard",
  admin: "/admin/dashboard",
};

interface Props {
  role: string;
  userInitials: string;
  userName?: string;
  userEmail?: string;
  userId?: string;
}

export default function Sidebar({ role, userInitials, userName, userEmail, userId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navByRole[role] ?? navByRole.startup;
  const profileHref = profileHrefByRole[role] ?? "/";

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        avatarRef.current && !avatarRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [popoverOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav style={{
      position: "fixed", left: 0, top: 0,
      width: 56, height: "100vh",
      backgroundColor: "#0C1E35",
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "14px 0",
      zIndex: 50,
      borderRight: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo mark */}
      <Link href="/" title="StartGrid" style={{
        width: 32, height: 32, borderRadius: 9,
        background: "linear-gradient(135deg, #1B63D8, #0F3E9E)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, textDecoration: "none",
        boxShadow: "0 2px 8px rgba(27,99,216,0.4)",
      }}>
        <LogoMark />
      </Link>

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 20 }}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} title={item.label} style={{
              width: 38, height: 38, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: active ? "rgba(27,99,216,0.22)" : "transparent",
              color: active ? "#7DB4F5" : "#4C6072",
              transition: "all 0.15s",
              textDecoration: "none",
            }}>
              <Icon />
            </Link>
          );
        })}
      </div>

      {/* Dark mode toggle */}
      <div style={{ marginBottom: 2 }}>
        <DarkModeToggle />
      </div>

      {/* Bell */}
      {userId && (
        <div style={{ marginBottom: 8 }}>
          <NotificationBell userId={userId} />
        </div>
      )}

      {/* User avatar button */}
      <div style={{ position: "relative" }}>
        <button
          ref={avatarRef}
          type="button"
          onClick={() => setPopoverOpen(v => !v)}
          title="Account"
          style={{
            width: 32, height: 32, borderRadius: "50%",
            backgroundColor: popoverOpen ? "rgba(27,99,216,0.35)" : "rgba(27,99,216,0.18)",
            border: `1px solid ${popoverOpen ? "rgba(27,99,216,0.6)" : "rgba(27,99,216,0.3)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#7DB4F5", fontSize: 10, fontWeight: 700,
            cursor: "pointer", transition: "all 0.15s",
            outline: "none",
          }}
        >
          {userInitials.slice(0, 2).toUpperCase()}
        </button>

        {/* Popover */}
        {popoverOpen && (
          <div
            ref={popoverRef}
            style={{
              position: "absolute", bottom: 0, left: "calc(100% + 10px)",
              backgroundColor: "white",
              border: "0.5px solid #E2E8F0",
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              padding: 8,
              minWidth: 200,
              zIndex: 100,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            {/* User info */}
            <div style={{ padding: "6px 10px 8px" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#0F172A" }}>
                {userName ?? "Account"}
              </p>
              {userEmail && (
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8", wordBreak: "break-all" }}>
                  {userEmail}
                </p>
              )}
            </div>

            <div style={{ height: "0.5px", backgroundColor: "#F1F5F9", margin: "4px 0" }} />

            {/* My profile */}
            <Link
              href={profileHref}
              onClick={() => setPopoverOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 7,
                fontSize: 13, fontWeight: 500, color: "#0F172A",
                textDecoration: "none", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              My profile
            </Link>

            {/* Settings (placeholder) */}
            <button
              type="button"
              disabled
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 7, width: "100%",
                fontSize: 13, fontWeight: 500, color: "#CBD5E1",
                background: "none", border: "none", cursor: "not-allowed",
                textAlign: "left",
              }}
            >
              Settings
            </button>

            <div style={{ height: "0.5px", backgroundColor: "#F1F5F9", margin: "4px 0" }} />

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 10px", borderRadius: 7, width: "100%",
                fontSize: 13, fontWeight: 500,
                color: signingOut ? "#FDA4AF" : "#EF4444",
                background: "none", border: "none",
                cursor: signingOut ? "not-allowed" : "pointer",
                textAlign: "left", transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!signingOut) e.currentTarget.style.backgroundColor = "#FFF1F2"; }}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <LogoutIcon />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
