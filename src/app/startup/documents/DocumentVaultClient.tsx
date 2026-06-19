"use client";

import { useState, useRef } from "react";
import { uploadDocument, deleteDocument, toggleDocumentVisibility, type StartupDocument } from "@/app/actions/documents";

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mimeType: string | null): string {
  if (!mimeType) return "📄";
  if (mimeType.includes("pdf")) return "📕";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📗";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📙";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📘";
  if (mimeType.includes("image")) return "🖼️";
  return "📄";
}

interface Props {
  initialDocs: StartupDocument[];
}

export default function DocumentVaultClient({ initialDocs }: Props) {
  const [docs, setDocs] = useState<StartupDocument[]>(initialDocs);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", uploadName || file.name);
    fd.append("is_public", String(isPublic));

    const result = await uploadDocument(fd);
    setUploading(false);

    if (result.error) { setError(result.error); return; }
    if (result.doc) {
      setDocs(prev => [result.doc!, ...prev]);
      setUploadName("");
      setIsPublic(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setDocs(prev => prev.filter(d => d.id !== id));
    await deleteDocument(id);
  }

  async function handleToggleVisibility(doc: StartupDocument) {
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, is_public: !d.is_public } : d));
    await toggleDocumentVisibility(doc.id, !doc.is_public);
  }

  return (
    <div style={{
      marginLeft: 56, minHeight: "100vh", backgroundColor: "#F8FAFC",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white", borderBottom: "0.5px solid #E2E8F0",
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em" }}>StartGrid</p>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px" }}>Document Vault</p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 32px" }}>
        {/* Upload form */}
        <div style={{
          backgroundColor: "white", borderRadius: 12,
          border: "0.5px solid #E2E8F0", padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 24,
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Upload document</p>

          <form onSubmit={handleUpload}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                border: "1.5px dashed #C7D2FE", borderRadius: 10, padding: "20px",
                textAlign: "center", backgroundColor: "#F8FAFF", cursor: "pointer",
              }} onClick={() => fileRef.current?.click()}>
                <p style={{ margin: 0, fontSize: 28 }}>📎</p>
                <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: "#4F46E5" }}>Click to select file</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>PDF, DOCX, XLSX, PPTX, images — max 50 MB</p>
                <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                  onChange={e => { if (e.target.files?.[0] && !uploadName) setUploadName(e.target.files[0].name.replace(/\.[^/.]+$/, "")); }} />
              </div>

              <input
                type="text"
                placeholder="Document name (optional)"
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                style={{
                  padding: "10px 12px", borderRadius: 8, border: "0.5px solid #E2E8F0",
                  fontSize: 13, color: "#334155", outline: "none", backgroundColor: "#F8FAFC",
                }}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ accentColor: "#4F46E5", width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: "#475569" }}>Make visible to connected investors</span>
              </label>

              {error && (
                <p style={{ margin: 0, fontSize: 12, color: "#E11D48", backgroundColor: "#FFF1F2", borderRadius: 6, padding: "8px 12px" }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={uploading} style={{
                padding: "10px 20px", borderRadius: 9, cursor: uploading ? "not-allowed" : "pointer",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                border: "none", color: "white", fontSize: 13, fontWeight: 600,
                opacity: uploading ? 0.7 : 1,
              }}>
                {uploading ? "Uploading…" : "Upload document"}
              </button>
            </div>
          </form>
        </div>

        {/* Document list */}
        {docs.length === 0 ? (
          <div style={{
            backgroundColor: "white", borderRadius: 12, border: "1px dashed #E2E8F0",
            padding: "48px", textAlign: "center",
          }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>🗂️</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F172A" }}>No documents yet</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94A3B8" }}>Upload pitch decks, financial models, or data room files.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{
                backgroundColor: "white", borderRadius: 12,
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{fileIcon(doc.mime_type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94A3B8" }}>
                    {formatBytes(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                    backgroundColor: doc.is_public ? "#ECFDF5" : "#F8FAFC",
                    color: doc.is_public ? "#059669" : "#94A3B8",
                    border: `0.5px solid ${doc.is_public ? "#A7F3D0" : "#E2E8F0"}`,
                    cursor: "pointer",
                  }} onClick={() => handleToggleVisibility(doc)}>
                    {doc.is_public ? "Public" : "Private"}
                  </span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{
                    padding: "5px 10px", borderRadius: 7, textDecoration: "none",
                    border: "0.5px solid #C7D2FE", backgroundColor: "#EEF2FF",
                    fontSize: 11, fontWeight: 600, color: "#4F46E5",
                  }}>
                    View
                  </a>
                  <button type="button" onClick={() => handleDelete(doc.id)} style={{
                    padding: "5px 8px", borderRadius: 7,
                    border: "0.5px solid #FECDD3", backgroundColor: "#FFF1F2",
                    fontSize: 11, color: "#E11D48", cursor: "pointer",
                  }}>
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
