export default function EligibilityChecker({ intent = "", intentResult = null }) {
  if (!intent) return null;

  const eligibilityRules = {
    fixed_deposit_enquiry: {
      title: "Fixed Deposit Eligibility",
      criteria: [
        "✓ Minimum deposit amount: ₹5,000",
        "✓ Tenure: 7 days to 10 years",
        "✓ Valid KYC (Aadhaar/PAN)",
        "✓ Maturity amount eligible after tenure",
      ],
      info: "You're eligible for a Fixed Deposit. Please provide deposit amount and tenure.",
    },
    loan_enquiry: {
      title: "Loan Eligibility",
      criteria: [
        "✓ Minimum monthly income: ₹15,000",
        "✓ Employment proof: Salary slip (last 3 months)",
        "✓ Valid KYC (Aadhaar/PAN)",
        "✓ Age: 18-65 years",
        "✓ Credit history required",
      ],
      info: "Upload salary slip and bank statement to check EMI eligibility.",
    },
    account_opening: {
      title: "Savings Account Eligibility",
      criteria: [
        "✓ Minimum age: 18 years",
        "✓ Valid KYC (Aadhaar/PAN)",
        "✓ Address proof required",
        "✓ Minimum opening balance: ₹0",
        "✓ Minimum balance varies by account type",
      ],
      info: "You're eligible to open a savings account. Complete KYC verification.",
    },
    kyc_update: {
      title: "KYC Update Eligibility",
      criteria: [
        "✓ Update required for existing customers",
        "✓ Aadhaar/PAN mandatory",
        "✓ Address proof if address changed",
        "✓ Valid identification required",
      ],
      info: "Complete your KYC update to maintain banking services.",
    },
    emi_enquiry: {
      title: "EMI Eligibility",
      criteria: [
        "✓ Minimum monthly income: ₹20,000",
        "✓ Max EMI: 50% of monthly income",
        "✓ Employment stability: min 6 months",
        "✓ Valid bank account for deduction",
      ],
      info: "Check your EMI capacity based on salary and loan amount.",
    },
  };

  const config = eligibilityRules[intent] || {
    title: "Eligibility Check",
    criteria: ["Contact your bank for eligibility details"],
    info: "Please provide more information for eligibility assessment.",
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{config.title}</h3>
        <span style={styles.badge}>Eligible</span>
      </div>

      <p style={styles.info}>{config.info}</p>

      <div style={styles.criteriaList}>
        {config.criteria.map((criterion, idx) => (
          <div key={idx} style={styles.criterion}>
            <p style={styles.criterionText}>{criterion}</p>
          </div>
        ))}
      </div>

      <p style={styles.footer}>
        📞 Contact support for personalized eligibility assessment
      </p>
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(135deg, #f0f7ff 0%, #fef3f2 100%)", 
    border: "1px solid #bee3f8", borderRadius: 10,
    padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0d47a1" },
  badge: {
    background: "#dcfce7", color: "#166534", padding: "6px 14px",
    borderRadius: 16, fontSize: 12, fontWeight: 600,
  },
  info: {
    margin: "0 0 14px", fontSize: 13, color: "#475569", lineHeight: 1.5,
  },
  criteriaList: { display: "grid", gap: 10, marginBottom: 16 },
  criterion: { padding: 10, background: "#fff", borderRadius: 6, borderLeft: "3px solid #1565c0" },
  criterionText: { margin: 0, fontSize: 12, color: "#334155", fontWeight: 500 },
  footer: { margin: 0, fontSize: 11, color: "#64748b", textAlign: "center", fontStyle: "italic" },
};
