import os
import pdfplumber
import docx
import json
import re

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(docx_path):
    """Extract text from a DOCX file."""
    doc = docx.Document(docx_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def process_company_data(text):
    """Extract and structure company data from text."""
    # This is a simplified example - you would need to develop more sophisticated
    # extraction logic based on your company data format
    data = {
        "certifications": [],
        "experience": [],
        "capabilities": [],
        "registration": []
    }
    
    # Example extraction patterns (will need customization based on your data format)
    cert_pattern = r"Certification[s]?:?\s*(.*?)(?:\n|$)"
    exp_pattern = r"Experience:?\s*(.*?)(?:\n|$)"
    
    cert_matches = re.findall(cert_pattern, text, re.IGNORECASE)
    for match in cert_matches:
        if match.strip():
            data["certifications"].append(match.strip())
    
    exp_matches = re.findall(exp_pattern, text, re.IGNORECASE)
    for match in exp_matches:
        if match.strip():
            data["experience"].append(match.strip())
    
    return data

def process_rfp(text):
    """Extract and structure RFP data from text."""
    # This is a simplified example - you would need more sophisticated extraction
    data = {
        "eligibility_criteria": [],
        "submission_requirements": [],
        "legal_clauses": []
    }
    
    # Example extraction patterns
    elig_patterns = [
        r"Eligibility(?:\s+criteria)?:?\s*(.*?)(?:\n|$)",
        r"Qualifications:?\s*(.*?)(?:\n|$)",
        r"Must have:?\s*(.*?)(?:\n|$)"
    ]
    
    for pattern in elig_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if match.strip():
                data["eligibility_criteria"].append(match.strip())
    
    return data

def save_processed_data(data, output_path):
    """Save processed data to JSON."""
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)