BANKING_TERMS = {
    "KYC": "Know Your Customer – mandatory identity verification process",
    "NEFT": "National Electronic Funds Transfer",
    "RTGS": "Real Time Gross Settlement",
    "IMPS": "Immediate Payment Service",
    "NPA": "Non-Performing Asset",
    "EMI": "Equated Monthly Installment",
    "OD": "Overdraft facility",
    "FD": "Fixed Deposit",
    "RD": "Recurring Deposit",
    "CIBIL": "Credit Information Bureau India Limited – credit score provider",
    "savings account": "Savings Account – basic banking account for saving money with interest",
    "current account": "Current Account – business banking account for frequent transactions",
    "nominee": "Nominee – person designated to receive benefits in case of account holder's demise",
    "loan tenure": "Loan Tenure – duration of the loan repayment period",
    "PAN": "Permanent Account Number – tax identification number",
    "Aadhaar": "Aadhaar – unique identity number issued by UIDAI",
    "IFSC": "Indian Financial System Code – bank branch code",
    "MICR": "Magnetic Ink Character Recognition – code on cheque",
    "ECS": "Electronic Clearing Service – automated payment system",
    "Demat": "Dematerialized account – electronic form of securities",
    "P2P": "Person-to-Person – direct money transfer between individuals",
    "UPI": "Unified Payments Interface – instant payment system",
    "BHIM": "Bharat Interface for Money – UPI app",
    "GST": "Goods and Services Tax – indirect tax",
    "TDS": "Tax Deducted at Source – tax withholding",
    "TCS": "Tax Collected at Source – tax collection",
}

# Context-specific expansions based on intent
CONTEXT_SPECIFIC_GLOSSARY = {
    "account_opening": {
        "KYC": "Know Your Customer – identity verification required for account opening",
        "nominee": "Nominee – person to be added for account succession",
        "savings account": "Savings Account – ideal for personal savings with ATM access",
        "current account": "Current Account – suitable for business transactions",
    },
    "loan_enquiry": {
        "EMI": "Equated Monthly Installment – monthly loan repayment amount",
        "loan tenure": "Loan Tenure – repayment period (typically 1-30 years)",
        "CIBIL": "CIBIL Score – credit score required for loan approval",
    },
    "kyc_update": {
        "KYC": "Know Your Customer – update your identity documents",
        "PAN": "Permanent Account Number – required for KYC update",
        "Aadhaar": "Aadhaar – primary identity document for KYC",
    },
}

def detect_terms(text: str) -> list:
    """Detect banking terms in the text."""
    detected = []
    text_lower = text.lower()
    for term in BANKING_TERMS.keys():
        if term.lower() in text_lower:
            detected.append(term)
    return detected

def expand_term(term: str, intent: str = None) -> str:
    """Expand a banking term with context-specific explanation if available."""
    if intent and intent in CONTEXT_SPECIFIC_GLOSSARY and term in CONTEXT_SPECIFIC_GLOSSARY[intent]:
        return CONTEXT_SPECIFIC_GLOSSARY[intent][term]
    return BANKING_TERMS.get(term.upper(), term)

def preprocess_text(text: str, intent: str = None) -> tuple:
    """Preprocess text by expanding banking terms and return processed text and detected terms."""
    detected_terms = detect_terms(text)
    processed_text = text
    for term in detected_terms:
        expansion = expand_term(term, intent)
        # Replace term with expanded form for better translation context
        processed_text = processed_text.replace(term, f"{term} ({expansion})")
    return processed_text, detected_terms

def get_term(term: str) -> str:
    return BANKING_TERMS.get(term.upper(), "Term not found in banking glossary.")
