
import { useState, useEffect } from "react";
import { processDocumentOCR } from "../services/ocrService";

// Document field requirements by document type and intent
const DOCUMENT_FIELDS = {
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
      { name: "salarySlip", label: "Recent Salary Slip", placeholder: "Month/Year", type: "text", required: true },
      { name: "monthlyIncome", label: "Monthly Income", placeholder: "50000", type: "number", required: true },
      { name: "employer", label: "Employer Name", placeholder: "Company Name", type: "text", required: true },
      { name: "employment_type", label: "Employment Type", placeholder: "Salaried/Self-employed", type: "text", required: true },
    ],
    emi_enquiry: [
      { name: "monthlyIncome", label: "Monthly Income", placeholder: "50000", type: "number", required: true },
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
      { name: "depositAmount", label: "Deposit Amount", placeholder: "100000", type: "number", required: true },
      { name: "tenor", label: "Tenor (Days/Years)", placeholder: "180 days / 1 year", type: "text", required: true },
    ],
  },
  loan_agreement: {
    emi_enquiry: [
      { name: "loanAmount", label: "Loan Amount", placeholder: "500000", type: "number", required: true },
      { name: "loanTenor", label: "Loan Tenor (Months)", placeholder: "60", type: "number", required: true },
      { name: "interestRate", label: "Interest Rate (%)", placeholder: "8.5", type: "number", required: true },
    ],
  },
  nominee: {
    fixed_deposit_enquiry: [
      { name: "nomineeName", label: "Nominee Full Name", placeholder: "Jane Doe", type: "text", required: true },
      { name: "nomineeRelation", label: "Relationship with Nominee", placeholder: "Spouse/Child/Parent", type: "text", required: true },
      { name: "nomineeDob", label: "Nominee Date of Birth", placeholder: "YYYY-MM-DD", type: "date", required: true },
      { name: "nomineeAddress", label: "Nominee Address", placeholder: "123 Main St, City", type: "text", required: true },
    ],
  },
  signature: {
    fixed_deposit_enquiry: [
      { name: "signatureType", label: "Signature Type", placeholder: "Digital/Physical", type: "text", required: true },
    ],
    account_opening: [
      { name: "signatureType", label: "Signature Type", placeholder: "Digital/Physical", type: "text", required: true },
    ],
  },
  account_number: {
    fixed_deposit_enquiry: [
      { name: "accountNumber", label: "Account Number", placeholder: "123456789012", type: "text", required: true },
      { name: "ifscCode", label: "IFSC Code", placeholder: "SBIN0001234", type: "text", required: true },
      { name: "bankName", label: "Bank Name", placeholder: "State Bank of India", type: "text", required: true },
    ],
  },
  bank_statement: {
    loan_enquiry: [
      { name: "statementPeriod", label: "Statement Period", placeholder: "Last 6 months", type: "text", required: true },
      { name: "averageBalance", label: "Average Monthly Balance", placeholder: "50000", type: "number", required: true },
      { name: "accountType", label: "Account Type", placeholder: "Savings/Current", type: "text", required: true },
    ],
  },
  employment_id: {
    loan_enquiry: [
      { name: "employeeId", label: "Employee ID", placeholder: "EMP001234", type: "text", required: true },
      { name: "joiningDate", label: "Date of Joining", placeholder: "YYYY-MM-DD", type: "date", required: true },
      { name: "designation", label: "Designation", placeholder: "Software Engineer", type: "text", required: true },
      { name: "department", label: "Department", placeholder: "IT Department", type: "text", required: true },
    ],
  },
  mobile_number: {
    account_opening: [
      { name: "mobileNumber", label: "Mobile Number", placeholder: "9876543210", type: "tel", required: true },
      { name: "alternateMobile", label: "Alternate Mobile Number", placeholder: "9876543211", type: "tel", required: false },
    ],
  },
};

