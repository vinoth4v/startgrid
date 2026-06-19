"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/app/actions/notifications";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/actions/notifications";

function BellIcon({ hasBadge }: { hasBadge: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: hasBadge ? "#7DB4F5" : "#4C6072" }}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function typeIcon(type: string) {
  if (type === "connection_request") return "🔗";
  if (type === "connection_accepted") return "🔗";
  if (type === "new_message") return "💬";
  if (type === "profile_view") return "👁";
  return "🔔";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface Props {
  userId: string;
}

export default function NotificationBell({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadNotifications = useCallback(async () => {
    const data = await getNotifications(userId);
    setNotifications(data);
    setLoaded(true);
  }, [userId]);

  // Load on first open
  useEffect(() => {
    if (open && !loaded) loadNotifications();
  }, [open, loaded, loadNotifications]);

  // Supabase Realtime subscription for live badge updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const newN = payload.new as Notification;
          setNotifications(prev => [newN, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Initial load for badge count (even if panel not opened)
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleClickNotification(n: Notification) {
    if (!n.read) {
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      await markNotificationRead(n.id);
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsRead(userId);
  }

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        style={{
          width: 38, height: 38, borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: open ? "rgba(27,99,216,0.22)" : "transparent",
          border: "none", cursor: "pointer", position: "relative",
          transition: "background 0.15s",
        }}
      >
        <BellIcon hasBadge={unreadCount > 0} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 8,
            backgroundColor: "#EF4444",
            color: "white", fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            border: "1.5px solid #0C1E35",
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "fixed", left: 56, top: 0,
          width: 300, height: "100vh",
          backgroundColor: "white",
          borderRight: "0.5px solid #E2E8F0",
          boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
          zIndex: 49,
          display: "flex", flexDirection: "column",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          animation: "slideInLeft 0.2s ease",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 16px 12px",
            borderBottom: "0.5px solid #F1F5F9",
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 11, color: "#4F46E5", fontWeight: 600, padding: 0,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                  You&apos;re all caught up
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94A3B8" }}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClickNotification(n)}
                  style={{
                    display: "flex", gap: 12, padding: "12px 16px",
                    width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                    backgroundColor: n.read ? "transparent" : "#EEF2FF",
                    borderBottom: "0.5px solid #F8FAFC",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = n.read ? "#F8FAFC" : "#E0E7FF")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.read ? "transparent" : "#EEF2FF")}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A", lineHeight: 1.4 }}>
                        {n.title}
                      </p>
                      <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0, marginTop: 1 }}>
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748B", lineHeight: 1.5 }}>
                      {n.body}
                    </p>
                    {!n.read && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#4F46E5", marginTop: 5 }} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-12px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
