import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer, util

class DocumentProcessor:
    """Enhanced document processor with structure awareness"""
    
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
    
    def split_into_sections(self, text):
        """Split document into logical sections based on headings"""
        # Simple section detection based on common RFP section headers
        section_headers = [
            "eligibility criteria", "submission requirements", 
            "evaluation criteria", "scope of work", "legal terms",
            "timeline", "qualifications", "technical requirements",
            "pricing", "proposal format", "contractual obligations"
        ]
        
        lines = text.split('\n')
        current_section = "introduction"
        sections = {current_section: []}
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if this line might be a section header
            is_header = False
            matched_header = None
            
            for header in section_headers:
                if header in line_lower and (len(line_lower) < 100):  # Avoid matching in long paragraphs
                    is_header = True
                    matched_header = header
                    break
            
            if is_header and matched_header:
                current_section = matched_header
                sections[current_section] = []
            else:
                sections[current_section].append(line)
        
        # Convert lists of lines back to text blocks
        for section in sections:
            sections[section] = '\n'.join(sections[section])
            
        return sections
    
    def detect_tables(self, text):
        """Basic detection of tabular data in text"""
        # Simple heuristic: look for patterns that suggest tables
        lines = text.split('\n')
        table_start_indices = []
        table_end_indices = []
        
        in_table = False
        for i, line in enumerate(lines):
            # Check for lines with multiple delimiters suggesting table structure
            delimiter_count = sum(line.count(delim) for delim in ['|', '\t', '  '])
            
            if not in_table and delimiter_count >= 3:
                in_table = True
                table_start_indices.append(i)
            elif in_table and delimiter_count < 3:
                in_table = False
                table_end_indices.append(i)
        
        # Handle case where document ends while still in a table
        if in_table:
            table_end_indices.append(len(lines))
            
        # Extract table content
        tables = []
        for start, end in zip(table_start_indices, table_end_indices):
            tables.append('\n'.join(lines[start:end]))
            
        return tables

