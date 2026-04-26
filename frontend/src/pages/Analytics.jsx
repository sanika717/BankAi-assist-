import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAnalytics } from "../services/api";

const LANG_LABELS = { hi: "Hindi", mr: "Marathi", ta: "Tamil", en: "English", te: "Telugu", bn: "Bengali" };

function formatDay(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics({ branch_id: user?.branch_id })
      .then(setData)
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  const maxIntent = data?.by_intent?.[0]?.count || 1;
  const maxLang = data?.by_language?.[0]?.count || 1;
  const dayMax = Math.max(...(data?.daily_counts?.map(d => d.count) || [1]), 1);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Analytics</h2>
          <p style={styles.subtitle}>Branch {user?.branch_id} · Session & Intent Metrics</p>
        </div>
        <div style={styles.liveBadge}>LIVE DATA</div>
      </div>

      {loading && <div style={styles.loading}>Loading analytics…</div>}
      {error && <div style={styles.error}>{error}</div>}

      {data && (
        <>
          <div style={styles.kpiGrid}>
            {[
              { label: "Total Sessions", value: data.total_interactions, icon: "🎙️", color: "#1565c0" },
              { label: "Unique Intents", value: data.by_intent?.length ?? 0, icon: "🧠", color: "#6a1b9a" },
              { label: "Languages Used", value: data.by_language?.length ?? 0, icon: "🌐", color: "#2e7d32" },
              { label: "Days Tracked", value: data.daily_counts?.length ?? 0, icon: "📅", color: "#b45309" },
            ].map((k) => (
              <div key={k.label} style={{ ...styles.kpiCard, borderTop: `3px solid ${k.color}` }}>
                <div style={styles.kpiIcon}>{k.icon}</div>
                <div style={{ ...styles.kpiValue, color: k.color }}>{k.value}</div>
                <div style={styles.kpiLabel}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={styles.grid}>
            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Intent Distribution</h3>
              {data.by_intent?.length === 0 && <p style={styles.empty}>No intent data yet.</p>}
              {data.by_intent?.map((item) => (
                <div key={item.intent} style={styles.barRow}>
                  <span style={styles.barLabel}>{item.intent?.replace(/_/g, " ") || "Unknown"}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${Math.round((item.count / maxIntent) * 100)}%` }} />
                  </div>
                  <span style={styles.barCount}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={styles.panel}>
              <h3 style={styles.panelTitle}>Language Usage</h3>
              {data.by_language?.length === 0 && <p style={styles.empty}>No language data yet.</p>}
              {data.by_language?.map((item) => (
                <div key={item.language} style={styles.barRow}>
                  <span style={styles.barLabel}>{LANG_LABELS[item.language] || item.language?.toUpperCase() || "Unknown"}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${Math.round((item.count / maxLang) * 100)}%`, background: "linear-gradient(90deg,#6a1b9a,#9c27b0)" }} />
                  </div>
                  <span style={{ ...styles.barCount, color: "#6a1b9a" }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>Daily Session Trend (Last 7 Days)</h3>
            {data.daily_counts?.length === 0 && <p style={styles.empty}>No daily data yet.</p>}
            <div style={styles.dailyGrid}>
              {[...data.daily_counts].reverse().map((d) => (
                <div key={d.day} style={styles.dayCol}>
                  <div style={styles.dayBarWrap}>
                    <div style={{ ...styles.dayBar, height: `${Math.max(Math.round((d.count / dayMax) * 100), 4)}%` }} />
                  </div>
                  <div style={styles.dayCount}>{d.count}</div>
                  <div style={styles.dayLabel}>{formatDay(d.day)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 28, maxWidth: 1100 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { margin: "0 0 4px", fontSize: 24, color: "#0d1f3c", fontWeight: 700 },
  subtitle: { margin: 0, fontSize: 14, color: "#64748b" },
  liveBadge: { background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: 1 },
  loading: { padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 },
  kpiCard: { background: "#fff", borderRadius: 10, padding: "20px 20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", textAlign: "center", border: "1px solid #e2e8f0" },
  kpiIcon: { fontSize: 26, marginBottom: 8 },
  kpiValue: { fontSize: 32, fontWeight: 700 },
  kpiLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  panel: { background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", marginBottom: 20 },
  panelTitle: { margin: "0 0 18px", fontSize: 15, color: "#0d1f3c", fontWeight: 600 },
  empty: { fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "20px 0" },
  barRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  barLabel: { fontSize: 13, color: "#475569", textTransform: "capitalize", width: 160, flexShrink: 0 },
  barTrack: { flex: 1, height: 10, background: "#e2e8f0", borderRadius: 6, overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg,#1565c0,#1976d2)", borderRadius: 6, transition: "width 0.6s ease" },
  barCount: { fontSize: 13, fontWeight: 600, color: "#1565c0", width: 32, textAlign: "right" },
  dailyGrid: { display: "flex", gap: 12, alignItems: "flex-end", height: 140, padding: "0 4px" },
  dayCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" },
  dayBarWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" },
  dayBar: { width: "60%", background: "linear-gradient(180deg,#1976d2,#1565c0)", borderRadius: "4px 4px 0 0", minHeight: 4 },
  dayCount: { fontSize: 12, fontWeight: 600, color: "#1565c0", marginTop: 4 },
  dayLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
};
