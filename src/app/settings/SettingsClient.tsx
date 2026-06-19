"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "profile" | "security" | "notifications";

interface Props {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid #E2E8F0", fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", color: "#0F172A",
};

export default function SettingsClient({ userId, email, fullName, role }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  // Profile fields
  const [name, setName] = useState(fullName);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isPendingProfile, startProfileTransition] = useTransition();

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPendingPwd, startPwdTransition] = useTransition();

  // Notification prefs (stored in localStorage for now)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);
  const [notifConnection, setNotifConnection] = useState(true);
  const [notifMilestone, setNotifMilestone] = useState(true);

  function handleSaveProfile() {
    setProfileError("");
    startProfileTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (error) setProfileError(error.message);
      else { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }
    });
  }

  function handleChangePassword() {
    setPasswordError("");
    setPasswordMsg("");
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    if (newPassword.length < 8) { setPasswordError("Password must be at least 8 characters"); return; }
    startPwdTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setPasswordError(error.message);
      else {
        setPasswordMsg("Password updated successfully");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    });
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", maxWidth: 640, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>Settings</h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "0.5px solid #E2E8F0", paddingBottom: 0 }}>
        {(["profile", "security", "notifications"] as Tab[]).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: "8px 16px", border: "none", cursor: "pointer",
            backgroundColor: "transparent",
            color: tab === t ? "#4F46E5" : "#64748B",
            fontSize: 13, fontWeight: tab === t ? 700 : 500,
            borderBottom: tab === t ? "2px solid #4F46E5" : "2px solid transparent",
            marginBottom: -1, textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div style={{ backgroundColor: "white", borderRadius: 14, border: "0.5px solid #E2E8F0", padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Profile Information</h2>

          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Display Name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Email Address
              </label>
              <input type="email" value={email} disabled style={{ ...inputStyle, backgroundColor: "#F8FAFC", color: "#94A3B8" }} />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94A3B8" }}>Contact support to change your email address</p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Account Role
              </label>
              <div style={{
                padding: "8px 12px", borderRadius: 8, backgroundColor: "#F8FAFC",
                border: "0.5px solid #E2E8F0", fontSize: 13, color: "#374151",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: role === "startup" ? "#10B981" : "#4F46E5", flexShrink: 0,
                }} />
                {role === "startup" ? "Startup founder" : role === "investor" ? "Investor" : role}
              </div>
            </div>
          </div>

          {profileError && <p style={{ margin: "12px 0 0", fontSize: 12, color: "#EF4444" }}>{profileError}</p>}

          <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button" onClick={handleSaveProfile} disabled={isPendingProfile || name === fullName}
              style={{
                padding: "9px 22px", borderRadius: 8, border: "none",
                backgroundColor: isPendingProfile || name === fullName ? "#E2E8F0" : "#4F46E5",
                color: isPendingProfile || name === fullName ? "#94A3B8" : "white",
                fontSize: 13, fontWeight: 700, cursor: isPendingProfile || name === fullName ? "not-allowed" : "pointer",
              }}
            >
              {isPendingProfile ? "Saving…" : "Save changes"}
            </button>
            {profileSaved && <span style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>✓ Saved</span>}
          </div>
        </div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <div style={{ backgroundColor: "white", borderRadius: 14, border: "0.5px solid #E2E8F0", padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Change Password</h2>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                New Password
              </label>
              <input
                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Confirm New Password
              </label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={inputStyle}
              />
            </div>
          </div>

          {passwordError && <p style={{ margin: "12px 0 0", fontSize: 12, color: "#EF4444" }}>{passwordError}</p>}
          {passwordMsg && <p style={{ margin: "12px 0 0", fontSize: 12, color: "#10B981", fontWeight: 600 }}>✓ {passwordMsg}</p>}

          <div style={{ marginTop: 20 }}>
            <button
              type="button" onClick={handleChangePassword}
              disabled={isPendingPwd || !newPassword || !confirmPassword}
              style={{
                padding: "9px 22px", borderRadius: 8, border: "none",
                backgroundColor: isPendingPwd || !newPassword || !confirmPassword ? "#E2E8F0" : "#4F46E5",
                color: isPendingPwd || !newPassword || !confirmPassword ? "#94A3B8" : "white",
                fontSize: 13, fontWeight: 700,
                cursor: isPendingPwd || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
              }}
            >
              {isPendingPwd ? "Updating…" : "Update password"}
            </button>
          </div>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "0.5px solid #F1F5F9" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Account ID</h3>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", fontFamily: "monospace" }}>{userId}</p>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === "notifications" && (
        <div style={{ backgroundColor: "white", borderRadius: 14, border: "0.5px solid #E2E8F0", padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Email Notifications</h2>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94A3B8" }}>Control which emails StartGrid sends to {email}</p>

          <div style={{ display: "grid", gap: 0 }}>
            {[
              { key: "notifEmail", label: "Platform updates", desc: "Product announcements and new features", value: notifEmail, set: setNotifEmail },
              { key: "notifConnection", label: "Connection requests", desc: "When someone wants to connect with you", value: notifConnection, set: setNotifConnection },
              { key: "notifMessage", label: "New messages", desc: "When you receive a direct message", value: notifMessage, set: setNotifMessage },
              { key: "notifMilestone", label: "Startup milestones", desc: "When a connected startup posts a milestone", value: notifMilestone, set: setNotifMilestone },
            ].map((item, i, arr) => (
              <div key={item.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < arr.length - 1 ? "0.5px solid #F8FAFC" : "none",
              }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => item.set(!item.value)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none",
                    backgroundColor: item.value ? "#4F46E5" : "#E2E8F0",
                    cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: item.value ? 22 : 3,
                    width: 18, height: 18, borderRadius: "50%", backgroundColor: "white",
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
              Notification preferences are saved locally. To fully unsubscribe from all emails, contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