def split_documents(text, chunk_size=1000, chunk_overlap=200):
    """Split text into chunks for processing."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    return text_splitter.split_text(text)

def prepare_documents_for_embedding(company_data_path, rfp_paths):
    """Prepare documents for embedding with enhanced metadata."""
    documents = []
    
    # Process company data
    if os.path.exists(company_data_path):
        with open(company_data_path, 'r') as f:
            company_data = json.load(f)
            
        # Convert JSON to text chunks with detailed metadata
        for category, items in company_data.items():
            if isinstance(items, list):
                for i, item in enumerate(items):
                    documents.append({
                        "text": f"{category}: {item}",
                        "metadata": {
                            "source": "company_data", 
                            "category": category,
                            "index": i,
                            "doc_type": "company_profile"
                        }
                    })
            else:
                documents.append({
                    "text": f"{category}: {items}",
                    "metadata": {
                        "source": "company_data", 
                        "category": category,
                        "doc_type": "company_profile"
                    }
                })
    
    # Process RFP documents
    for rfp_path in rfp_paths:
        if os.path.exists(rfp_path):
            with open(rfp_path, 'r') as f:
                rfp_data = json.load(f)
            
            # Add document processor to better understand document structure
            doc_processor = DocumentProcessor()
            
            for category, items in rfp_data.items():
                if isinstance(items, list):
                    for i, item in enumerate(items):
                        # Analyze the content to add more metadata
                        section_type = classify_section_type(category)
                        
                        documents.append({
                            "text": f"{category}: {item}",
                            "metadata": {
                                "source": os.path.basename(rfp_path), 
                                "category": category,
                                "index": i,
                                "section_type": section_type,
                                "doc_type": "rfp"
                            }
                        })
                else:
                    section_type = classify_section_type(category)
                    documents.append({
                        "text": f"{category}: {items}",
                        "metadata": {
                            "source": os.path.basename(rfp_path), 
                            "category": category,
                            "section_type": section_type,
                            "doc_type": "rfp"
                        }
                    })
    
    return documents

def classify_section_type(category_name):
    """Classify the type of section based on its name."""
    category_lower = category_name.lower()
    
    if any(term in category_lower for term in ['eligibility', 'qualification', 'requirement']):
        return 'eligibility'
    elif any(term in category_lower for term in ['legal', 'terms', 'condition', 'contract']):
        return 'legal'
    elif any(term in category_lower for term in ['submission', 'format', 'deadline']):
        return 'submission'
    elif any(term in category_lower for term in ['evaluation', 'scoring', 'criteria']):
        return 'evaluation'
    elif any(term in category_lower for term in ['scope', 'work', 'deliverable']):
        return 'scope'
    else:
        return 'general'

class EligibilityAgent:
    """Agent specialized in evaluating eligibility for RFPs"""
    
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
    
    def verify_eligibility(self, company_data, rfp_data):
        """Comprehensive eligibility verification with confidence scoring"""
        eligibility_results = {
            "eligible": True,
            "confidence_score": 0.0,
            "matches": [],
            "gaps": [],
            "partial_matches": [],
            "recommendations": []
        }
        
        # Get eligibility criteria from RFP
        criteria = rfp_data.get("eligibility_criteria", [])
        if not criteria:
            # Also check other potential keys that might contain eligibility info
            for key in rfp_data:
                if any(term in key.lower() for term in ["eligibility", "qualification", "requirement"]):
                    if isinstance(rfp_data[key], list):
                        criteria.extend(rfp_data[key])
                    else:
                        criteria.append(rfp_data[key])
        
        if not criteria:
            eligibility_results["notes"] = "No explicit eligibility criteria found in RFP"
            return eligibility_results
        
        # Prepare company capabilities from multiple fields
        company_capabilities = []
        for field in ["certifications", "experience", "expertise", "past_projects", "qualifications"]:
            if field in company_data and company_data[field]:
                if isinstance(company_data[field], list):
                    company_capabilities.extend(company_data[field])
                else:
                    company_capabilities.append(company_data[field])
        
        # Calculate matches using semantic similarity
        total_confidence = 0
        
        for criterion in criteria:
            # Encode the criterion
            criterion_embedding = self.model.encode(criterion, convert_to_tensor=True)
            
            # Find best matching capability
            best_match = None
            best_score = 0
            
            for capability in company_capabilities:
                capability_embedding = self.model.encode(capability, convert_to_tensor=True)
                score = util.pytorch_cos_sim(criterion_embedding, capability_embedding).item()
                
                if score > best_score:
                    best_score = score
                    best_match = capability
            
            # Determine if it's a match, partial match, or gap
            if best_score > 0.75:  # Strong match
                eligibility_results["matches"].append({
                    "criterion": criterion,
                    "match": best_match,
                    "confidence": best_score
                })
                total_confidence += best_score
            elif best_score > 0.5:  # Partial match
                eligibility_results["partial_matches"].append({
                    "criterion": criterion,
                    "partial_match": best_match,
                    "confidence": best_score
                })
                total_confidence += best_score * 0.5  # Count partial matches with half weight
            else:  # Gap - not eligible
                eligibility_results["gaps"].append(criterion)
                eligibility_results["eligible"] = False
                # Generate recommendation for this gap
                eligibility_results["recommendations"].append({
                    "gap": criterion,
                    "recommendation": f"Consider partnering with a firm that has: {criterion}"
                })
        
        # Calculate overall confidence score
        if criteria:
            eligibility_results["confidence_score"] = total_confidence / len(criteria)
        
        return eligibility_results

class LegalRiskAnalyzer:
    """Agent specialized in assessing legal risks in RFP documents"""
    
    def __init__(self):
        # Keywords associated with high-risk legal clauses
        self.high_risk_terms = [
            "indemnify", "indemnification", "hold harmless", "unlimited liability",
            "warranty", "guarantees", "intellectual property", "termination for convenience",
            "liquidated damages", "non-compete", "exclusivity", "penalty"
        ]
        
        # Keywords for moderate risk clauses
        self.moderate_risk_terms = [
            "liability", "limitation of liability", "confidentiality", "payment terms",
            "acceptance criteria", "change order", "force majeure", "governing law", 
            "dispute resolution", "arbitration"
        ]
    
    def analyze_legal_risks(self, rfp_data):
        """Analyze legal clauses for potential risks"""
        legal_analysis = {
            "overall_risk_score": 0.0,
            "high_risk_clauses": [],
            "moderate_risk_clauses": [],
            "low_risk_clauses": [],
            "recommendations": []
        }
        
        # Extract legal clauses from RFP data
        legal_clauses = []
        
        # Find legal terms in various parts of the RFP
        for key, value in rfp_data.items():
            if any(term in key.lower() for term in ["legal", "terms", "conditions", "contract", "clause"]):
                if isinstance(value, list):
                    legal_clauses.extend(value)
                else:
                    legal_clauses.append(value)
        
        # If no specific legal section, look through all content for legal language
        if not legal_clauses:
            for key, value in rfp_data.items():
                if isinstance(value, list):
                    for item in value:
                        if self._has_legal_language(item):
                            legal_clauses.append(item)
                elif isinstance(value, str) and self._has_legal_language(value):
                    legal_clauses.append(value)
        
        # Assess risk for each clause
        total_risk_score = 0
        for clause in legal_clauses:
            risk_score, risk_level, risk_explanation = self._assess_clause_risk(clause)
            
            clause_analysis = {
                "clause": clause,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "explanation": risk_explanation
            }
            
            # Add rewording suggestion for high-risk clauses
            if risk_level == "high":
                clause_analysis["suggested_rewording"] = self._suggest_rewording(clause, risk_explanation)
                legal_analysis["high_risk_clauses"].append(clause_analysis)
                legal_analysis["recommendations"].append({
                    "issue": risk_explanation,
                    "recommendation": f"Negotiate to modify or remove the clause: '{clause[:100]}...'"
                })
            elif risk_level == "moderate":
                legal_analysis["moderate_risk_clauses"].append(clause_analysis)
            else:
                legal_analysis["low_risk_clauses"].append(clause_analysis)
            
            total_risk_score += risk_score
        
        # Calculate overall risk score
        if legal_clauses:
            legal_analysis["overall_risk_score"] = total_risk_score / len(legal_clauses)
        
        # Generate overall risk assessment
        if legal_analysis["overall_risk_score"] > 0.7:
            legal_analysis["summary"] = "High legal risk. Consider legal counsel review before proceeding."
        elif legal_analysis["overall_risk_score"] > 0.4:
            legal_analysis["summary"] = "Moderate legal risk. Review high-risk clauses carefully."
        else:
            legal_analysis["summary"] = "Low legal risk. Standard terms and conditions."
        
        return legal_analysis
    
    def _has_legal_language(self, text):
        """Check if text contains legal language"""
        legal_indicators = [
            "shall", "must", "will", "agree", "terminate", "liability",
            "law", "claim", "party", "oblige", "obligate", "warrant"
        ]
        return any(term in text.lower() for term in legal_indicators)
    
    def _assess_clause_risk(self, clause):
        """Assess the risk level of a legal clause"""
        clause_lower = clause.lower()
        
        # Check for high-risk terms
        high_risk_matches = [term for term in self.high_risk_terms if term in clause_lower]
        if high_risk_matches:
            risk_score = 0.7 + (len(high_risk_matches) * 0.05)  # Increase score with more matches
            risk_score = min(risk_score, 1.0)  # Cap at 1.0
            explanation = f"High-risk terms detected: {', '.join(high_risk_matches)}"
            return risk_score, "high", explanation
        
        # Check for moderate-risk terms
        moderate_risk_matches = [term for term in self.moderate_risk_terms if term in clause_lower]
        if moderate_risk_matches:
            risk_score = 0.4 + (len(moderate_risk_matches) * 0.03)
            risk_score = min(risk_score, 0.69)  # Cap below high-risk threshold
            explanation = f"Moderate-risk terms detected: {', '.join(moderate_risk_matches)}"
            return risk_score, "moderate", explanation
        
        # Otherwise low risk
        return 0.2, "low", "No significant risk factors detected"
    
    def _suggest_rewording(self, clause, explanation):
        """Suggest alternative wording for high-risk clauses"""
        if "indemnify" in clause.lower() or "hold harmless" in clause.lower():
            return "Suggest limiting indemnification to third-party claims arising from negligence, with a cap on liability."
        
        if "unlimited liability" in clause.lower():
            return "Suggest adding liability cap to no more than contract value or insurance coverage."
        
        if "intellectual property" in clause.lower():
            return "Clarify IP ownership for deliverables while preserving rights to pre-existing IP."
        
        if "termination for convenience" in clause.lower():
            return "Request notice period and compensation for costs incurred upon termination."
        
        # Generic suggestion
        return "Consider negotiating more balanced language that limits exposure while meeting client requirements."

class SubmissionRequirementsAnalyzer:
    """Agent specialized in analyzing submission requirements"""
    
    def analyze_submission_requirements(self, rfp_data):
        """Extract and analyze submission requirements"""
        submission_analysis = {
            "requirements_checklist": [],
            "timeline": {},
            "format_specifications": [],
            "critical_path_items": [],
            "estimated_preparation_time": ""
        }
        
        # Extract submission requirements
        requirements = []
        for key, value in rfp_data.items():
            if any(term in key.lower() for term in ["submission", "format", "proposal", "respond"]):
                if isinstance(value, list):
                    requirements.extend(value)
                else:
                    requirements.append(value)
        
        # Extract deadlines and dates
        submission_date = None
        important_dates = []
        
        for key, value in rfp_data.items():
            if "deadline" in key.lower() or "due date" in key.lower() or "submission date" in key.lower():
                submission_date = self._extract_date(value)
            
            # Look for dates in text
            if isinstance(value, str):
                dates = self._extract_dates_from_text(value)
                if dates:
                    important_dates.extend(dates)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, str):
                        dates = self._extract_dates_from_text(item)
                        if dates:
                            important_dates.extend(dates)
        
        # Create checklist from requirements
        for req in requirements:
            # Determine if it's a critical item
            is_critical = any(term in req.lower() for term in [
                "must", "shall", "required", "mandatory", "essential"
            ])
            
            # Estimate effort
            effort = self._estimate_effort(req)
            
            submission_analysis["requirements_checklist"].append({
                "requirement": req,
                "critical": is_critical,
                "estimated_effort_days": effort
            })
            
            if is_critical:
                submission_analysis["critical_path_items"].append({
                    "item": req,
                    "lead_time": f"{effort} days"
                })
        
        # Set timeline
        if submission_date:
            submission_analysis["timeline"]["submission_deadline"] = submission_date
            
            # Calculate recommended preparation timeline
            total_effort = sum(item["estimated_effort_days"] for item in submission_analysis["requirements_checklist"])
            buffer_days = max(5, int(total_effort * 0.2))  # Add 20% buffer, minimum 5 days
            total_days_needed = total_effort + buffer_days
            
            submission_analysis["estimated_preparation_time"] = f"{total_days_needed} days"
            
            # Calculate recommended start date
            if self._is_date_string(submission_date):
                try:
                    deadline_date = datetime.strptime(submission_date, "%Y-%m-%d")
                    start_date = deadline_date - timedelta(days=total_days_needed)
                    submission_analysis["timeline"]["recommended_start_date"] = start_date.strftime("%Y-%m-%d")
                except:
                    # Handle case where date parsing fails
                    submission_analysis["timeline"]["recommended_start_date"] = f"{total_days_needed} days before deadline"
            else:
                submission_analysis["timeline"]["recommended_start_date"] = f"{total_days_needed} days before deadline"
        
        # Add format specifications
        for req in requirements:
            if any(term in req.lower() for term in ["format", "page", "margin", "font", "pdf", "electronic"]):
                submission_analysis["format_specifications"].append(req)
        
        return submission_analysis
    
    def _extract_date(self, text):
        """Extract a date from text - simple implementation for demo"""
        if isinstance(text, str):
            # Look for common date formats
            import re
            
            # ISO format: YYYY-MM-DD
            iso_matches = re.findall(r'\d{4}-\d{2}-\d{2}', text)
            if iso_matches:
                return iso_matches[0]
            
            # US format: MM/DD/YYYY
            us_matches = re.findall(r'\d{1,2}/\d{1,2}/\d{4}', text)
            if us_matches:
                parts = us_matches[0].split('/')
                return f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}"
            
            # Text format: Month DD, YYYY
            text_matches = re.findall(r'(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}', text)
            if text_matches:
                try:
                    date_obj = datetime.strptime(text_matches[0], "%B %d, %Y")
                    return date_obj.strftime("%Y-%m-%d")
                except:
                    try:
                        date_obj = datetime.strptime(text_matches[0], "%B %d %Y")
                        return date_obj.strftime("%Y-%m-%d")
                    except:
                        pass
        
        return text  # Return original if no date found
    
    def _extract_dates_from_text(self, text):
        """Extract all dates from a text"""
        import re
        
        dates = []
        
        # ISO format: YYYY-MM-DD
        iso_matches = re.findall(r'\d{4}-\d{2}-\d{2}', text)
        dates.extend(iso_matches)
        
        # US format: MM/DD/YYYY
        us_matches = re.findall(r'\d{1,2}/\d{1,2}/\d{4}', text)
        for match in us_matches:
            parts = match.split('/')
            dates.append(f"{parts[2]}-{parts[0].zfill(2)}-{parts[1].zfill(2)}")
        
        # Text format: Month DD, YYYY
        text_matches = re.findall(r'(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}', text)
        for match in text_matches:
            try:
                date_obj = datetime.strptime(match, "%B %d, %Y")
                dates.append(date_obj.strftime("%Y-%m-%d"))
            except:
                try:
                    date_obj = datetime.strptime(match, "%B %d %Y")
                    dates.append(date_obj.strftime("%Y-%m-%d"))
                except:
                    pass
        
        return dates
    
    def _is_date_string(self, text):
        """Check if a string is in a recognizable date format"""
        import re
        date_pattern = r'\d{4}-\d{2}-\d{2}'
        return bool(re.match(date_pattern, text))
    
    def _estimate_effort(self, requirement):
        """Estimate effort required for a requirement in days"""
        requirement_lower = requirement.lower()
        
        # High effort items
        if any(term in requirement_lower for term in [
            "security clearance", "certification", "compliance", "detailed technical", 
            "past performance", "demonstration", "prototype", "sample"
        ]):
            return 5
        
        # Medium effort items
        if any(term in requirement_lower for term in [
            "resume", "personnel", "experience", "approach", "methodology", 
            "implementation", "plan", "schedule"
        ]):
            return 3
        
        # Low effort items
        if any(term in requirement_lower for term in [
            "signed", "acknowledgment", "contact information", "references", 
            "form", "letter", "simple"
        ]):
            return 1
        
        # Default medium-low effort
        return 2

class CompetitiveAnalyzer:
    """Agent specialized in competitive analysis and win strategy development"""
    
    def analyze_competitive_position(self, company_data, rfp_data):
        """Analyze competitive position and develop win strategies"""
        competitive_analysis = {
            "win_probability": 0.0,
            "key_strengths": [],
            "key_weaknesses": [],
            "win_strategies": [],
            "differentiators": []
        }
        
        # Identify company strengths relative to RFP requirements
        strengths = []
        weaknesses = []
        
        # Check experience against requirements
        company_experience = company_data.get("experience", [])
        if not isinstance(company_experience, list):
            company_experience = [company_experience]
        
        # Extract relevant RFP sections
        relevant_sections = []
        for key, value in rfp_data.items():
            if any(term in key.lower() for term in [
                "eligibility", "evaluation", "qualification", "requirement", "scope"
            ]):
                if isinstance(value, list):
                    relevant_sections.extend(value)
                else:
                    relevant_sections.append(value)
        
        # Analyze experience match
        experience_matches = 0
        for section in relevant_sections:
            for exp in company_experience:
                if self._text_similarity(section, exp) > 0.4:  # Simple threshold
                    experience_matches += 1
                    break
        
        experience_match_ratio = experience_matches / len(relevant_sections) if relevant_sections else 0
        
        if experience_match_ratio > 0.7:
            strengths.append("Strong relevant experience matching RFP requirements")
        elif experience_match_ratio > 0.4:
            strengths.append("Some relevant experience for this opportunity")
        else:
            weaknesses.append("Limited experience matching specific RFP requirements")
        
        # Check certifications against possible requirements
        certifications = company_data.get("certifications", [])
        if not isinstance(certifications, list):
            certifications = [certifications]
        
        cert_keywords = []
        for cert in certifications:
            cert_keywords.extend(cert.lower().split())
        
        cert_matches = 0
        for section in relevant_sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in cert_keywords):
                cert_matches += 1
        
        if cert_matches > 0:
            strengths.append(f"Relevant certifications ({cert_matches} matches to RFP)")
        else:
            weaknesses.append("No specific certification matches found in RFP")
        
        # Past performance with similar clients
        past_clients = []
        if "past_projects" in company_data:
            past_projects = company_data["past_projects"]
            if isinstance(past_projects, list):
                for project in past_projects:
                    if "client" in project.lower():
                        past_clients.append(project)
        
        if past_clients:
            strengths.append(f"Past performance with {len(past_clients)} similar clients")
        else:
            weaknesses.append("Limited documented past performance with similar clients")
        
        # Calculate win probability based on strengths/weaknesses
        win_probability = 0.5  # Base
        win_probability += len(strengths) * 0.05
        win_probability -= len(weaknesses) * 0.05
        
        # Add expertise bonus
        expertise = company_data.get("expertise", [])
        if not isinstance(expertise, list):
            expertise = [expertise]
        
        expertise_match = 0
        for section in relevant_sections:
            for exp in expertise:
                if self._text_similarity(section, exp) > 0.5:
                    expertise_match += 1
                    break
        
        win_probability += expertise_match * 0.02
        
        # Cap probability between 0.1 and 0.9
        win_probability = max(0.1, min(0.9, win_probability))
        
        competitive_analysis["win_probability"] = round(win_probability, 2)
        competitive_analysis["key_strengths"] = strengths
        competitive_analysis["key_weaknesses"] = weaknesses
        
        # Generate win strategies
        for strength in strengths:
            strategy = self._generate_strategy_from_strength(strength)
            if strategy:
                competitive_analysis["win_strategies"].append(strategy)
        
        # Generate strategies to address weaknesses
        for weakness in weaknesses:
            strategy = self._generate_strategy_from_weakness(weakness)
            if strategy:
                competitive_analysis["win_strategies"].append(strategy)
        
        # Identify differentiators
        differentiators = []
        unique_expertise = company_data.get("unique_selling_points", [])
        if not isinstance(unique_expertise, list):
            unique_expertise = [unique_expertise]
        
        for expertise_item in unique_expertise:
            differentiators.append(expertise_item)
        
        # If no explicit USPs, derive from other fields
        if not differentiators:
            if certifications:
                differentiators.append(f"Specialized certifications: {', '.join(certifications[:3])}")
            
            if company_experience:
                years_exp = self._extract_years_experience(company_experience)
                if years_exp > 0:
                    differentiators.append(f"{years_exp}+ years of industry experience")
        
        competitive_analysis["differentiators"] = differentiators
        
        return competitive_analysis
    
    def _text_similarity(self, text1, text2):
        """Simple text similarity measure"""
        # Convert to sets of words for simple overlap calculation
        set1 = set(text1.lower().split())
        set2 = set(text2.lower().split())
        
        # Calculate Jaccard similarity
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0
    
    def _generate_strategy_from_strength(self, strength):
        """Generate win strategy from a strength"""
        if "experience" in strength.lower():
            return f"Emphasize {strength} with concrete examples and outcomes"
        
        if "certification" in strength.lower():
            return f"Highlight {strength} as competitive advantage and risk reducer"
        
        if "performance" in strength.lower():
            return f"Include detailed past performance metrics and client testimonials"
        
        return f"Showcase {strength} throughout the proposal"
    
    def _generate_strategy_from_weakness(self, weakness):
        """Generate win strategy to address a weakness"""
        if "experience" in weakness.lower():
            return "Partner with subcontractor to address experience gaps"
        
        if "certification" in weakness.lower():
            return "Emphasize equivalent capabilities and alternative qualifications"
        
        if "performance" in weakness.lower():
            return "Focus on similar performance in adjacent markets/clients"
        
        return f"Proactively address {weakness} with mitigation plan"
    
    def _extract_years_experience(self, experience_list):
        """Extract years of experience from text"""
        import re
        
        for exp in experience_list:
            # Look for patterns like "X years" or "X+ years"
            matches = re.findall(r'(\d+)[\+]?\s+years?', exp.lower())
            if matches:
                return int(matches[0])
        
        return 0

class RFPOrchestrator:
    """Main orchestrator that coordinates all specialized agents"""
    
    def __init__(self, embedding_model="all-MiniLM-L6-v2"):
        self.eligibility_agent = EligibilityAgent(model_name=embedding_model)
        self.legal_agent = LegalRiskAnalyzer()
        self.submission_agent = SubmissionRequirementsAnalyzer()
        self.competitive_agent = CompetitiveAnalyzer()
        self.document_processor = DocumentProcessor()
        self.compliance_checker = ComplianceChecker()
    
    def analyze_rfp(self, company_data, rfp_data):
        """Run comprehensive analysis using all agents"""
        results = {}
        
        # Analyze eligibility
        results["eligibility"] = self.eligibility_agent.verify_eligibility(company_data, rfp_data)
        
        # Analyze legal risks
        results["legal_risks"] = self.legal_agent.analyze_legal_risks(rfp_data)
        
        # Analyze submission requirements
        results["submission_requirements"] = self.submission_agent.analyze_submission_requirements(rfp_data)
        
        # Analyze competitive position
        results["competitive_position"] = self.competitive_agent.analyze_competitive_position(company_data, rfp_data)
        
        # Check compliance requirements
        results["compliance_checks"] = self.compliance_checker.check_compliance(company_data, rfp_data)
        
        # Extract document structure insights
        results["document_structure"] = self._analyze_document_structure(rfp_data)
        
        # Generate overall recommendation
        results["overall_recommendation"] = self._generate_overall_recommendation(results)
        
        return results
    
    def _analyze_document_structure(self, rfp_data):
        """Analyze the structure of the RFP document for insights"""
        structure_analysis = {
            "sections_identified": [],
            "section_complexity": {},
            "key_information_locations": {},
            "missing_sections": []
        }
        
        # Common RFP sections that should be present
        expected_sections = [
            "eligibility criteria", "submission requirements", "evaluation criteria",
            "scope of work", "timeline", "legal terms", "qualifications", 
            "technical requirements", "background", "contact information"
        ]
        
        # Identify sections present in the RFP
        found_sections = []
        for key in rfp_data.keys():
            key_lower = key.lower()
            
            # Check if this key corresponds to a standard section
            for section in expected_sections:
                if any(term in key_lower for term in section.split()):
                    found_sections.append(section)
                    structure_analysis["sections_identified"].append({
                        "section_name": section,
                        "rfp_key": key,
                        "content_length": self._get_content_length(rfp_data[key])
                    })
                    break
        
        # Identify missing sections
        for section in expected_sections:
            if section not in found_sections:
                structure_analysis["missing_sections"].append(section)
        
        # Analyze section complexity based on content length and structure
        for section in structure_analysis["sections_identified"]:
            key = section["rfp_key"]
            content = rfp_data[key]
            
            structure_analysis["section_complexity"][key] = {
                "length_score": min(10, section["content_length"] / 100),  # Scale 0-10
                "complexity_score": self._estimate_text_complexity(content),
                "tables_detected": isinstance(content, str) and "table" in content.lower(),
                "lists_detected": isinstance(content, list) or (isinstance(content, str) and "•" in content)
            }
        
        # Identify key information locations
        for key, value in rfp_data.items():
            key_lower = key.lower()
            
            if any(term in key_lower for term in ["deadline", "due", "date"]):
                structure_analysis["key_information_locations"]["submission_deadline"] = key
            
            if any(term in key_lower for term in ["eligibility", "qualification"]):
                structure_analysis["key_information_locations"]["eligibility_criteria"] = key
            
            if any(term in key_lower for term in ["contact", "question"]):
                structure_analysis["key_information_locations"]["contact_information"] = key
            
            if any(term in key_lower for term in ["evaluation", "scoring"]):
                structure_analysis["key_information_locations"]["evaluation_criteria"] = key
        
        return structure_analysis
    
    def _get_content_length(self, content):
        """Calculate the length of content, whether string or list"""
        if isinstance(content, str):
            return len(content)
        elif isinstance(content, list):
            return sum(len(str(item)) for item in content)
        else:
            return 0
    
    def _estimate_text_complexity(self, content):
        """Estimate text complexity based on sentence length and word diversity"""
        if isinstance(content, list):
            text = " ".join([str(item) for item in content])
        elif isinstance(content, str):
            text = content
        else:
            return 0
        
        # Split into sentences (simple approach)
        sentences = text.split('. ')
        
        # Calculate average sentence length
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / max(1, len(sentences))
        
        # Calculate word diversity (unique words / total words)
        words = text.lower().split()
        unique_words = set(words)
        word_diversity = len(unique_words) / max(1, len(words))
        
        # Combine into complexity score (0-10 scale)
        complexity_score = min(10, (avg_sentence_length / 20) * 5 + (word_diversity * 5))
        
        return complexity_score
    
    def _generate_overall_recommendation(self, results):
        """Generate overall bid/no-bid recommendation based on all analysis results"""
        recommendation = {
            "bid_decision": "",
            "confidence": 0.0,
            "key_factors": [],
            "action_items": []
        }
        
        # Extract key metrics for decision making
        eligibility = results["eligibility"]["eligible"]
        eligibility_score = results["eligibility"].get("confidence_score", 0.0)
        legal_risk_score = results["legal_risks"].get("overall_risk_score", 0.5)
        win_probability = results["competitive_position"].get("win_probability", 0.0)
        compliance_score = results["compliance_checks"].get("compliance_score", 1.0)
        
        # Count deal breakers
        deal_breakers = len(results["compliance_checks"].get("deal_breakers", []))
        critical_gaps = len(results["eligibility"].get("gaps", []))
        high_risk_clauses = len(results["legal_risks"].get("high_risk_clauses", []))
        
        # Calculate weighted recommendation score
        # Higher score = more favorable for bidding
        recommendation_score = (
            (eligibility_score * 0.3) +
            ((1 - legal_risk_score) * 0.2) +  # Invert risk score (higher = better)
            (win_probability * 0.3) +
            (compliance_score * 0.2)
        )
        
        # Adjust for deal breakers
        if deal_breakers > 0 or not eligibility:
            recommendation_score *= 0.3  # Severely reduce score if there are deal breakers
        
        # Determine bid decision
        if deal_breakers > 0 or critical_gaps > 3 or not eligibility:
            recommendation["bid_decision"] = "No-Bid Recommended - Critical requirements not met"
        elif recommendation_score < 0.4:
            recommendation["bid_decision"] = "No-Bid Recommended - Low probability of success"
        elif recommendation_score < 0.6:
            recommendation["bid_decision"] = "Qualified Bid - Proceed with caution"
        else:
            recommendation["bid_decision"] = "Bid Recommended - Good opportunity fit"
        
        recommendation["confidence"] = min(0.95, max(0.6, recommendation_score))
        
        # Identify key decision factors
        if not eligibility:
            recommendation["key_factors"].append("Company does not meet eligibility requirements")
        
        if deal_breakers > 0:
            recommendation["key_factors"].append(f"{deal_breakers} compliance deal breakers identified")
        
        if legal_risk_score > 0.7:
            recommendation["key_factors"].append("High legal risk could impact project profitability")
        
        if win_probability < 0.3:
            recommendation["key_factors"].append("Low win probability based on competitive analysis")
        elif win_probability > 0.7:
            recommendation["key_factors"].append("Strong competitive position increases win probability")
        
        # If no key factors added yet (edge case), add general factor
        if not recommendation["key_factors"]:
            if recommendation_score >= 0.6:
                recommendation["key_factors"].append("Good overall alignment with RFP requirements")
            else:
                recommendation["key_factors"].append("Moderate alignment with RFP requirements")
        
        # Generate action items
        if "Bid Recommended" in recommendation["bid_decision"] or "Qualified Bid" in recommendation["bid_decision"]:
            # Add eligibility gap remediation actions
            for gap in results["eligibility"].get("gaps", []):
                recommendation["action_items"].append(f"Address eligibility gap: {gap}")
            
            # Add legal risk remediation actions
            if high_risk_clauses > 0:
                recommendation["action_items"].append("Consult legal counsel on high-risk contract clauses")
            
            # Add competitive strategy actions
            for strategy in results["competitive_position"].get("win_strategies", [])[:3]:  # Top 3 strategies
                recommendation["action_items"].append(f"Implement win strategy: {strategy}")
            
            # Add submission planning
            if "timeline" in results["submission_requirements"]:
                deadline = results["submission_requirements"]["timeline"].get("submission_deadline")
                if deadline:
                    recommendation["action_items"].append(f"Prepare for submission deadline: {deadline}")
        else:
            # No-bid actions
            recommendation["action_items"].append("Document no-bid decision and rationale")
            recommendation["action_items"].append("Evaluate partnering opportunities to address capability gaps")
            recommendation["action_items"].append("Request debrief or feedback if available")
        
        return recommendation

# Add this new class
class ComplianceChecker:
    """Agent specialized in checking compliance with regulatory and RFP requirements"""
    
    def check_compliance(self, company_data, rfp_data):
        """Check compliance with RFP requirements and identify deal-breakers"""
        compliance_results = {
            "compliant": True,
            "deal_breakers": [],
            "administrative_requirements": [],
            "certification_requirements": [],
            "registration_requirements": [],
            "compliance_score": 1.0,
            "recommendations": []
        }
        
        # Extract mandatory requirements
        mandatory_requirements = self._extract_mandatory_requirements(rfp_data)
        
        # Check each mandatory requirement
        for req in mandatory_requirements:
            requirement_type = self._classify_requirement_type(req)
            requirement_met = self._check_requirement_met(req, company_data)
            
            requirement_result = {
                "requirement": req,
                "type": requirement_type,
                "met": requirement_met,
                "importance": "mandatory"
            }
            
            # Add to appropriate category
            if requirement_type == "certification":
                compliance_results["certification_requirements"].append(requirement_result)
            elif requirement_type == "registration":
                compliance_results["registration_requirements"].append(requirement_result)
            else:
                compliance_results["administrative_requirements"].append(requirement_result)
            
            # Check if this is a deal-breaker
            if not requirement_met:
                compliance_results["deal_breakers"].append(requirement_result)
                compliance_results["compliant"] = False
                
                # Generate recommendation
                compliance_results["recommendations"].append({
                    "issue": f"Missing requirement: {req}",
                    "recommendation": self._generate_compliance_recommendation(req, requirement_type)
                })
        
        # Calculate overall compliance score
        total_requirements = (
            len(compliance_results["administrative_requirements"]) +
            len(compliance_results["certification_requirements"]) +
            len(compliance_results["registration_requirements"])
        )
        
        if total_requirements > 0:
            non_compliant = len(compliance_results["deal_breakers"])
            compliance_results["compliance_score"] = 1.0 - (non_compliant / total_requirements)
        
        return compliance_results
    
    def _extract_mandatory_requirements(self, rfp_data):
        """Extract mandatory requirements from RFP data"""
        mandatory_requirements = []
        
        # Look for explicit mandatory requirements sections
        for key, value in rfp_data.items():
            key_lower = key.lower()
            
            if any(term in key_lower for term in ["mandatory", "required", "eligibility", "qualification"]):
                if isinstance(value, list):
                    for item in value:
                        if self._is_mandatory_statement(item):
                            mandatory_requirements.append(item)
                elif isinstance(value, str) and value.strip():
                    # Split by newlines or periods for multi-requirement paragraphs
                    statements = value.replace('\n', '. ').split('. ')
                    for stmt in statements:
                        if self._is_mandatory_statement(stmt) and len(stmt.strip()) > 10:
                            mandatory_requirements.append(stmt.strip())
        
        # If no explicit mandatory section, check all sections for mandatory language
        if not mandatory_requirements:
            for key, value in rfp_data.items():
                if isinstance(value, list):
                    for item in value:
                        if self._is_mandatory_statement(item):
                            mandatory_requirements.append(item)
                elif isinstance(value, str):
                    statements = value.replace('\n', '. ').split('. ')
                    for stmt in statements:
                        if self._is_mandatory_statement(stmt) and len(stmt.strip()) > 10:
                            mandatory_requirements.append(stmt.strip())
        
        return mandatory_requirements
    
    def _is_mandatory_statement(self, text):
        """Check if a statement indicates a mandatory requirement"""
        if not isinstance(text, str):
            return False
            
        text_lower = text.lower()
        
        # Keywords that indicate mandatory requirements
        mandatory_indicators = [
            "must ", "shall ", "required ", "mandatory ", "essential ",
            "minimum requirement", "minimum qualification", "prerequisite",
            "bidders must", "vendors must", "contractors must",
            "only those", "eligibility criteria"
        ]
        
        # Check if any mandatory indicators are present
        return any(indicator in text_lower for indicator in mandatory_indicators)
    
    def _classify_requirement_type(self, requirement):
        """Classify the type of requirement"""
        requirement_lower = requirement.lower()
        
        if any(term in requirement_lower for term in [
            "certificat", "iso", "cmmi", "qualified", "license"
        ]):
            return "certification"
        
        if any(term in requirement_lower for term in [
            "register", "registration", "incorporated", "business license",
            "authorized", "legal entity", "tax id"
        ]):
            return "registration"
        
        if any(term in requirement_lower for term in [
            "experience", "years", "similar project", "previous"
        ]):
            return "experience"
        
        if any(term in requirement_lower for term in [
            "financial", "revenue", "turnover", "net worth", "annual sales"
        ]):
            return "financial"
        
        return "administrative"
    
    def _check_requirement_met(self, requirement, company_data):
        """Check if the company meets a specific requirement"""
        requirement_lower = requirement.lower()
        requirement_type = self._classify_requirement_type(requirement)
        
        # Check certifications
        if requirement_type == "certification":
            certifications = company_data.get("certifications", [])
            if not isinstance(certifications, list):
                certifications = [certifications]
            
            cert_text = " ".join(str(c) for c in certifications).lower()
            
            # Extract specific certification names from requirement
            import re
            cert_names = re.findall(r'[A-Za-z0-9]+-?[A-Za-z0-9]*', requirement_lower)
            
            for cert in cert_names:
                if len(cert) > 2 and cert in cert_text:  # Only check meaningful cert names
                    return True
            
            return False
        
        # Check registration requirements
        elif requirement_type == "registration":
            legal_info = company_data.get("legal_info", "")
            if isinstance(legal_info, list):
                legal_info = " ".join(str(item) for item in legal_info)
            
            legal_text = legal_info.lower()
            
            # Look for registration terms
            if any(term in requirement_lower for term in ["state registration", "business license"]):
                return "license" in legal_text or "registration" in legal_text
            
            return False
        
        # Check experience requirements
        elif requirement_type == "experience":
            experience = company_data.get("experience", [])
            if not isinstance(experience, list):
                experience = [experience]
            
            # Extract years of experience required
            import re
            years_required = re.search(r'(\d+)\s*(?:years?|yrs)', requirement_lower)
            
            if years_required:
                years_needed = int(years_required.group(1))
                
                # Check if company has specified years of experience
                for exp in experience:
                    exp_str = str(exp).lower()
                    years_match = re.search(r'(\d+)\s*(?:\+)?\s*(?:years?|yrs)', exp_str)
                    if years_match and int(years_match.group(1)) >= years_needed:
                        return True
            
            return False
        
        # Check financial requirements
        elif requirement_type == "financial":
            financials = company_data.get("financials", {})
            if not isinstance(financials, dict):
                financials = {"value": financials}
            
            # Extract financial figures from requirement
            import re
            amount_match = re.search(r'\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|M|k|thousand)?', requirement_lower)
            
            if amount_match:
                amount_str = amount_match.group(1).replace(',', '')
                amount_needed = float(amount_str)
                
                # Adjust for units
                if "million" in requirement_lower or "M" in requirement_lower:
                    amount_needed *= 1000000
                elif "thousand" in requirement_lower or "k" in requirement_lower:
                    amount_needed *= 1000
                
                # Check relevant financial metric
                if "revenue" in requirement_lower or "turnover" in requirement_lower:
                    company_revenue = financials.get("annual_revenue", 0)
                    return company_revenue >= amount_needed
                
                if "net worth" in requirement_lower:
                    company_worth = financials.get("net_worth", 0)
                    return company_worth >= amount_needed
            
            return False
        
        # For administrative requirements, use general matching
        else:
            # Convert company data to searchable text
            company_text = ""
            for key, value in company_data.items():
                if isinstance(value, list):
                    company_text += " ".join(str(item) for item in value) + " "
                elif isinstance(value, dict):
                    company_text += " ".join(str(v) for v in value.values()) + " "
                else:
                    company_text += str(value) + " "
            
            company_text = company_text.lower()
            
            # Extract key terms from requirement
            import re
            key_terms = re.findall(r'\b\w{4,}\b', requirement_lower)
            
            # Check if at least 60% of key terms are in company text
            matches = sum(1 for term in key_terms if term in company_text)
            return matches >= len(key_terms) * 0.6 if key_terms else False
    
    def _generate_compliance_recommendation(self, requirement, requirement_type):
        """Generate a recommendation to address a compliance gap"""
        if requirement_type == "certification":
            return f"Obtain the required certification or partner with a certified firm: {requirement}"
        
        if requirement_type == "registration":
            return f"Complete the required registration process: {requirement}"
        
        if requirement_type == "experience":
            return f"Partner with a firm that has the required experience: {requirement}"
        
        if requirement_type == "financial":
            return f"Consider joint venture to meet financial requirements: {requirement}"
        
        return f"Address gap in {requirement_type} requirement: {requirement}"


def check_eligibility(company_data, rfp_data, embedding_model="all-MiniLM-L6-v2"):
    """Enhanced eligibility checker using the RFP Orchestrator for comprehensive analysis"""
    orchestrator = RFPOrchestrator(embedding_model=embedding_model)
    results = orchestrator.analyze_rfp(company_data, rfp_data)
    
    # Ensure backward compatibility with the original function
    eligibility_results = {
        "eligible": results["eligibility"]["eligible"],
        "matches": [],
        "gaps": results["eligibility"]["gaps"],
        "confidence": results.get("analysis_confidence", {}).get("eligibility", 0.5)
    }
    
    # Convert new format matches to old format
    for match in results["eligibility"].get("matches", []):
        eligibility_results["matches"].append({
            "criterion": match["criterion"],
            "match": match["match"],
            "confidence": match.get("confidence", 0.8)
        })
    
    # Add partial matches as a separate category
    eligibility_results["partial_matches"] = []
    for match in results["eligibility"].get("partial_matches", []):
        eligibility_results["partial_matches"].append({
            "criterion": match["criterion"],
            "partial_match": match.get("partial_match", ""),
            "confidence": match.get("confidence", 0.6)
        })
    
    # Add compliance information
    if "compliance_checks" in results:
        eligibility_results["compliance"] = {
            "compliant": results["compliance_checks"]["compliant"],
            "deal_breakers": results["compliance_checks"].get("deal_breakers", []),
            "compliance_score": results["compliance_checks"].get("compliance_score", 1.0)
        }
    
    # Store full results for advanced UI
    eligibility_results["full_analysis"] = results
    
    return eligibility_results