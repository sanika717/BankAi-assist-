export default function SummaryCard({ summary, language }) {
  if (!summary) return null;
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>📄 Session Summary</span>
        <span style={styles.badge}>Ready for Handoff</span>
      </div>
      <div style={styles.grid}>
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>English Summary</h4>
          <pre style={styles.pre}>{summary.summary_english}</pre>
        </div>
        {summary.summary_customer_language && summary.summary_customer_language !== summary.summary_english && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>{(language || "").toUpperCase()} Summary</h4>
            <pre style={styles.pre}>{summary.summary_customer_language}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 20px", background: "#f0f7ff", borderBottom: "1px solid #bee3f8",
  },
  title: { fontSize: 14, fontWeight: 600, color: "#1565c0" },
  badge: {
    fontSize: 11, fontWeight: 700, color: "#2e7d32",
    background: "#e8f5e9", padding: "3px 10px", borderRadius: 4,
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 },
  section: { padding: "16px 20px", borderRight: "1px solid #e2e8f0" },
  sectionTitle: { margin: "0 0 10px", fontSize: 13, color: "#475569", fontWeight: 600 },
  pre: {
    margin: 0, fontSize: 13, color: "#1e293b",
    whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7,
  },
};
