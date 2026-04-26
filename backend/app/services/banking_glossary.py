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
}

def get_term(term: str) -> str:
    return BANKING_TERMS.get(term.upper(), "Term not found in banking glossary.")
