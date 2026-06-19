"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, fetchMessages } from "@/app/actions/connections";

interface Thread {
  connectionId: string;
  otherName: string;
  sector: string | null;
  stage: string | null;
  lastMessage: string | null;
  lastAt: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Props {
  userId: string;
  threads: Thread[];
  initialMessages: Message[];
  selectedConnectionId: string | null;
  myDisplayName: string;
  senderMap: Record<string, string>;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return formatTime(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function threadInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function MessagesClient({
  userId, threads, initialMessages, selectedConnectionId: initialSelected,
  myDisplayName, senderMap,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(initialSelected);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isSending, startSend] = useTransition();
  const [isLoading, startLoad] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeThread = threads.find(t => t.connectionId === selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const supabase = createClient();
    const channel = supabase.channel(`messages:${selectedId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `connection_id=eq.${selectedId}`,
      }, payload => {
        const msg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          // Replace optimistic placeholder from current user with the real DB message
          if (msg.sender_id === userId) {
            const optIdx = prev.findIndex(m => m.id.startsWith("opt-") && m.sender_id === userId);
            if (optIdx !== -1) {
              const next = [...prev];
              next[optIdx] = msg;
              return next;
            }
          }
          return [...prev, msg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function selectThread(connectionId: string) {
    setSelectedId(connectionId);
    router.push(`/messages?c=${connectionId}`, { scroll: false });
    startLoad(async () => {
      const msgs = await fetchMessages(connectionId);
      setMessages(msgs);
    });
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || !selectedId) return;
    setInputText("");
    startSend(async () => {
      const result = await sendMessage(selectedId, text);
      if (!result?.error) {
        const optimistic: Message = {
          id: `opt-${Date.now()}`,
          sender_id: userId,
          content: text,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimistic]);
      }
    });
  }

  return (
    <div style={{
      display: "flex", height: "100vh",
      marginLeft: 56,
      backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Thread list */}
      <aside style={{
        width: 220, flexShrink: 0,
        backgroundColor: "white", borderRight: "0.5px solid #E2E8F0",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 16px 14px",
          borderBottom: "0.5px solid #E2E8F0",
        }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            StartGrid
          </p>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>
            Messages
          </h1>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {threads.length === 0 ? (
            <p style={{ padding: "20px 16px", fontSize: 12, color: "#94A3B8", margin: 0 }}>
              No conversations yet.
            </p>
          ) : threads.map(t => (
            <button key={t.connectionId} type="button" onClick={() => selectThread(t.connectionId)}
              style={{
                width: "100%", textAlign: "left",
                padding: "12px 14px",
                borderBottom: "0.5px solid #F1F5F9",
                borderLeft: selectedId === t.connectionId ? "2.5px solid #4F46E5" : "2.5px solid transparent",
                backgroundColor: selectedId === t.connectionId ? "#EEF2FF" : "transparent",
                cursor: "pointer", border: "none",
                borderLeftWidth: 2.5,
                borderLeftStyle: "solid",
                borderLeftColor: selectedId === t.connectionId ? "#4F46E5" : "transparent",
                transition: "all 0.15s",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 10,
                }}>
                  {threadInitials(t.otherName)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.otherName}
                    </p>
                    <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0, marginLeft: 4 }}>{formatDate(t.lastAt)}</span>
                  </div>
                  {t.lastMessage && (
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
                      {t.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {!selectedId || !activeThread ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{
              padding: "14px 24px",
              borderBottom: "0.5px solid #E2E8F0",
              backgroundColor: "white",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 12,
              }}>
                {threadInitials(activeThread.otherName)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.2px" }}>
                  {activeThread.otherName}
                </p>
                <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                  {activeThread.stage && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: "#475569", backgroundColor: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 20, padding: "2px 8px" }}>
                      {activeThread.stage}
                    </span>
                  )}
                  {activeThread.sector && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: "#4F46E5", backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE", borderRadius: 20, padding: "2px 8px" }}>
                      {activeThread.sector}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Integrity notice */}
            <div style={{
              margin: "12px 20px 0",
              backgroundColor: "#EEF2FF", border: "0.5px solid #C7D2FE",
              borderRadius: 8, padding: "9px 14px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 12 }}>🛡️</span>
              <p style={{ margin: 0, fontSize: 11, color: "#4338CA", lineHeight: 1.5 }}>
                This conversation is visible to the StartGrid team for platform integrity.
              </p>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {isLoading ? (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8" }}>Loading…</p>
              ) : messages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 40 }}>
                  <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No messages yet — say hello!</p>
                </div>
              ) : messages.map(msg => {
                const isMe = msg.sender_id === userId;
                const senderName = isMe ? myDisplayName : (senderMap[msg.sender_id] ?? "Them");
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "68%", padding: "10px 14px", borderRadius: 12,
                      fontSize: 13, lineHeight: 1.55,
                      ...(isMe
                        ? { background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "white", borderBottomRightRadius: 4 }
                        : { backgroundColor: "white", border: "0.5px solid #E2E8F0", color: "#0F172A", borderBottomLeftRadius: 4 }
                      ),
                    }}>
                      {msg.content}
                    </div>
                    <p style={{ margin: "3px 2px 0", fontSize: 10, color: "#94A3B8" }}>
                      {senderName} · {formatTime(msg.created_at)}
                    </p>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
              padding: "12px 20px", borderTop: "0.5px solid #E2E8F0",
              backgroundColor: "white", display: "flex", gap: 10, alignItems: "flex-end",
            }}>
              <textarea
                ref={textareaRef}
                placeholder="Type a message…"
                value={inputText}
                rows={1}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={isSending}
                style={{
                  flex: 1, padding: "10px 12px",
                  border: "0.5px solid #E2E8F0", borderRadius: 10,
                  fontSize: 13, color: "#0F172A", backgroundColor: "white",
                  outline: "none", resize: "none", lineHeight: 1.5,
                  fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s",
                  maxHeight: 100, overflowY: "auto",
                }}
                onFocus={e => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
              />
              <button type="button" onClick={handleSend}
                disabled={isSending || !inputText.trim()}
                style={{
                  padding: "10px 18px", borderRadius: 10, border: "none",
                  background: (isSending || !inputText.trim()) ? "#C7D2FE" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: "white", fontSize: 13, fontWeight: 600,
                  cursor: (isSending || !inputText.trim()) ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  boxShadow: (isSending || !inputText.trim()) ? "none" : "0 2px 8px rgba(79,70,229,0.3)",
                  transition: "all 0.15s",
                }}>
                {isSending ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
