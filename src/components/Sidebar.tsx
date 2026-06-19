"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

const navByRole: Record<string, { href: string; icon: () => JSX.Element; label: string }[]> = {
  startup: [
    { href: "/startup/dashboard", icon: GridIcon, label: "Dashboard" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
  investor: [
    { href: "/investor/dashboard", icon: CompassIcon, label: "Discover" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
  admin: [
    { href: "/admin/dashboard", icon: ShieldIcon, label: "Admin" },
    { href: "/messages", icon: MessageIcon, label: "Messages" },
  ],
};

interface Props {
  role: string;
  userInitials: string;
}

export default function Sidebar({ role, userInitials }: Props) {
  const pathname = usePathname();
  const items = navByRole[role] ?? navByRole.startup;

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

      {/* User avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        backgroundColor: "rgba(27,99,216,0.18)",
        border: "1px solid rgba(27,99,216,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#7DB4F5", fontSize: 10, fontWeight: 700,
      }}>
        {userInitials.slice(0, 2).toUpperCase()}
      </div>
    </nav>
  );
}
