export default function WorkflowCard({ steps = [], currentStep = 0 }) {
  return (
    <div style={styles.card}>
      <h4 style={styles.title}>Process Workflow</h4>
      <div style={styles.steps}>
        {steps.map((step, i) => (
          <div key={i} style={styles.step}>
            <div style={{
              ...styles.circle,
              background: i < currentStep ? "#1565c0" : i === currentStep ? "#4fc3f7" : "#e2e8f0",
              color: i <= currentStep ? "#fff" : "#94a3b8",
            }}>
              {i < currentStep ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ ...styles.line, background: i < currentStep ? "#1565c0" : "#e2e8f0" }} />
            )}
            <span style={{ ...styles.label, color: i === currentStep ? "#0d1f3c" : "#64748b" }}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  title: { margin: "0 0 16px", fontSize: 14, color: "#334155", fontWeight: 600 },
  steps: { display: "flex", flexDirection: "column", gap: 0 },
  step: { display: "flex", alignItems: "flex-start", gap: 12, position: "relative", paddingBottom: 16 },
  circle: {
    width: 28, height: 28, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, flexShrink: 0, zIndex: 1,
  },
  line: {
    position: "absolute", left: 14, top: 28, width: 2, height: 20, zIndex: 0,
  },
  label: { fontSize: 13, paddingTop: 4, lineHeight: 1.4 },
};
