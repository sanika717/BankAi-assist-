import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHistory, getAnalytics } from "../services/api";

const QUICK_STATS = [
  { label: "Today's Sessions", key: "total_interactions", icon: "🎙️", color: "#1565c0" },
  { label: "Languages Supported", icon: "🌐", value: "10+", color: "#6a1b9a" },
  { label: "Avg Resolution", icon: "⚡", value: "< 3 min", color: "#2e7d32" },
  { label: "System Status", icon: "✅", value: "Online", color: "#00695c" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    getAnalytics({ branch_id: user?.branch_id }).then(setAnalytics).catch(() => {});
    getHistory({ limit: 5, branch_id: user?.branch_id }).then(d => setRecentSessions(d.interactions || [])).catch(() => {});
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <div>
          <h2 style={styles.greeting}>Good morning, {user?.full_name?.split(" ")[0]} 👋</h2>
          <p style={styles.subtext}>Branch {user?.branch_id} • Ready to assist customers</p>
        </div>
        <button style={styles.startBtn} onClick={() => navigate("/assistant")}>
          🎙️ Start New Session
        </button>
      </div>

      <div style={styles.statsGrid}>
        {QUICK_STATS.map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, borderTop: `3px solid ${stat.color}` }}>
            <span style={styles.statIcon}>{stat.icon}</span>
            <div style={{ ...styles.statValue, color: stat.color }}>
              {stat.key ? (analytics?.[stat.key] ?? "—") : stat.value}
            </div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Recent Sessions</h3>
          {recentSessions.length === 0 ? (
            <p style={styles.empty}>No sessions yet. Start your first session above.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Session ID", "Language", "Intent", "Time"].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.session_id?.slice(0, 8)}...</td>
                    <td style={styles.td}>{s.language?.toUpperCase() || "—"}</td>
                    <td style={styles.td}>{s.intent?.replace(/_/g, " ") || "—"}</td>
                    <td style={styles.td}>{s.timestamp?.slice(0, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Quick Actions</h3>
          {[
            { icon: "🎙️", label: "Start Voice Session", path: "/assistant" },
            { icon: "📋", label: "View Session History", path: "/history" },
            { icon: "📈", label: "View Analytics", path: "/analytics" },
            { icon: "⚙️", label: "Settings", path: "/settings" },
          ].map((a) => (
            <button key={a.path} style={styles.quickBtn} onClick={() => navigate(a.path)}>
              <span>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>
      </div>

      {analytics?.by_intent?.length > 0 && (
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Top Intents Today</h3>
          <div style={styles.intentList}>
            {analytics.by_intent.slice(0, 5).map((item) => (
              <div key={item.intent} style={styles.intentRow}>
                <span style={styles.intentName}>{item.intent?.replace(/_/g, " ")}</span>
                <div style={styles.intentBar}>
                  <div style={{
                    ...styles.intentFill,
                    width: `${Math.min(100, (item.count / analytics.total_interactions) * 100)}%`
                  }} />
                </div>
                <span style={styles.intentCount}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, maxWidth: 1100 },
  welcome: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 28,
  },
  greeting: { margin: "0 0 4px", fontSize: 24, color: "#0d1f3c", fontWeight: 700 },
  subtext: { margin: 0, fontSize: 14, color: "#64748b" },
  startBtn: {
    background: "linear-gradient(135deg, #1565c0, #1976d2)", color: "#fff",
    border: "none", padding: "12px 24px", borderRadius: 8,
    fontSize: 15, fontWeight: 600, cursor: "pointer",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 },
  statCard: {
    background: "#fff", borderRadius: 10, padding: "20px 20px 16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  statIcon: { fontSize: 26, display: "block", marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 },
  panel: {
    background: "#fff", borderRadius: 10, padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: 20,
  },
  panelTitle: { margin: "0 0 16px", fontSize: 15, color: "#0d1f3c", fontWeight: 600 },
  empty: { fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "20px 0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b",
    padding: "8px 12px", borderBottom: "1px solid #e2e8f0",
  },
  td: { fontSize: 13, color: "#334155", padding: "10px 12px", borderBottom: "1px solid #f1f5f9" },
  quickBtn: {
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8,
    padding: "12px 16px", cursor: "pointer", fontSize: 14, color: "#334155",
    marginBottom: 8, fontWeight: 500, transition: "background 0.2s",
  },
  intentList: { display: "flex", flexDirection: "column", gap: 10 },
  intentRow: { display: "flex", alignItems: "center", gap: 12 },
  intentName: { fontSize: 13, color: "#475569", width: 180, textTransform: "capitalize" },
  intentBar: { flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  intentFill: { height: "100%", background: "#1565c0", borderRadius: 4 },
  intentCount: { fontSize: 13, fontWeight: 600, color: "#1565c0", width: 30, textAlign: "right" },
};
