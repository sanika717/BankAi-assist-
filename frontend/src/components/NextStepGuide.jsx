import { useState } from "react";

export default function NextStepGuide({ requiredDocuments = [], documentStatuses = {}, intent = "", customerTranscript = "" }) {
  const [showGuidance, setShowGuidance] = useState(true);

  if (!intent || !showGuidance) return null;

  // Determine next steps based on uploaded documents and intent
  const getNextSteps = () => {
    const steps = [];
    const pending = requiredDocuments.filter(doc => {
      const status = documentStatuses[doc.id] || "Pending";
      return status === "Pending" || status === "Verified";
    });

    if (pending.length === 0) {
      steps.push("✅ All documents collected! Ready for processing.");
      return steps;
    }

    if (customerTranscript && !requiredDocuments.some(doc => documentStatuses[doc.id] === "Stored")) {
      steps.push("📄 Let's start with document upload.");
      if (pending[0]) steps.push(`🔹 Please upload: ${pending[0].label}`);
    } else {
      pending.slice(0, 2).forEach(doc => {
        steps.push(`🔹 Next: Upload ${doc.label}`);
      });
      if (pending.length > 2) {
        steps.push(`🔹 And ${pending.length - 2} more document(s)...`);
      }
    }

    return steps.length > 0 ? steps : ["Complete the document verification process"];
  };

  const nextSteps = getNextSteps();
  const progressPercent = requiredDocuments.length > 0 
    ? Math.round((requiredDocuments.filter(d => documentStatuses[d.id] === "Stored").length / requiredDocuments.length) * 100)
    : 0;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h4 style={styles.title}>🎯 Next Steps</h4>
        <button
          onClick={() => setShowGuidance(false)}
          style={styles.closeBtn}
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      <div style={styles.progressBar}>
        <div style={{ ...styles.progress, width: `${progressPercent}%` }} />
      </div>
      <p style={styles.progressText}>{progressPercent}% Complete</p>

      <div style={styles.stepsContainer}>
        {nextSteps.map((step, idx) => (
          <div key={idx} style={{ ...styles.step, ...(idx === 0 ? styles.activeStep : {}) }}>
            <span style={styles.stepIcon}>{idx === 0 ? "→" : "•"}</span>
            <span style={styles.stepText}>{step}</span>
          </div>
        ))}
      </div>

      <p style={styles.hint}>
        💡 Tip: Upload documents in order. Your verified documents will be marked as ✓
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "#fefce8", border: "1px solid #facc15",
    borderRadius: 10, padding: 16, marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 14, fontWeight: 600, color: "#78350f" },
  closeBtn: {
    background: "transparent", border: "none", fontSize: 16,
    cursor: "pointer", color: "#ca8a04", padding: 0,
  },
  progressBar: {
    height: 6, background: "#fde68a", borderRadius: 3, overflow: "hidden",
    marginBottom: 6,
  },
  progress: { height: "100%", background: "#ca8a04", transition: "width 0.3s ease" },
  progressText: { margin: "0 0 12px", fontSize: 11, color: "#92400e", fontWeight: 600 },
  stepsContainer: { display: "grid", gap: 10 },
  step: {
    display: "flex", alignItems: "center", gap: 10, padding: 10,
    background: "#fff", borderRadius: 6, fontSize: 13, color: "#78350f",
  },
  activeStep: { background: "#fef3c7", borderLeft: "3px solid #ca8a04" },
  stepIcon: { fontWeight: 700, fontSize: 14 },
  stepText: { flex: 1 },
  hint: { margin: "12px 0 0", fontSize: 11, color: "#92400e", fontStyle: "italic" },
};
