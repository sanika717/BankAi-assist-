export default function TranscriptCard({ title, content, language, accent }) {
  return (
    <div style={{ ...styles.card, ...(accent ? styles.accent : {}) }}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        {language && <span style={styles.lang}>{language}</span>}
      </div>
      <div style={styles.body}>
        {content ? (
          <p style={styles.text}>{content}</p>
        ) : (
          <p style={styles.placeholder}>Awaiting input...</p>
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
  accent: { borderTop: "3px solid #1565c0" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
  },
  title: { fontSize: 13, fontWeight: 600, color: "#334155" },
  lang: {
    fontSize: 11, fontWeight: 700, color: "#1565c0",
    background: "#e3f2fd", padding: "2px 8px", borderRadius: 4, letterSpacing: 0.5,
  },
  body: { padding: "14px 16px", minHeight: 80 },
  text: { margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 },
  placeholder: { margin: 0, fontSize: 13, color: "#94a3b8", fontStyle: "italic" },
};
