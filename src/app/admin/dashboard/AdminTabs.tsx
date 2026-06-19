"use client";

import { useState, useTransition } from "react";
import { approveAccessRequest, rejectAccessRequest } from "@/app/actions/access-requests";

interface Member {
  id: string;
  email: string;
  role: string;
  name: string;
  status: "active" | "pending";
  joinedAt: string;
}

interface Connection {
  id: string;
  investorName: string;
  investorFirm: string;
  startupName: string;
  status: string;
  createdAt: string;
}

interface Message {
  id: string;
  connectionId: string;
  investorName: string;
  startupName: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  members: Member[];
  connections: Connection[];
  messages: Message[];
  accessRequests: AccessRequest[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TABS = ["Requests", "Members", "Connections", "Messages"] as const;
type Tab = (typeof TABS)[number];

const roleColors: Record<string, { bg: string; color: string }> = {
  investor: { bg: "#EEF2FF", color: "#4F46E5" },
  startup: { bg: "#ECFDF5", color: "#059669" },
  admin: { bg: "#F5F3FF", color: "#7C3AED" },
};

const connStatusColors: Record<string, { bg: string; color: string; border: string }> = {
  accepted: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  pending: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  declined: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export default function AdminTabs({ members, connections, messages, accessRequests }: Props) {
  const [tab, setTab] = useState<Tab>("Requests");
  const [pendingRequests, setPendingRequests] = useState(accessRequests.filter(r => r.status === "pending"));
  const [, startTransition] = useTransition();
  const [actioningId, setActioningId] = useState<string | null>(null);

  function handleApprove(id: string, email: string, role: string, name: string) {
    setActioningId(id);
    startTransition(async () => {
      await approveAccessRequest(id, email, role, name);
      setPendingRequests(prev => prev.filter(r => r.id !== id));
      setActioningId(null);
    });
  }

  function handleReject(id: string) {
    setActioningId(id);
    startTransition(async () => {
      await rejectAccessRequest(id);
      setPendingRequests(prev => prev.filter(r => r.id !== id));
      setActioningId(null);
    });
  }

  const msgGroups = messages.reduce<Record<string, Message[]>>((acc, m) => {
    const key = `${m.investorName} ↔ ${m.startupName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const thStyle: React.CSSProperties = {
    padding: "10px 16px", textAlign: "left",
    fontSize: 10, fontWeight: 700, color: "#94A3B8",
    textTransform: "uppercase", letterSpacing: "0.06em",
    backgroundColor: "#F8FAFC",
    borderBottom: "0.5px solid #E2E8F0",
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px 16px", fontSize: 13, color: "#0F172A",
    borderBottom: "0.5px solid #F1F5F9", verticalAlign: "middle",
  };

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #E2E8F0", gap: 0, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", border: "none", background: "none",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              borderBottom: tab === t ? "2px solid #4F46E5" : "2px solid transparent",
              color: tab === t ? "#4F46E5" : "#94A3B8",
              transition: "all 0.15s", marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Requests */}
      {tab === "Requests" && (
        <div style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", overflow: "hidden" }}>
          {pendingRequests.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No pending access requests.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Role", "Message", "Date", "Actions"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(r => {
                  const rc = roleColors[r.role] ?? { bg: "#F8FAFC", color: "#475569" };
                  const isActioning = actioningId === r.id;
                  return (
                    <tr key={r.id}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#F8FAFC"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "white"}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{r.name}</td>
                      <td style={{ ...tdStyle, fontSize: 12, fontFamily: "monospace", color: "#475569" }}>{r.email}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: rc.color, backgroundColor: rc.bg, borderRadius: 20, padding: "3px 8px", letterSpacing: "0.04em" }}>
                          {r.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: "#64748B", maxWidth: 220 }}>
                        <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>
                          {r.message || "—"}
                        </p>
                      </td>
                      <td style={{ ...tdStyle, color: "#94A3B8", fontSize: 12 }}>{formatDate(r.createdAt)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button disabled={isActioning} onClick={() => handleApprove(r.id, r.email, r.role, r.name)}
                            style={{
                              padding: "5px 12px", borderRadius: 7, border: "none",
                              background: isActioning ? "#C7D2FE" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                              color: "white", fontSize: 11, fontWeight: 600,
                              cursor: isActioning ? "not-allowed" : "pointer",
                            }}>
                            {isActioning ? "…" : "Approve"}
                          </button>
                          <button disabled={isActioning} onClick={() => handleReject(r.id)}
                            style={{
                              padding: "5px 12px", borderRadius: 7,
                              border: "0.5px solid #FCA5A5", backgroundColor: "#FEF2F2",
                              color: "#DC2626", fontSize: 11, fontWeight: 600,
                              cursor: isActioning ? "not-allowed" : "pointer",
                            }}>
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members */}
      {tab === "Members" && (
        <div style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Name", "Email", "Role", "Status", "Joined"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#94A3B8", padding: "32px" }}>No members yet.</td></tr>
              ) : members.map(m => {
                const rc = roleColors[m.role] ?? { bg: "#F8FAFC", color: "#475569" };
                return (
                  <tr key={m.id} style={{ transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#F8FAFC"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "white"}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{m.name || "—"}</td>
                    <td style={{ ...tdStyle, color: "#475569", fontSize: 12, fontFamily: "monospace" }}>{m.email}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: rc.color, backgroundColor: rc.bg, borderRadius: 20, padding: "3px 8px", letterSpacing: "0.04em" }}>
                        {m.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: m.status === "active" ? "#059669" : "#D97706" }} />
                        <span style={{ color: m.status === "active" ? "#059669" : "#D97706" }}>
                          {m.status === "active" ? "Active" : "Pending"}
                        </span>
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#94A3B8", fontSize: 12 }}>{formatDate(m.joinedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Connections */}
      {tab === "Connections" && (
        <div style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Investor", "Startup", "Status", "Date"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connections.length === 0 ? (
                <tr><td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "#94A3B8", padding: "32px" }}>No connections yet.</td></tr>
              ) : connections.map(c => {
                const sc = connStatusColors[c.status] ?? { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0" };
                return (
                  <tr key={c.id}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#F8FAFC"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "white"}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {c.investorName}{c.investorFirm ? <span style={{ color: "#94A3B8", fontWeight: 400 }}> · {c.investorFirm}</span> : ""}
                    </td>
                    <td style={tdStyle}>{c.startupName}</td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: sc.color,
                        backgroundColor: sc.bg, border: `0.5px solid ${sc.border}`,
                        borderRadius: 20, padding: "3px 8px", letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "#94A3B8", fontSize: 12 }}>{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages */}
      {tab === "Messages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.keys(msgGroups).length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", padding: "32px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No messages yet.</p>
            </div>
          ) : Object.entries(msgGroups).map(([groupKey, msgs]) => (
            <div key={groupKey} style={{ backgroundColor: "white", borderRadius: 12, border: "0.5px solid #E2E8F0", overflow: "hidden" }}>
              <div style={{
                padding: "10px 16px",
                backgroundColor: "#F8FAFC", borderBottom: "0.5px solid #E2E8F0",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 12 }}>💬</span>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.1px" }}>{groupKey}</p>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: "#4F46E5",
                  backgroundColor: "#EEF2FF", borderRadius: 20, padding: "2px 7px",
                }}>{msgs.length}</span>
              </div>
              <div>
                {msgs.map((m, i) => (
                  <div key={m.id} style={{
                    padding: "12px 16px",
                    borderBottom: i < msgs.length - 1 ? "0.5px solid #F1F5F9" : "none",
                    display: "flex", gap: 12,
                  }}>
                    <div style={{ width: 80, flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{m.senderName}</p>
                      <p style={{ margin: 0, fontSize: 10, color: "#94A3B8" }}>{formatDate(m.createdAt)}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.55 }}>{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
