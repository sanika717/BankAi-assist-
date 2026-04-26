import { useMemo, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import TranscriptCard from "../components/TranscriptCard";
import IntentCard from "../components/IntentCard";
import WorkflowCard from "../components/WorkflowCard";
import SummaryCard from "../components/SummaryCard";
import DocumentVerification from "../components/DocumentVerification";
import {
  transcribeAudio, translateText, detectIntent,
  generateResponse, generateSummary, textToSpeech,
} from "../services/api";

const LANGUAGES = [
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "kn", label: "Kannada" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "pa", label: "Punjabi" },
];

export default function Assistant() {
  const { user } = useAuth();
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const [lang, setLang] = useState("hi");
  const [customerTranscript, setCustomerTranscript] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [intentResult, setIntentResult] = useState(null);
  const [staffReply, setStaffReply] = useState("");
  const [staffAssist, setStaffAssist] = useState("");
  const [customerFacing, setCustomerFacing] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [recording, setRecording] = useState(null);
  const mediaRef = useRef(null);

  function addHistory(speaker, text) {
    setHistory(h => [...h, { speaker, text, language: lang }]);
  }

  async function startRecording(forStaff = false) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: "audio/webm" });
      if (forStaff) await processStaffAudio(blob);
      else await processCustomerAudio(blob);
      setRecording(null);
    };
    mr.start();
    mediaRef.current = mr;
    setRecording(forStaff ? "staff" : "customer");
  }

  function stopRecording() {
    mediaRef.current?.stop();
  }

  async function processCustomerAudio(blob) {
    setError(""); setLoading(true); setLoadingMsg("Transcribing audio...");
    try {
      const stt = await transcribeAudio({ audioBlob: blob, sessionId, languageHint: lang });
      setCustomerTranscript(stt.transcript);
      addHistory("Customer", stt.transcript);
      setLoadingMsg("Translating to English...");
      const tr = await translateText({ text: stt.transcript, source_language: lang, target_language: "en" });
      setEnglishText(tr.translated_text);
      setLoadingMsg("Detecting intent...");
      const intent = await detectIntent({ text: tr.translated_text, session_id: sessionId });
      setIntentResult(intent);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function processStaffAudio(blob) {
    setError(""); setLoading(true); setLoadingMsg("Processing staff input...");
    try {
      const stt = await transcribeAudio({ audioBlob: blob, sessionId, languageHint: "en" });
      setStaffReply(stt.transcript);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function handleGenerate() {
    setError(""); setLoading(true); setLoadingMsg("Generating AI response...");
    try {
      const res = await generateResponse({
        customer_text_english: englishText,
        intent: intentResult?.intent || "general_bank_query",
        response_language: lang,
        staff_reply_text: staffReply,
      });
      setStaffAssist(res.staff_assist_english);
      setCustomerFacing(res.customer_facing_text);
      addHistory("Staff", res.customer_facing_text);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function handleSpeak() {
    if (!customerFacing) return;
    setLoading(true); setLoadingMsg("Generating audio...");
    try {
      const blob = await textToSpeech({ text: customerFacing, languageCode: lang, sessionId });
      const url = URL.createObjectURL(blob);
      new Audio(url).play();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function handleSummary() {
    setError(""); setLoading(true); setLoadingMsg("Generating summary...");
    try {
      const res = await generateSummary({
        conversation_history: history,
        customer_language: lang,
        session_id: sessionId,
        staff_id: user?.user_id || "",
        branch_id: user?.branch_id || "",
        intent: intentResult?.intent || "",
      });
      setSummary(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  function handleReset() {
    setCustomerTranscript(""); setEnglishText(""); setIntentResult(null);
    setStaffReply(""); setStaffAssist(""); setCustomerFacing(""); setSummary(null);
    setHistory([]); setError("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>🎙️ Live Voice Assistant</h2>
          <p style={styles.sessionId}>Session: <code>{sessionId.slice(0, 16)}...</code></p>
        </div>
        <div style={styles.controls}>
          <select style={styles.select} value={lang} onChange={e => setLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button style={styles.resetBtn} onClick={handleReset}>New Session</button>
        </div>
      </div>

      <div style={styles.recorderPanel}>
        <div style={styles.recorderCard}>
          <div style={styles.micIcon}>{recording === "customer" ? "🔴" : "🎙️"}</div>
          <p style={styles.recorderLabel}>Customer Voice</p>
          {recording === "customer" ? (
            <button style={{ ...styles.recBtn, ...styles.stopBtn }} onClick={stopRecording}>⏹ Stop Recording</button>
          ) : (
            <button style={styles.recBtn} onClick={() => startRecording(false)} disabled={!!recording || loading}>
              Record Customer
            </button>
          )}
        </div>
        <div style={styles.recorderCard}>
          <div style={styles.micIcon}>{recording === "staff" ? "🔴" : "💼"}</div>
          <p style={styles.recorderLabel}>Staff Reply</p>
          {recording === "staff" ? (
            <button style={{ ...styles.recBtn, ...styles.stopBtn }} onClick={stopRecording}>⏹ Stop Recording</button>
          ) : (
            <button style={styles.recBtn} onClick={() => startRecording(true)} disabled={!!recording || loading}>
              Record Staff
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={styles.loadingBar}>
          <div style={styles.spinner} />
          <span>{loadingMsg}</span>
        </div>
      )}
      {error && <div style={styles.errorBar}>{error}</div>}

      <div style={styles.grid2}>
        <TranscriptCard title="Customer Transcript" content={customerTranscript} language={lang.toUpperCase()} accent />
        <TranscriptCard title="Translated (English)" content={englishText} language="EN" />
      </div>

      {intentResult && (
        <div style={styles.section}>
          <IntentCard intentResult={intentResult} />
        </div>
      )}

      {intentResult?.workflow_steps?.length > 0 && (
        <div style={styles.section}>
          <WorkflowCard steps={intentResult.workflow_steps} />
        </div>
      )}

      <div style={styles.replySection}>
        <label style={styles.replyLabel}>Staff Reply / Edit Response</label>
        <textarea
          style={styles.textarea}
          value={staffReply}
          onChange={e => setStaffReply(e.target.value)}
          placeholder="Type or record your reply in English..."
          rows={3}
        />
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={handleGenerate} disabled={loading || !englishText}>
            🤖 Generate AI Response
          </button>
          <button style={{ ...styles.actionBtn, ...styles.speakBtn }} onClick={handleSpeak} disabled={loading || !customerFacing}>
            🔊 Speak to Customer
          </button>
          <button style={{ ...styles.actionBtn, ...styles.summaryBtn }} onClick={handleSummary} disabled={loading || history.length === 0}>
            📄 End & Summarize
          </button>
        </div>
      </div>

      {(staffAssist || customerFacing) && (
        <div style={styles.grid2}>
          <TranscriptCard title="Staff Guidance (English)" content={staffAssist} language="EN" />
          <TranscriptCard title="Customer Response" content={customerFacing} language={lang.toUpperCase()} accent />
        </div>
      )}

      {summary && <div style={styles.section}><SummaryCard summary={summary} language={lang} /></div>}
          <DocumentVerification />
</div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1100 },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  pageTitle: { margin: "0 0 4px", fontSize: 22, color: "#0d1f3c", fontWeight: 700 },
  sessionId: { margin: 0, fontSize: 12, color: "#94a3b8" },
  controls: { display: "flex", gap: 10 },
  select: {
    padding: "8px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, background: "#fff", cursor: "pointer",
  },
  resetBtn: {
    padding: "8px 16px", background: "#f1f5f9", border: "1px solid #e2e8f0",
    borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#475569",
  },
  recorderPanel: { display: "flex", gap: 16, marginBottom: 20 },
  recorderCard: {
    flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
    padding: "20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  micIcon: { fontSize: 36, marginBottom: 8 },
  recorderLabel: { margin: "0 0 12px", fontSize: 14, color: "#475569", fontWeight: 600 },
  recBtn: {
    padding: "10px 24px", background: "linear-gradient(135deg, #1565c0, #1976d2)",
    color: "#fff", border: "none", borderRadius: 8, fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  stopBtn: { background: "linear-gradient(135deg, #c62828, #e53935)" },
  loadingBar: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
    background: "#e3f2fd", borderRadius: 8, marginBottom: 16, color: "#1565c0",
  },
  spinner: {
    width: 16, height: 16, border: "2px solid #90caf9",
    borderTopColor: "#1565c0", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  errorBar: {
    padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  section: { marginBottom: 16 },
  replySection: {
    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: 20, marginBottom: 16,
  },
  replyLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 8 },
  textarea: {
    width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 14, resize: "vertical", boxSizing: "border-box",
    fontFamily: "inherit",
  },
  actions: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  actionBtn: {
    padding: "10px 20px", background: "#1565c0", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  speakBtn: { background: "#2e7d32" },
  summaryBtn: { background: "#6a1b9a" },
};
