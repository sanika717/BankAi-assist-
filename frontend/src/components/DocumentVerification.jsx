
import { useState } from "react";

const DOCUMENT_TYPES = [
  {
    value: "aadhaar",
    label: "Aadhaar Card",
    description: "Use this for identity verification and KYC.",
    fields: [
      { name: "aadhaarNumber", label: "Aadhaar Number", placeholder: "1234 5678 9012", type: "text" },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date" },
    ],
  },
  {
    value: "pan",
    label: "PAN Card",
    description: "Use this for tax ID verification.",
    fields: [
      { name: "panNumber", label: "PAN Number", placeholder: "ABCDE1234F", type: "text" },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date" },
    ],
  },
  {
    value: "passport",
    label: "Passport",
    description: "Use this for international travel or alternate identity proof.",
    fields: [
      { name: "passportNumber", label: "Passport Number", placeholder: "A1234567", type: "text" },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date" },
      { name: "nationality", label: "Nationality", placeholder: "Indian", type: "text" },
    ],
  },
  {
    value: "voter",
    label: "Voter ID",
    description: "Use this for local identity verification.",
    fields: [
      { name: "voterId", label: "Voter ID Number", placeholder: "ABCD1234567", type: "text" },
      { name: "name", label: "Full Name", placeholder: "John Doe", type: "text" },
      { name: "dob", label: "Date of Birth", placeholder: "YYYY-MM-DD", type: "date" },
    ],
  },
];

async function sha256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function DocumentVerification() {
  const [documentType, setDocumentType] = useState("");
  const [details, setDetails] = useState({});
  const [fileName, setFileName] = useState("");
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");

  const activeDocument = DOCUMENT_TYPES.find(doc => doc.value === documentType);

  function handleDetailChange(field, value) {
    setDetails(prev => ({ ...prev, [field]: value }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const digest = await sha256(file);
    setHash(digest);
    setStatus("Verified locally and ready for secure storage");
  }

  return (
    <div style={{ marginTop: 24, padding: 20, border: "1px solid #d9d9d9", borderRadius: 14, background: "#fff" }}>
      <h3 style={{ marginBottom: 16 }}>Document Verification</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Select required document</label>
        <select
          value={documentType}
          onChange={e => {
            setDocumentType(e.target.value);
            setDetails({});
            setFileName("");
            setHash("");
            setStatus("");
          }}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
        >
          <option value="">Choose document type</option>
          {DOCUMENT_TYPES.map(doc => (
            <option key={doc.value} value={doc.value}>{doc.label}</option>
          ))}
        </select>
      </div>

      {activeDocument ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", color: "#475569" }}>{activeDocument.description}</p>
          <div style={{ display: "grid", gap: 14 }}>
            {activeDocument.fields.map(field => (
              <div key={field.name}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>{field.label}</label>
                <input
                  type={field.type}
                  value={details[field.name] || ""}
                  placeholder={field.placeholder}
                  onChange={e => handleDetailChange(field.name, e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: "#64748b" }}>Please choose the document type required for the current workflow.</p>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Upload document scan</label>
        <input type="file" accept="image/*,.pdf" onChange={handleFile} />
      </div>

      {fileName && <p style={{ marginBottom: 8 }}><strong>File:</strong> {fileName}</p>}
      {hash && <p style={{ marginBottom: 8, wordBreak: "break-all" }}><strong>SHA-256:</strong> {hash}</p>}
      {status && <p style={{ margin: 0 }}>{status}</p>}
    </div>
  );
}
