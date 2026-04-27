const INTENT_COLORS = {
  account_opening: "#1565c0",
  loan_enquiry: "#6a1b9a",
  kyc_update: "#e65100",
  card_issue: "#00695c",
  balance_query: "#1b5e20",
  fixed_deposit_enquiry: "#2e7d32",
  general_bank_query: "#37474f",
};

const INTENT_LABELS = {
  fixed_deposit_enquiry: "FIXED DEPOSIT",
  account_opening: "ACCOUNT OPENING",
  loan_enquiry: "LOAN ENQUIRY",
  kyc_update: "KYC UPDATE",
  fund_transfer_enquiry: "FUND TRANSFER",
  general_bank_query: "GENERAL BANK QUERY",
};

export default function IntentCard({ intentResult }) {
  if (!intentResult) return null;
  const { intent, confidence, entities, suggested_responses, workflow_steps, detected_banking_terms } = intentResult;
  const color = INTENT_COLORS[intent] || "#37474f";
  const pct = Math.round((confidence || 0) * 100);
  const title = INTENT_LABELS[intent] || intent?.replace(/_/g, " ").toUpperCase();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <span style={{ ...styles.intentBadge, background: color }}>
            {title}
          </span>
        </div>
        <div style={styles.confWrapper}>
          <span style={styles.confLabel}>Confidence</span>
          <div style={styles.confBar}>
            <div style={{ ...styles.confFill, width: `${pct}%`, background: color }} />
          </div>
          <span style={{ ...styles.confPct, color }}>{pct}%</span>
        </div>
      </div>

      {entities && Object.keys(entities).length > 0 && (
        <div style={styles.entities}>
          {Object.entries(entities).map(([k, v]) => (
            <span key={k} style={styles.entity}>
              <strong>{k}:</strong> {v}
            </span>
          ))}
        </div>
      )}

      {detected_banking_terms && detected_banking_terms.length > 0 && (
        <div style={styles.detectedTerms}>
          <h4 style={styles.sectionTitle}>🏦 Detected Banking Terms</h4>
          <div style={styles.termsList}>
            {detected_banking_terms.map((term, i) => (
              <span key={i} style={styles.term}>{term}</span>
            ))}
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {suggested_responses?.length > 0 && (
          <div>
            <h4 style={styles.sectionTitle}>💬 Suggested Responses</h4>
            <ul style={styles.list}>
              {suggested_responses.map((r, i) => (
                <li key={i} style={styles.listItem}>{r}</li>
              ))}
            </ul>
          </div>
        )}
        {workflow_steps?.length > 0 && (
          <div>
            <h4 style={styles.sectionTitle}>📋 Workflow Steps</h4>
            <ol style={styles.list}>
              {workflow_steps.map((s, i) => (
                <li key={i} style={styles.listItem}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  intentBadge: {
    color: "#fff", fontSize: 12, fontWeight: 700,
    padding: "4px 12px", borderRadius: 6, letterSpacing: 0.5,
  },
  confWrapper: { display: "flex", alignItems: "center", gap: 8 },
  confLabel: { fontSize: 12, color: "#64748b" },
  confBar: { width: 100, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  confFill: { height: "100%", borderRadius: 3, transition: "width 0.4s" },
  confPct: { fontSize: 13, fontWeight: 700 },
  entities: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  entity: {
    fontSize: 12, background: "#f1f5f9", padding: "3px 10px",
    borderRadius: 4, color: "#475569",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 },
  sectionTitle: { margin: "0 0 8px", fontSize: 13, color: "#334155", fontWeight: 600 },
  list: { margin: 0, paddingLeft: 18 },
  detectedTerms: { marginBottom: 14 },
  termsList: { display: "flex", gap: 6, flexWrap: "wrap" },
  term: {
    fontSize: 12, background: "#e0f2fe", color: "#0277bd",
    padding: "3px 8px", borderRadius: 4, fontWeight: 500,
  },
};
