import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getHistory } from "../services/api";

export default function History() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getHistory({ branch_id: user?.branch_id, limit: 50 })
      .then(d => setData(d.interactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading session history...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 Session History</h2>
        <p style={styles.sub}>{data.length} interactions • Branch {user?.branch_id}</p>
      </div>

      {data.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No sessions recorded yet.</p>
          <p style={styles.emptyHint}>Start a live voice session to see history here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {data.map((s) => (
            <div key={s.id} style={styles.card}>
              <div style={styles.cardHeader} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div style={styles.cardLeft}>
                  <span style={styles.sessionChip}>{s.session_id?.slice(0, 12)}...</span>
                  {s.intent && (
                    <span style={styles.intentChip}>{s.intent.replace(/_/g, " ")}</span>
                  )}
                  {s.language && (
                    <span style={styles.langChip}>{s.language.toUpperCase()}</span>
                  )}
                </div>
                <div style={styles.cardRight}>
                  <span style={styles.timestamp}>{s.timestamp?.slice(0, 16)}</span>
                  <span style={styles.chevron}>{expanded === s.id ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === s.id && (
                <div style={styles.cardBody}>
                  <div style={styles.field}>
                    <strong>Staff ID:</strong> {s.staff_id || "—"}
                  </div>
                  <div style={styles.field}>
                    <strong>Branch:</strong> {s.branch_id || "—"}
                  </div>
                  {s.customer_transcript && (
                    <div style={styles.field}>
                      <strong>Customer Said:</strong>
                      <p style={styles.fieldText}>{s.customer_transcript}</p>
                    </div>
                  )}
                  {s.summary && (
                    <div style={styles.field}>
                      <strong>Summary:</strong>
                      <pre style={styles.pre}>{s.summary}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, maxWidth: 900 },
  header: { marginBottom: 24 },
  title: { margin: "0 0 4px", fontSize: 22, color: "#0d1f3c", fontWeight: 700 },
  sub: { margin: 0, fontSize: 13, color: "#64748b" },
  loading: { padding: 40, textAlign: "center", color: "#64748b" },
  empty: { textAlign: "center", padding: "60px 20px" },
  emptyText: { fontSize: 16, color: "#475569", margin: "0 0 8px" },
  emptyHint: { fontSize: 13, color: "#94a3b8", margin: 0 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 20px", cursor: "pointer",
  },
  cardLeft: { display: "flex", alignItems: "center", gap: 8 },
  cardRight: { display: "flex", alignItems: "center", gap: 12 },
  sessionChip: { fontSize: 12, fontFamily: "monospace", color: "#475569", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 },
  intentChip: { fontSize: 12, color: "#1565c0", background: "#e3f2fd", padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" },
  langChip: { fontSize: 11, fontWeight: 700, color: "#6a1b9a", background: "#f3e8ff", padding: "2px 8px", borderRadius: 4 },
  timestamp: { fontSize: 12, color: "#94a3b8" },
  chevron: { fontSize: 11, color: "#94a3b8" },
  cardBody: { padding: "0 20px 16px", borderTop: "1px solid #f1f5f9" },
  field: { marginTop: 12, fontSize: 13, color: "#334155" },
  fieldText: { margin: "4px 0 0", color: "#475569", lineHeight: 1.6 },
  pre: { margin: "4px 0 0", fontFamily: "inherit", fontSize: 13, color: "#475569", whiteSpace: "pre-wrap", lineHeight: 1.6 },
};
