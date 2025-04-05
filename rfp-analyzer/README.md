# RFP Analysis Suite

A comprehensive tool for analyzing Request for Proposal (RFP) documents using a multi-agent AI system.

## Features

- **Document Processing**: Extract and structure data from PDF and DOCX files
- **Deal-Breaker Identification**: Early detection of critical requirements that could disqualify your bid
- **Mandatory Criteria Extraction**: Clear summary of must-have qualifications and requirements
- **Eligibility Analysis**: Determine if your company meets the RFP requirements
- **Legal Risk Assessment**: Identify potential legal issues in the RFP
- **Submission Requirements**: Analyze timeline and checklist for proposal submission
- **Competitive Analysis**: Evaluate win probability and develop bid strategies
- **Interactive QA**: Ask specific questions about the RFP

## Setup Instructions

### 1. Create a virtual environment (recommended)

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the application

```bash
streamlit run app_enhanced.py
```

## Using the Application

1. Upload your company data document (PDF/DOCX)
2. Upload the RFP document you want to analyze (PDF/DOCX)
3. Click "Run Comprehensive Analysis"
4. Check the "Deal-Breakers" tab first to identify any critical issues
5. Review mandatory criteria to ensure your company qualifies
6. Navigate through other tabs to view detailed analyses
7. Use the "Ask RFP Agent" tab to ask specific questions

## Model Information

This application uses TinyLlama, a fully open-source language model. It's a smaller, more efficient model that can run on most modern hardware. The model has been optimized for conversational AI and provides reliable answers based on the RFP data you provide.

## Performance Notes

- This application uses Hugging Face Transformers with 4-bit quantization when a GPU is available
- For best performance, a CUDA-compatible GPU is recommended
- First-time model loading may take a few minutes
- CPU-only operation will be slower but still functional

## System Requirements

- Python 3.8+
- 6GB+ RAM (8GB recommended for optimal performance)
- CUDA-compatible GPU recommended but not required
- 2GB+ disk space for models and application

## Troubleshooting

- If you encounter CUDA out-of-memory errors:
  - Restart the application
  - Close other GPU-intensive applications
  - Try reducing `max_new_tokens` in the code
- For any other issues, check the console for detailed error messages
