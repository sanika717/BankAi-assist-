import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "bn", label: "Bengali" },
];

function FieldRow({ label, value }) {
  return (
    <div style={fr.row}>
      <span style={fr.label}>{label}</span>
      <span style={fr.value}>{value}</span>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ ...tg.track, background: value ? "#1565c0" : "#cbd5e1" }}
    >
      <span style={{ ...tg.thumb, transform: value ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [defaultLang, setDefaultLang] = useState("hi");
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [voicePlayback, setVoicePlayback] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>Settings</h2>
        <p style={styles.subtitle}>Configure your BankAssist AI preferences</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}><span style={styles.pIcon}>👤</span><h3 style={styles.panelTitle}>Staff Profile</h3></div>
          <FieldRow label="Full Name" value={user?.full_name || "—"} />
          <FieldRow label="Username" value={user?.username || "—"} />
          <FieldRow label="Branch ID" value={user?.branch_id || "—"} />
          <FieldRow label="Role" value={user?.role?.toUpperCase() || "STAFF"} />
          <div style={styles.infoNote}>Profile details are managed by your branch administrator.</div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}><span style={styles.pIcon}>⚙️</span><h3 style={styles.panelTitle}>Session Preferences</h3></div>

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Default Customer Language</div>
              <div style={styles.settingDesc}>Pre-selected when a new session starts</div>
            </div>
            <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} style={styles.select}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div style={styles.divider} />

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Auto-Summarize on Session End</div>
              <div style={styles.settingDesc}>Auto-generate summary when session closes</div>
            </div>
            <Toggle value={autoSummarize} onChange={setAutoSummarize} />
          </div>
          <div style={styles.divider} />

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Voice Playback</div>
              <div style={styles.settingDesc}>Enable audio output for customer-facing responses</div>
            </div>
            <Toggle value={voicePlayback} onChange={setVoicePlayback} />
          </div>
          <div style={styles.divider} />

          <div style={styles.settingRow}>
            <div>
              <div style={styles.settingLabel}>Session Timeout</div>
              <div style={styles.settingDesc}>Auto-end idle sessions</div>
            </div>
            <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} style={styles.select}>
              {["15", "30", "45", "60"].map((v) => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}><span style={styles.pIcon}>🏦</span><h3 style={styles.panelTitle}>System Information</h3></div>
          <FieldRow label="Application" value="BankAssist AI" />
          <FieldRow label="Version" value="2.0.0" />
          <FieldRow label="AI Engine" value="OpenAI GPT-4o-mini" />
          <FieldRow label="Speech Engine" value="OpenAI Whisper" />
          <FieldRow label="Languages" value="10+ Supported" />
          <FieldRow label="Data Storage" value="Local SQLite (Branch)" />
          <div style={styles.statusRow}>
            <span style={styles.statusDot} />
            <span style={styles.statusText}>All systems operational</span>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}><span style={styles.pIcon}>🔒</span><h3 style={styles.panelTitle}>Security & Compliance</h3></div>
          {[
            "All conversations encrypted at rest",
            "No customer PII stored in AI models",
            "Session logs retained per RBI guidelines",
            "Role-based access control enforced",
            "Audit trail enabled for all interactions",
          ].map((item) => (
            <div key={item} style={styles.complianceItem}>
              <span style={styles.checkIcon}>✓</span>
              <span style={styles.complianceText}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.saveBar}>
        {saved && <span style={styles.savedMsg}>✅ Preferences saved successfully</span>}
        <button style={styles.saveBtn} onClick={handleSave}>Save Preferences</button>
      </div>
    </div>
  );
}

const fr = {
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  label: { fontSize: 13, color: "#64748b" },
  value: { fontSize: 13, fontWeight: 600, color: "#0d1f3c" },
};
const tg = {
  track: { width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", padding: 0 },
  thumb: { position: "absolute", top: 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.2s", display: "block" },
};
const styles = {
  page: { padding: 28, maxWidth: 1100 },
  header: { marginBottom: 28 },
  title: { margin: "0 0 4px", fontSize: 24, color: "#0d1f3c", fontWeight: 700 },
  subtitle: { margin: 0, fontSize: 14, color: "#64748b" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  panel: { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  panelHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  pIcon: { fontSize: 20 },
  panelTitle: { margin: 0, fontSize: 15, color: "#0d1f3c", fontWeight: 600 },
  infoNote: { marginTop: 16, fontSize: 12, color: "#94a3b8", background: "#f8fafc", padding: "10px 12px", borderRadius: 6 },
  settingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "14px 0" },
  settingLabel: { fontSize: 14, fontWeight: 500, color: "#0d1f3c", marginBottom: 2 },
  settingDesc: { fontSize: 12, color: "#94a3b8" },
  select: { border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 12px", fontSize: 13, color: "#334155", background: "#f8fafc", cursor: "pointer", flexShrink: 0 },
  divider: { height: 1, background: "#f1f5f9" },
  statusRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 16 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" },
  statusText: { fontSize: 13, color: "#166534", fontWeight: 500 },
  complianceItem: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  checkIcon: { color: "#1565c0", fontWeight: 700, fontSize: 14, marginTop: 1 },
  complianceText: { fontSize: 13, color: "#475569" },
  saveBar: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, padding: "16px 0" },
  savedMsg: { fontSize: 13, color: "#166534", fontWeight: 500 },
  saveBtn: { background: "linear-gradient(135deg,#1565c0,#1976d2)", color: "#fff", border: "none", padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
};
