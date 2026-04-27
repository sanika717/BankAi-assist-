import { useMemo, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import TranscriptCard from "../components/TranscriptCard";
import IntentCard from "../components/IntentCard";
import WorkflowCard from "../components/WorkflowCard";
import SummaryCard from "../components/SummaryCard";
import DocumentVerification from "../components/DocumentVerification";
import MissingDocumentsDetector from "../components/MissingDocumentsDetector";
import EligibilityChecker from "../components/EligibilityChecker";
import NextStepGuide from "../components/NextStepGuide";
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

const VOICE_LOCALES = {
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  pa: "pa-IN",
  en: "en-US",
};

const REQUIRED_DOCUMENTS_BY_INTENT = {
  account_opening: [
    { id: "aadhaar", label: "Aadhaar", required: true },
    { id: "pan", label: "PAN", required: true },
    { id: "address_proof", label: "Address Proof", required: false },
  ],
  fixed_deposit_enquiry: [
    { id: "aadhaar", label: "Aadhaar", required: true },
    { id: "pan", label: "PAN", required: true },
    { id: "photo", label: "Photo", required: false },
    { id: "deposit_slip", label: "Deposit Slip", required: false },
  ],
  loan_enquiry: [
    { id: "income_proof", label: "Income Proof", required: true },
    { id: "identity_proof", label: "Identity Proof", required: true },
    { id: "address_proof", label: "Address Proof", required: true },
    { id: "pan", label: "PAN", required: true },
  ],
  kyc_update: [
    { id: "aadhaar", label: "Aadhaar Card", required: true },
    { id: "pan", label: "PAN Card", required: true },
    { id: "kyc_documents", label: "KYC Documents", required: true },
  ],
  emi_enquiry: [
    { id: "loan_agreement", label: "Loan Agreement", required: true },
    { id: "income_proof", label: "Income Proof", required: true },
    { id: "identity_proof", label: "Identity Proof", required: true },
  ],
};

const DOCUMENT_FIELD_REQUIREMENTS = {
  aadhaar: {
    account_opening: [
      { name: "aadhaarNumber", label: "Aadhaar Number", placeholder: "1234 5678 9012", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
    ],
    fixed_deposit_enquiry: [
      { name: "aadhaarNumber", label: "Aadhaar Number", placeholder: "1234 5678 9012", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
    ],
    kyc_update: [
      { name: "aadhaarNumber", label: "Aadhaar Number", placeholder: "1234 5678 9012", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
      { name: "address", label: "Address", placeholder: "123 Main St, City", type: "text", required: true },
    ],
  },
  pan: {
    account_opening: [
      { name: "panNumber", label: "PAN Number", placeholder: "ABCDE1234F", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
    ],
    fixed_deposit_enquiry: [
      { name: "panNumber", label: "PAN Number", placeholder: "ABCDE1234F", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
    ],
    loan_enquiry: [
      { name: "panNumber", label: "PAN Number", placeholder: "ABCDE1234F", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
    ],
    kyc_update: [
      { name: "panNumber", label: "PAN Number", placeholder: "ABCDE1234F", type: "text", required: true },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text", required: true },
    ],
  },
  income_proof: {
    loan_enquiry: [
      { name: "salarySlip", label: "Recent Salary Slip", placeholder: "Month and Year", type: "text", required: true },
      { name: "monthlyIncome", label: "Monthly Income (₹)", placeholder: "50000", type: "number", required: true },
      { name: "employer", label: "Employer Name", placeholder: "Company Name", type: "text", required: true },
      { name: "employment_type", label: "Employment Type", placeholder: "Salaried/Self-employed", type: "text", required: true },
    ],
    emi_enquiry: [
      { name: "monthlyIncome", label: "Monthly Income (₹)", placeholder: "50000", type: "number", required: true },
      { name: "employer", label: "Employer Name", placeholder: "Company Name", type: "text", required: true },
    ],
  },
  identity_proof: {
    loan_enquiry: [
      { name: "idType", label: "ID Type", placeholder: "Driving License/Passport", type: "text", required: true },
      { name: "idNumber", label: "ID Number", placeholder: "DL/Passport Number", type: "text", required: true },
    ],
    emi_enquiry: [
      { name: "idType", label: "ID Type", placeholder: "Driving License/Passport", type: "text", required: true },
      { name: "idNumber", label: "ID Number", placeholder: "DL/Passport Number", type: "text", required: true },
    ],
  },
  address_proof: {
    account_opening: [
      { name: "address", label: "Current Address", placeholder: "123 Main St, City", type: "text", required: true },
      { name: "proofType", label: "Proof Type", placeholder: "Electricity Bill/Rental Agreement", type: "text", required: true },
    ],
    loan_enquiry: [
      { name: "address", label: "Current Address", placeholder: "123 Main St, City", type: "text", required: true },
      { name: "proofType", label: "Proof Type", placeholder: "Electricity Bill/Rental Agreement", type: "text", required: true },
      { name: "residencePeriod", label: "Period at Address (Years)", placeholder: "2", type: "number", required: true },
    ],
  },
  photo: {
    fixed_deposit_enquiry: [
      { name: "photoType", label: "Photo Type", placeholder: "Passport/ID Photo", type: "text", required: false },
    ],
  },
  deposit_slip: {
    fixed_deposit_enquiry: [
      { name: "depositAmount", label: "Deposit Amount (₹)", placeholder: "100000", type: "number", required: true },
      { name: "tenor", label: "Tenor (Days/Years)", placeholder: "180 days / 1 year", type: "text", required: true },
    ],
  },
  loan_agreement: {
    emi_enquiry: [
      { name: "loanAmount", label: "Loan Amount (₹)", placeholder: "500000", type: "number", required: true },
      { name: "loanTenor", label: "Loan Tenor (Months)", placeholder: "60", type: "number", required: true },
      { name: "interestRate", label: "Interest Rate (%)", placeholder: "8.5", type: "number", required: true },
    ],
  },
};

export default function Assistant() {
  const { user } = useAuth();
  const sessionId = useMemo(() => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }, []);
  const [lang, setLang] = useState("hi");
  const [customerTranscript, setCustomerTranscript] = useState("");
  const [customerInput, setCustomerInput] = useState("");
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
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [selectedRequiredDoc, setSelectedRequiredDoc] = useState("");
  const mediaRef = useRef(null);

  function addHistory(speaker, text) {
    setHistory(h => [...h, { speaker, text, language: lang }]);
  }

  function getRequiredDocuments(intentName) {
    return REQUIRED_DOCUMENTS_BY_INTENT[intentName] || [];
  }

  function initializeDocumentWorkflow(intentName) {
    const docs = getRequiredDocuments(intentName);
    setRequiredDocuments(docs);
    setDocumentStatuses(docs.reduce((acc, doc) => ({ ...acc, [doc.id]: "Pending" }), {}));
    setSelectedRequiredDoc(docs[0]?.id || "");
  }

  function handleRequiredDocumentSelect(documentId) {
    setSelectedRequiredDoc(documentId);
    setDocumentStatuses(prev => ({
      ...prev,
      [documentId]: prev[documentId] === "Stored" ? "Stored" : "Verified",
    }));
  }

  function handleDocumentUpload(documentId) {
    if (!documentId) return;
    setDocumentStatuses(prev => ({ ...prev, [documentId]: "Stored" }));
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
      let tr = await translateText({ text: stt.transcript, source_language: lang, target_language: "en" });
      setEnglishText(tr.translated_text);
      setLoadingMsg("Detecting intent...");
      const intent = await detectIntent({ text: tr.translated_text, session_id: sessionId });
      setIntentResult(intent);
      initializeDocumentWorkflow(intent.intent);
      // Re-translate with intent for context-specific preprocessing if banking intent
      if (intent.intent && ['account_opening', 'loan_enquiry', 'kyc_update'].includes(intent.intent)) {
        tr = await translateText({ text: stt.transcript, source_language: lang, target_language: "en", intent: intent.intent });
        setEnglishText(tr.translated_text);
      }
      // Store detected terms for transparency
      if (tr.detected_terms && tr.detected_terms.length > 0) {
        setIntentResult(prev => ({ ...prev, detected_banking_terms: tr.detected_terms }));
      }
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

  async function processCustomerTextInput() {
    setError(""); setLoading(true); setLoadingMsg("Processing written input...");
    try {
      const text = customerInput.trim();
      if (!text) throw new Error("Please enter a written customer message.");
      setCustomerTranscript(text);
      addHistory("Customer", text);
      setLoadingMsg("Translating to English...");
      const tr = await translateText({ text, source_language: lang, target_language: "en" });
      const translated = tr.translated_text || tr.text || text;
      setEnglishText(translated);
      setLoadingMsg("Detecting intent...");
      const intent = await detectIntent({ text: translated, session_id: sessionId });
      setIntentResult(intent);
      initializeDocumentWorkflow(intent.intent);
      if (intent.intent && ['account_opening', 'loan_enquiry', 'kyc_update'].includes(intent.intent)) {
        const tr2 = await translateText({ text, source_language: lang, target_language: "en", intent: intent.intent });
        setEnglishText(tr2.translated_text || tr2.text || translated);
      }
      if (tr.detected_terms && tr.detected_terms.length > 0) {
        setIntentResult(prev => ({ ...prev, detected_banking_terms: tr.detected_terms }));
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  async function handleGenerate() {
    setError("");
    setLoading(true);
    setLoadingMsg("Generating AI response...");
    try {
      if (!englishText && customerInput.trim()) {
        await processCustomerTextInput();
      }
      if (!englishText && !customerTranscript) {
        throw new Error("Please provide or process customer input before generating a response.");
      }
      const res = await generateResponse({
        customer_text_english: englishText || customerTranscript,
        intent: intentResult?.intent || "general_bank_query",
        response_language: lang,
        staff_reply_text: staffReply,
      });
      setStaffAssist(res.staff_assist_english);
      setCustomerFacing(res.customer_facing_text);
      addHistory("Staff", res.customer_facing_text);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  async function handleSpeak() {
    const rawText = customerFacing?.trim() || staffReply?.trim();
    if (!rawText) return;

    setError("");
    setLoading(true);
    setLoadingMsg("Generating audio...");

    try {
      const textToSpeak = customerFacing?.trim()
        ? customerFacing.trim()
        : (await translateText({ text: rawText, source_language: "en", target_language: lang })).translated_text;

      const blob = await textToSpeech({ text: textToSpeak, languageCode: lang, sessionId });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  const requiredDocsWithStatus = requiredDocuments.map(doc => ({
    ...doc,
    status: documentStatuses[doc.id] || "Pending",
  }));

  function getEligibilityResult(intentName) {
    const results = {
      fixed_deposit_enquiry: "Eligible for Fixed Deposit pending KYC and minimum deposit.",
      loan_enquiry: "Eligibility depends on income proof and credit history; submit salary slip and bank statement.",
      account_opening: "Eligible for account opening once Aadhaar/PAN is verified.",
      kyc_update: "KYC update can proceed with Aadhaar and PAN documents.",
      emi_enquiry: "EMI eligibility requires income proof and stable employment.",
      fund_transfer_enquiry: "Fund transfer is available once identity and beneficiary details are verified.",
    };
    return results[intentName] || "Eligibility evaluation pending based on customer details.";
  }

  function getNextAction(intentName) {
    const actions = {
      fixed_deposit_enquiry: "Collect required documents and process the fixed deposit application.",
      loan_enquiry: "Capture loan amount, verify income documents, and check EMI eligibility.",
      account_opening: "Verify customer identity and complete account opening forms.",
      kyc_update: "Collect updated KYC documents and submit them for verification.",
      emi_enquiry: "Confirm loan details and compute EMI schedule.",
      fund_transfer_enquiry: "Verify beneficiary details and complete the transfer request.",
    };
    return actions[intentName] || "Follow up with the customer to complete the next required steps.";
  }

  async function handleSummary() {
    setError(""); setLoading(true); setLoadingMsg("Generating summary...");
    try {
      const res = await generateSummary({
        conversation_history: history.length > 0 ? history : [{ speaker: "customer", text: customerTranscript }],
        customer_language: lang,
        session_id: sessionId,
        staff_id: user?.user_id || "",
        branch_id: user?.branch_id || "",
        intent: intentResult?.intent || "general_bank_query",
        confidence: intentResult?.confidence || 0,
        customer_transcript: customerTranscript,
        english_transcript: englishText,
        staff_response: staffReply,
        customer_response: customerFacing,
        required_documents: requiredDocuments,
        document_statuses: documentStatuses,
        eligibility_result: getEligibilityResult(intentResult?.intent),
        next_action: getNextAction(intentResult?.intent),
      });
      setSummary({
        ...res,
        required_documents: requiredDocuments.map(doc => ({
          ...doc,
          status: documentStatuses[doc.id] || "Pending",
        })),
      });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); setLoadingMsg(""); }
  }

  function handleReset() {
    setCustomerTranscript(""); setEnglishText(""); setIntentResult(null);
    setStaffReply(""); setStaffAssist(""); setCustomerFacing(""); setSummary(null);
    setHistory([]); setError("");
    setRequiredDocuments([]); setDocumentStatuses({}); setSelectedRequiredDoc("");
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

      <div style={styles.section}>
        <label style={styles.replyLabel}>Customer Written Input</label>
        <textarea
          style={styles.textarea}
          value={customerInput}
          onChange={e => setCustomerInput(e.target.value)}
          placeholder="Type the customer's message here..."
          rows={3}
        />
        <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            onClick={processCustomerTextInput}
            disabled={loading || !customerInput.trim()}
          >
            ✍️ Process Written Input
          </button>
        </div>
      </div>

      <div style={styles.grid2}>
        <TranscriptCard title="Customer Transcript" content={customerTranscript} language={lang.toUpperCase()} accent />
        <TranscriptCard title="Translated (English)" content={englishText} language="EN" />
      </div>

      {intentResult && (
        <div style={styles.section}>
          <IntentCard intentResult={intentResult} />
        </div>
      )}

      {intentResult && (
        <div style={styles.section}>
          <EligibilityChecker intent={intentResult.intent} intentResult={intentResult} />
        </div>
      )}

      {intentResult && (
        <div style={styles.section}>
          <NextStepGuide 
            requiredDocuments={requiredDocuments}
            documentStatuses={documentStatuses}
            intent={intentResult.intent}
            customerTranscript={customerTranscript}
          />
        </div>
      )}

      {intentResult?.workflow_steps?.length > 0 && (
        <div style={styles.section}>
          <WorkflowCard steps={intentResult.workflow_steps} documents={requiredDocsWithStatus} />
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
          <button
            style={styles.actionBtn}
            onClick={handleGenerate}
            disabled={loading || !(englishText || customerInput.trim() || customerTranscript)}
          >
            🤖 Generate AI Response
          </button>
          <button
            style={{ ...styles.actionBtn, ...styles.speakBtn }}
            onClick={handleSpeak}
            disabled={loading || !(staffReply.trim() || customerFacing.trim())}
          >
            🔊 Speak to Customer
          </button>
          <button
            style={{ ...styles.actionBtn, ...styles.summaryBtn }}
            onClick={handleSummary}
            disabled={loading || !(history.length > 0 || customerTranscript.trim() || staffReply.trim() || customerFacing.trim())}
          >
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

      {summary && <div style={styles.section}><SummaryCard summary={summary} language={lang} requiredDocuments={requiredDocsWithStatus} /></div>}
      
      {requiredDocuments.length > 0 && (
        <div style={styles.section}>
          <MissingDocumentsDetector requiredDocuments={requiredDocuments} documentStatuses={documentStatuses} intent={intentResult?.intent} />
        </div>
      )}
      
      <DocumentVerification
        requiredDocs={requiredDocuments}
        selectedDoc={selectedRequiredDoc}
        documentStatuses={documentStatuses}
        intent={intentResult?.intent}
        onSelectDocument={handleRequiredDocumentSelect}
        onDocumentUpload={handleDocumentUpload}
      />
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