// Document types required for each banking intent
const INTENT_DOCUMENT_MAPPING = {
  fixed_deposit_enquiry: ["aadhaar", "pan", "photo", "deposit_slip", "nominee", "signature", "account_number"],
  loan_enquiry: ["aadhaar", "pan", "income_proof", "bank_statement", "employment_id"],
  account_opening: ["aadhaar", "pan", "photo", "signature", "mobile_number", "address_proof"],
  // Fallback for other intents
  kyc_update: ["aadhaar", "pan"],
  emi_enquiry: ["aadhaar", "pan", "income_proof", "bank_statement"],
};

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
  {
    value: "photo",
    label: "Photo",
    description: "Use this for photo identification and verification.",
    fields: [
      { name: "photoType", label: "Photo Type", placeholder: "Passport/ID Photo", type: "text" },
    ],
  },
  {
    value: "deposit_slip",
    label: "Deposit Slip",
    description: "Use this for fixed deposit transaction details.",
    fields: [
      { name: "depositAmount", label: "Deposit Amount", placeholder: "100000", type: "number" },
      { name: "tenor", label: "Tenor (Days/Years)", placeholder: "180 days / 1 year", type: "text" },
    ],
  },
  {
    value: "nominee",
    label: "Nominee Details",
    description: "Use this for nominee information in fixed deposits.",
    fields: [
      { name: "nomineeName", label: "Nominee Full Name", placeholder: "Jane Doe", type: "text" },
      { name: "nomineeRelation", label: "Relationship with Nominee", placeholder: "Spouse/Child/Parent", type: "text" },
      { name: "nomineeDob", label: "Nominee Date of Birth", placeholder: "YYYY-MM-DD", type: "date" },
      { name: "nomineeAddress", label: "Nominee Address", placeholder: "123 Main St, City", type: "text" },
    ],
  },
  {
    value: "signature",
    label: "Signature",
    description: "Use this for signature verification.",
    fields: [
      { name: "signatureType", label: "Signature Type", placeholder: "Digital/Physical", type: "text" },
    ],
  },
  {
    value: "account_number",
    label: "Account Number",
    description: "Use this for bank account verification.",
    fields: [
      { name: "accountNumber", label: "Account Number", placeholder: "123456789012", type: "text" },
      { name: "ifscCode", label: "IFSC Code", placeholder: "SBIN0001234", type: "text" },
      { name: "bankName", label: "Bank Name", placeholder: "State Bank of India", type: "text" },
    ],
  },
  {
    value: "income_proof",
    label: "Income Proof",
    description: "Use this for salary and income verification.",
    fields: [
      { name: "salarySlip", label: "Recent Salary Slip", placeholder: "Month/Year", type: "text" },
      { name: "monthlyIncome", label: "Monthly Income", placeholder: "50000", type: "number" },
      { name: "employer", label: "Employer Name", placeholder: "Company Name", type: "text" },
      { name: "employment_type", label: "Employment Type", placeholder: "Salaried/Self-employed", type: "text" },
    ],
  },
  {
    value: "bank_statement",
    label: "Bank Statement",
    description: "Use this for account transaction history.",
    fields: [
      { name: "statementPeriod", label: "Statement Period", placeholder: "Last 6 months", type: "text" },
      { name: "averageBalance", label: "Average Monthly Balance", placeholder: "50000", type: "number" },
      { name: "accountType", label: "Account Type", placeholder: "Savings/Current", type: "text" },
    ],
  },
  {
    value: "employment_id",
    label: "Employment ID",
    description: "Use this for employment verification.",
    fields: [
      { name: "employeeId", label: "Employee ID", placeholder: "EMP001234", type: "text" },
      { name: "joiningDate", label: "Date of Joining", placeholder: "YYYY-MM-DD", type: "date" },
      { name: "designation", label: "Designation", placeholder: "Software Engineer", type: "text" },
      { name: "department", label: "Department", placeholder: "IT Department", type: "text" },
    ],
  },
  {
    value: "mobile_number",
    label: "Mobile Number",
    description: "Use this for contact verification.",
    fields: [
      { name: "mobileNumber", label: "Mobile Number", placeholder: "9876543210", type: "tel" },
      { name: "alternateMobile", label: "Alternate Mobile Number", placeholder: "9876543211", type: "tel" },
    ],
  },
  {
    value: "address_proof",
    label: "Address Proof",
    description: "Use this for address verification.",
    fields: [
      { name: "address", label: "Current Address", placeholder: "123 Main St, City", type: "text" },
      { name: "proofType", label: "Proof Type", placeholder: "Electricity Bill/Rental Agreement", type: "text" },
    ],
  },
];

