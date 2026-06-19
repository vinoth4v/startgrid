"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <nav
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 56,
        height: "100vh",
        backgroundColor: "#0B1628",
        backgroundImage: "radial-gradient(circle, rgba(79,70,229,0.2) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "14px 0 14px",
        zIndex: 50,
        borderRight: "0.5px solid rgba(79,70,229,0.15)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        title="StartGrid"
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "-0.5px",
          flexShrink: 0,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
        }}
      >
        SG
      </Link>

      {/* Nav items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginTop: 20 }}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? "rgba(79,70,229,0.25)" : "transparent",
                color: active ? "#818CF8" : "#475569",
                transition: "all 0.15s ease",
                textDecoration: "none",
              }}
            >
              <Icon />
            </Link>
          );
        })}
      </div>

      {/* User avatar */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.3))",
          border: "1px solid rgba(99,102,241,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#818CF8",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {userInitials.slice(0, 2).toUpperCase()}
      </div>
    </nav>
  );
}
