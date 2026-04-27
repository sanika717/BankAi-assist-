export default function MissingDocumentsDetector({ requiredDocuments = [], documentStatuses = {}, intent = "" }) {
  if (requiredDocuments.length === 0) return null;

  const getDocumentStatus = (docId) => documentStatuses[docId] || "Pending";

  const categorized = {
    uploaded: [],
    verified: [],
    pending: [],
    missing: [],
  };

  requiredDocuments.forEach(doc => {
    const status = getDocumentStatus(doc.id);
    if (status === "Stored") categorized.uploaded.push(doc);
    else if (status === "Verified") categorized.verified.push(doc);
    else if (doc.required !== false) categorized.pending.push(doc);
    else categorized.missing.push(doc);
  });

  const statusPercentage = ((categorized.uploaded.length + categorized.verified.length) / requiredDocuments.length) * 100;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>📋 Document Submission Status</h4>
        <span style={styles.badge}>{Math.round(statusPercentage)}% Complete</span>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progress, width: `${statusPercentage}%` }} />
      </div>

      <div style={styles.grid}>
        {categorized.verified.length > 0 && (
          <div style={styles.category}>
            <p style={{ ...styles.label, color: "#15803d" }}>✓ Verified ({categorized.verified.length})</p>
            {categorized.verified.map(doc => (
              <p key={doc.id} style={styles.docName}>{doc.label}</p>
            ))}
          </div>
        )}

        {categorized.uploaded.length > 0 && (
          <div style={styles.category}>
            <p style={{ ...styles.label, color: "#1e40af" }}>📤 Uploaded ({categorized.uploaded.length})</p>
            {categorized.uploaded.map(doc => (
              <p key={doc.id} style={styles.docName}>{doc.label}</p>
            ))}
          </div>
        )}

        {categorized.pending.length > 0 && (
          <div style={styles.category}>
            <p style={{ ...styles.label, color: "#ea580c" }}>⏳ Pending ({categorized.pending.length})</p>
            {categorized.pending.map(doc => (
              <p key={doc.id} style={styles.docName}>{doc.label}{doc.required ? " (required)" : " (optional)"}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: "#1f2937" },
  badge: {
    background: "#e0f2fe", color: "#0369a1", padding: "4px 12px",
    borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  progressBar: {
    height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden",
    marginBottom: 12,
  },
  progress: { height: "100%", background: "#15803d", transition: "width 0.3s ease" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 },
  category: { padding: 10, background: "#f9fafb", borderRadius: 6, fontSize: 12 },
  label: { margin: "0 0 6px", fontWeight: 600, fontSize: 12 },
  docName: { margin: "4px 0", color: "#475569", fontSize: 11 },
};