async function sha256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function DocumentVerification({ requiredDocs = [], selectedDoc = "", documentStatuses = {}, intent = "", onSelectDocument, onDocumentUpload }) {
  const [documentType, setDocumentType] = useState(selectedDoc || "");
  const [details, setDetails] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [ocrProcessing, setOcrProcessing] = useState(false);

  useEffect(() => {
    if (selectedDoc) {
      setDocumentType(selectedDoc);
    }
  }, [selectedDoc]);

  // Get filtered document types based on intent
  const getFilteredDocumentTypes = () => {
    if (!intent || !INTENT_DOCUMENT_MAPPING[intent]) {
      return DOCUMENT_TYPES; // Show all if no intent or unknown intent
    }
    const requiredDocTypes = INTENT_DOCUMENT_MAPPING[intent];
    return DOCUMENT_TYPES.filter(doc => requiredDocTypes.includes(doc.value));
  };

  const docsList = requiredDocs.length > 0 ? requiredDocs : getFilteredDocumentTypes();
  const activeDocument = docsList.find(doc => doc.id === documentType || doc.value === documentType);
  const displayStatus = documentStatuses[documentType] || "Pending";

  // Get fields for the selected document type and intent
  const getDocumentFields = () => {
    if (!documentType || !intent) return [];
    const docFields = DOCUMENT_FIELDS[documentType]?.[intent];
    return docFields || [];
  };

  const documentFields = getDocumentFields();

  function handleDetailChange(field, value) {
    setDetails(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }));
    }
  }

  // Validate required fields
  const validateFields = () => {
    const errors = {};
    let hasErrors = false;

    documentFields.forEach(field => {
      if (field.required && (!details[field.name] || details[field.name].trim() === "")) {
        errors[field.name] = true;
        hasErrors = true;
      }
    });

    setFieldErrors(errors);
    return !hasErrors;
  };

  async function runOCR(file, docKey) {
    if (!file || !docKey) return;
    setOcrProcessing(true);
    setStatus("Reading document and extracting text...");

    try {
      const ocrData = await processDocumentOCR(file, docKey);
      if (ocrData && Object.keys(ocrData).length > 0) {
        Object.entries(ocrData).forEach(([key, value]) => {
          if (value) setDetails(prev => ({ ...prev, [key]: String(value) }));
        });
        setStatus("✓ Fields auto-filled from document");
        setFieldErrors({});
      } else {
        setStatus("⚠️ OCR did not find extractable fields. Please enter details manually.");
      }
    } catch (e) {
      console.error("OCR error:", e);
      setStatus("⚠️ OCR failed. Please enter details manually.");
    } finally {
      setOcrProcessing(false);
    }
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const docKey = documentType || selectedDoc;
    if (!docKey) {
      alert("Please choose a document type before uploading the scan.");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    const digest = await sha256(file);
    setHash(digest);
    setStatus("Document selected. Running OCR...");
    setFieldErrors({});

    if (docKey && onDocumentUpload) {
      onDocumentUpload(docKey);
    }

    await runOCR(file, docKey);
  }

  return (
    <div style={{ marginTop: 24, padding: 20, border: "1px solid #d9d9d9", borderRadius: 14, background: "#fff" }}>
      <h3 style={{ marginBottom: 16 }}>Document Verification</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Select required document</label>
        <select
          value={documentType}
          onChange={e => {
            const value = e.target.value;
            setDocumentType(value);
            setDetails({});
            setFileName("");
            setHash("");
            setStatus("");
            setFieldErrors({});
            if (onSelectDocument) onSelectDocument(value);
          }}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
        >
          <option value="">Choose document type</option>
          {docsList.map(doc => (
            <option key={doc.id || doc.value} value={doc.id || doc.value}>{doc.label}</option>
          ))}
        </select>
      </div>

      {activeDocument ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", color: "#475569" }}>
            {activeDocument.description || "Provide details for the selected document."}
          </p>
          {documentFields.length > 0 ? (
            <div style={{ display: "grid", gap: 14 }}>
              {documentFields.map(field => (
                <div key={field.name}>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    {field.label}
                    {field.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={details[field.name] || ""}
                    placeholder={field.placeholder}
                    onChange={e => handleDetailChange(field.name, e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: fieldErrors[field.name] ? "2px solid #ef4444" : "1px solid #cbd5e1",
                      fontSize: 14,
                      backgroundColor: fieldErrors[field.name] ? "#fef2f2" : "#fff"
                    }}
                  />
                  {fieldErrors[field.name] && (
                    <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                      This field is required
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 12, background: "#f8fafc", borderRadius: 10, fontSize: 13, color: "#475569" }}>
              This document is required for the current workflow. Upload the file to mark it verified and stored.
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "#64748b" }}>Please choose the document type required for the current workflow.</p>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Upload document scan</label>
        {documentFields.length > 0 && Object.values(fieldErrors).some(error => error) && (
          <div style={{ padding: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, marginBottom: 8 }}>
            <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
              ⚠️ Please fill in all required fields marked with * before uploading the document.
            </p>
          </div>
        )}
        <input type="file" accept="image/*,.pdf" onChange={handleFile} />
        {fileName && (
          <button
            onClick={async () => {
              if (!selectedFile) {
                alert("Please upload the document scan before running OCR.");
                return;
              }
              if (!documentType) {
                alert("Please select the document type before running OCR.");
                return;
              }

              setOcrProcessing(true);
              try {
                const ocrData = await processDocumentOCR(selectedFile, documentType);
                if (ocrData && Object.keys(ocrData).length > 0) {
                  Object.entries(ocrData).forEach(([key, value]) => {
                    if (value) setDetails(prev => ({ ...prev, [key]: String(value) }));
                  });
                  setStatus("✓ Fields auto-filled from document");
                  setFieldErrors({});
                } else {
                  setStatus("⚠️ OCR did not find extractable fields. Please enter details manually.");
                }
              } catch (e) {
                console.error("OCR error:", e);
                setStatus("⚠️ OCR failed. Please enter details manually.");
              } finally {
                setOcrProcessing(false);
              }
            }}
            disabled={ocrProcessing}
            style={{
              marginTop: 10, padding: "8px 16px", background: "#3b82f6",
              color: "#fff", border: "none", borderRadius: 6, fontSize: 12,
              cursor: ocrProcessing ? "not-allowed" : "pointer", opacity: ocrProcessing ? 0.6 : 1,
            }}
          >
            {ocrProcessing ? "📖 Reading document..." : "📖 Auto-fill from document"}
          </button>
        )}
      </div>

      {fileName && <p style={{ marginBottom: 8 }}><strong>File:</strong> {fileName}</p>}
      {hash && <p style={{ marginBottom: 8, wordBreak: "break-all" }}><strong>SHA-256:</strong> {hash}</p>}
      {documentType && <p style={{ marginBottom: 8 }}><strong>Status:</strong> {displayStatus}</p>}
      {status && <p style={{ margin: 0 }}>{status}</p>}
    </div>
  );
}
