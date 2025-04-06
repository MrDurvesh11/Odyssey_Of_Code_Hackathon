import os
import json
import asyncio
import httpx
from typing import Dict, List, Any, Optional
import subprocess
import google.generativeai as genai
from dotenv import load_dotenv
import time
import re

# Load environment variables
load_dotenv()

# Configure Gemini API with better error handling
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: No Gemini API key found in environment variables.")
    print("Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.")
    print("You can get an API key from https://makersuite.google.com/app/apikey")

class SharedContext:
    """Shared context to prevent redundant API calls and store intermediate results"""
    def __init__(self):
        self.document_chunks = {}  # Store document chunks by category
        self.extracted_data = {}   # Store extracted information
        self.analysis_results = {} # Store analysis results
        self.compliance_checks = {} # Store compliance check results
        
    def add_document_chunks(self, category: str, chunks: List[str]):
        """Add document chunks to the shared context"""
        self.document_chunks[category] = chunks
        
    def add_extracted_data(self, key: str, data: Any):
        """Add extracted data to the shared context"""
        self.extracted_data[key] = data
        
    def add_analysis_result(self, key: str, result: Any):
        """Add analysis result to the shared context"""
        self.analysis_results[key] = result
        
    def add_compliance_check(self, key: str, check: Any):
        """Add compliance check to the shared context"""
        self.compliance_checks[key] = check

class DocumentProcessor:
    """Processes documents and creates chunks for efficient processing"""
    def __init__(self, model="gemini-1.5-flash"):
        self.model = model
        self.gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.responses_dir = os.path.join(os.path.dirname(__file__), "responses", "gemini")
        os.makedirs(self.responses_dir, exist_ok=True)
        
    async def chunk_document(self, document_text: str, chunk_size: int = 8000) -> List[str]:
        """Split document into semantic chunks"""
        chunks = []
        # Simple chunking method based on character count
        for i in range(0, len(document_text), chunk_size):
            chunk = document_text[i:i+chunk_size]
            chunks.append(chunk)
        return chunks
    
    async def extract_sections(self, document_text: str) -> Dict[str, str]:
        """Extract main sections from document using Gemini"""
        prompt = "Extract the main sections from this document. Return a JSON with section names as keys and their content as values."
        
        # Call Gemini API to extract sections
        response = await self.call_gemini(prompt, document_text)
        
        try:
            # Try to parse JSON from the response
            import re
            json_pattern = r"```json\n([\s\S]*?)\n```"
            match = re.search(json_pattern, response)
            
            if match:
                json_str = match.group(1)
            else:
                json_str = response
                
            sections = json.loads(json_str)
            return sections
        except json.JSONDecodeError:
            # Fallback to basic section extraction
            return {"full_document": document_text}
    
    async def extract_key_information(self, document_text: str, info_type: str) -> Dict[str, Any]:
        """Extract specific type of information from document using Gemini"""
        prompts = {
            "eligibility": """
                Extract all eligibility criteria and requirements from this document.
                Include all mandatory qualifications, certifications, experience requirements, etc.
                Return as JSON with categories of requirements.
            """,
            "contract_terms": """
                Extract all contract terms and conditions from this document.
                Include payment terms, liabilities, warranties, IP rights, etc.
                Return as JSON with categories of terms.
            """,
            "technical_requirements": """
                Extract all technical requirements and specifications from this document.
                Include deliverables, service levels, performance metrics, etc.
                Return as JSON with categories of requirements.
            """,
            "submission_requirements": """
                Extract all submission requirements and deadlines from this document.
                Include format requirements, required sections, submission process, etc.
                Return as JSON with categories of requirements.
            """
        }
        
        if info_type not in prompts:
            return {"error": f"Unknown information type: {info_type}"}
        
        # Call Gemini API to extract information
        prompt = prompts[info_type]
        
        # For large documents, break into chunks and combine results
        if len(document_text) > 30000:
            chunks = await self.chunk_document(document_text)
            all_extracted_info = {}
            
            for i, chunk in enumerate(chunks):
                chunk_prompt = f"""
                {prompt}
                
                This is chunk {i+1} of {len(chunks)} from a larger document.
                Extract only the information present in this chunk.
                """
                
                response = await self.call_gemini(chunk_prompt, chunk)
                
                try:
                    # Try to extract JSON from the response
                    json_pattern = r"```json\n([\s\S]*?)\n```"
                    match = re.search(json_pattern, response)
                    
                    if match:
                        json_str = match.group(1)
                    else:
                        json_str = response
                        
                    chunk_info = json.loads(json_str)
                    
                    # Merge with existing information
                    for category, items in chunk_info.items():
                        if category in all_extracted_info:
                            # Avoid duplicates if dealing with lists
                            if isinstance(items, list) and isinstance(all_extracted_info[category], list):
                                # Check for duplicates before adding
                                for item in items:
                                    if item not in all_extracted_info[category]:
                                        all_extracted_info[category].append(item)
                            else:
                                all_extracted_info[category] = items
                        else:
                            all_extracted_info[category] = items
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON from chunk {i+1}")
            
            extracted_info = all_extracted_info
        else:
            # Document is small enough to process directly
            response = await self.call_gemini(prompt, document_text)
            
            try:
                # Try to extract JSON from the response
                json_pattern = r"```json\n([\s\S]*?)\n```"
                match = re.search(json_pattern, response)
                
                if match:
                    json_str = match.group(1)
                else:
                    json_str = response
                    
                extracted_info = json.loads(json_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, return the text response in a simple structure
                return {"text_response": response}
        
        # Save the extracted information to a file for reference
        timestamp = int(time.time())
        filename = f"gemini_{info_type}_{timestamp}.json"
        filepath = os.path.join(self.responses_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(extracted_info, f, indent=2)
            
        print(f"Saved {info_type} information to {filepath}")
        
        return extracted_info
    
    async def call_gemini(self, prompt: str, context: str) -> str:
        """Call Gemini API with prompt and context"""
        try:
            if not self.gemini_api_key:
                return "Error: No Gemini API key configured. Please set GEMINI_API_KEY environment variable."
            
            # Ensure context isn't too large to avoid token limits
            if len(context) > 30000:
                context = context[:30000] + "...[content truncated]"
            
            # Create the full prompt
            full_prompt = f"{prompt}\n\nDocument:\n{context}"
            
            # Call Gemini API
            model = genai.GenerativeModel(self.model)
            response = model.generate_content(full_prompt)
            
            # Save the raw response to a file for debugging
            timestamp = int(time.time())
            filename = f"gemini_response_{timestamp}.txt"
            filepath = os.path.join(self.responses_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(response.text)
                
            print(f"Saved Gemini response to {filepath}")
            
            return response.text
        except Exception as e:
            error_msg = f"Error calling Gemini: {str(e)}"
            print(error_msg)
            return f"Error: {error_msg}"

class BaseAgent:
    """Base class for all AI agents"""
    def __init__(self, shared_context: SharedContext, model="gemini-2.0-flash-lite"):
        self.shared_context = shared_context
        self.model = model
        self.responses_dir = os.path.join(os.path.dirname(__file__), "responses", "gemini")
        os.makedirs(self.responses_dir, exist_ok=True)
        
    async def run(self):
        """Run the agent's analysis"""
        raise NotImplementedError("Each agent must implement its own run method")
    
    async def call_gemini(self, prompt: str, context: str = "") -> str:
        """Call Gemini API with prompt and context"""
        try:
            if not api_key:
                return json.dumps({"error": "No Gemini API key configured. Please set GEMINI_API_KEY environment variable."})
                
            model = genai.GenerativeModel(self.model)
            response = model.generate_content(f"{prompt}\n\n{context}")
            
            # Get a summary of the prompt for the filename
            prompt_summary = self._get_prompt_summary(prompt)
            
            # Save the raw response to a file for debugging
            timestamp = int(time.time())
            filename = f"gemini_{prompt_summary}_{timestamp}.txt"
            filepath = os.path.join(self.responses_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(response.text)
                
            print(f"Saved Gemini response to {filepath}")
            
            # Try to extract JSON from the response if it exists
            json_response = self._extract_json(response.text)
            if json_response:
                return json.dumps(json_response)
            
            return response.text
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            error_response = {"error": f"Failed to call Gemini API: {str(e)}"}
            return json.dumps(error_response)
    
    def _get_prompt_summary(self, prompt: str) -> str:
        """Get a summary of the prompt for use in filenames"""
        # Extract the first line or first few words
        first_line = prompt.strip().split('\n')[0]
        words = first_line.split()
        summary = '_'.join(words[:3])
        # Remove non-alphanumeric characters
        summary = re.sub(r'[^a-zA-Z0-9_]', '', summary)
        return summary[:30]  # Limit length for filename
    
    def _extract_json(self, text: str) -> Optional[Dict]:
        """Extract JSON from text if it exists"""
        try:
            # First try to parse the entire text as JSON
            return json.loads(text)
        except json.JSONDecodeError:
            # Look for JSON-like structures in the text
            json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            if matches:
                try:
                    return json.loads(matches[0])
                except json.JSONDecodeError:
                    pass
            
            # Try to find any content between braces that might be JSON
            brace_pattern = r'(\{.*\})'
            matches = re.findall(brace_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
                    
            return None

class EligibilityAgent(BaseAgent):
    """Agent that checks if the company is eligible to bid on the RFP"""
    async def run(self, rfp_chunks: List[str], company_data_chunks: List[str]) -> Dict[str, Any]:
        """Check if the company is eligible to bid on the RFP"""
        # Extract eligibility criteria from RFP
        eligibility_criteria = await self._extract_eligibility_criteria(rfp_chunks)
        
        # Extract company qualifications from company data
        company_qualifications = await self._extract_company_qualifications(company_data_chunks)
        
        # Compare criteria with qualifications
        eligibility_analysis = await self._analyze_eligibility(eligibility_criteria, company_qualifications)
        
        # Store results in shared context
        self.shared_context.add_analysis_result("eligibility", eligibility_analysis)
        
        return eligibility_analysis
    
    async def _extract_eligibility_criteria(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract eligibility criteria from RFP chunks"""
        # Combine small chunks to reduce API calls
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_criteria = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all mandatory eligibility criteria from this RFP chunk. Focus on:
            1. Legal requirements (state registration, licenses)
            2. Certifications required
            3. Past performance requirements
            4. Financial requirements
            5. Any other mandatory qualifications
            
            Return a structured JSON with categories as keys and lists of requirements as values.
            Only include mandatory requirements (must have, shall have, required, etc.).
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                criteria = json.loads(response)
                # Merge criteria
                for category, requirements in criteria.items():
                    if category in all_criteria:
                        all_criteria[category].extend(requirements)
                    else:
                        all_criteria[category] = requirements
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("eligibility_criteria", all_criteria)
        
        return all_criteria
    
    async def _extract_company_qualifications(self, company_data_chunks: List[str]) -> Dict[str, Any]:
        """Extract company qualifications from company data chunks"""
        # Combine small chunks to reduce API calls
        combined_chunks = self._combine_chunks(company_data_chunks, max_tokens=7000)
        
        all_qualifications = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all company qualifications from this company data chunk. Focus on:
            1. Legal status (state registrations, licenses)
            2. Certifications held
            3. Past performance (clients, projects)
            4. Financial information
            5. Any other qualifications or capabilities
            
            Return a structured JSON with categories as keys and lists of qualifications as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                qualifications = json.loads(response)
                # Merge qualifications
                for category, quals in qualifications.items():
                    if category in all_qualifications:
                        all_qualifications[category].extend(quals)
                    else:
                        all_qualifications[category] = quals
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("company_qualifications", all_qualifications)
        
        return all_qualifications
    
    async def _analyze_eligibility(self, criteria: Dict[str, Any], qualifications: Dict[str, Any]) -> Dict[str, Any]:
        """Compare eligibility criteria with company qualifications"""
        # Prepare data for Gemini
        data = {
            "eligibility_criteria": criteria,
            "company_qualifications": qualifications
        }
        
        prompt = """
        Compare the eligibility criteria from the RFP with the company qualifications.
        
        For each criterion, determine:
        1. If the company meets the requirement (Yes/No/Partial)
        2. Evidence from company data supporting this determination
        3. If not met, what is needed to become eligible
        
        Return a structured JSON with:
        1. "overall_eligible": true/false
        2. "criteria_analysis": [list of criteria with analysis]
        3. "missing_requirements": [list of unmet requirements]
        4. "recommendations": [specific actions to become eligible]
        """
        
        response = await self.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to analyze eligibility"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class DealBreakerAgent(BaseAgent):
    """Agent that identifies potential deal-breakers in the RFP"""
    async def run(self, rfp_chunks: List[str], company_data_chunks: List[str]) -> Dict[str, Any]:
        """Identify potential deal-breakers in the RFP"""
        # Extract contract terms from RFP
        contract_terms = await self._extract_contract_terms(rfp_chunks)
        
        # Extract company policies from company data
        company_policies = await self._extract_company_policies(company_data_chunks)
        
        # Identify deal-breakers
        dealbreakers = await self._identify_dealbreakers(contract_terms, company_policies)
        
        # Store in shared context
        self.shared_context.add_analysis_result("dealbreakers", dealbreakers)
        
        return dealbreakers
    
    async def _extract_contract_terms(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract contract terms from RFP chunks"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_terms = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all contract terms from this RFP chunk. Focus on:
            1. Payment terms
            2. Liability clauses
            3. Termination conditions
            4. Intellectual property rights
            5. Performance guarantees
            6. SLAs and penalties
            7. Insurance requirements
            8. Any other contractual obligations
            
            Return a structured JSON with categories as keys and terms as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                terms = json.loads(response)
                # Merge terms
                for category, term_list in terms.items():
                    if category in all_terms:
                        all_terms[category].extend(term_list)
                    else:
                        all_terms[category] = term_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("contract_terms", all_terms)
        
        return all_terms
    
    async def _extract_company_policies(self, company_data_chunks: List[str]) -> Dict[str, Any]:
        """Extract company policies from company data chunks"""
        combined_chunks = self._combine_chunks(company_data_chunks, max_tokens=7000)
        
        all_policies = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all company policies and standard practices from this company data. Focus on:
            1. Standard contract terms
            2. Payment terms the company typically accepts
            3. Liability limitations
            4. IP ownership policies
            5. Insurance coverage
            6. Any red lines or non-negotiable points
            
            Return a structured JSON with categories as keys and policies as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                policies = json.loads(response)
                # Merge policies
                for category, policy_list in policies.items():
                    if category in all_policies:
                        all_policies[category].extend(policy_list)
                    else:
                        all_policies[category] = policy_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("company_policies", all_policies)
        
        return all_policies
    
    async def _identify_dealbreakers(self, terms: Dict[str, Any], policies: Dict[str, Any]) -> Dict[str, Any]:
        """Identify potential deal-breakers by comparing contract terms with company policies"""
        data = {
            "contract_terms": terms,
            "company_policies": policies
        }
        
        prompt = """
        Compare the contract terms from the RFP with the company policies and identify potential deal-breakers.
        
        For each potential issue, determine:
        1. The specific contract term that poses a problem
        2. Why it's problematic for the company
        3. Risk level (High/Medium/Low)
        4. Potential alternative or compromise
        
        Return a structured JSON with:
        1. "has_dealbreakers": true/false
        2. "dealbreakers": [list of high-risk issues that should prevent bidding]
        3. "concerns": [list of medium/low risk issues that need attention]
        4. "recommendations": [suggestions for addressing each issue]
        """
        
        response = await self.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to identify deal-breakers"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class SubmissionChecklistAgent(BaseAgent):
    """Agent that generates a submission checklist from the RFP"""
    async def run(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Generate a submission checklist from the RFP"""
        # Extract submission requirements from RFP
        submission_requirements = await self._extract_submission_requirements(rfp_chunks)
        
        # Generate structured checklist
        checklist = await self._generate_checklist(submission_requirements)
        
        # Store results in shared context
        self.shared_context.add_analysis_result("submission_checklist", checklist)
        
        return checklist
    
    async def _extract_submission_requirements(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract submission requirements from RFP chunks"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_requirements = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all submission requirements from this RFP chunk. Focus on:
            1. Document format (page limit, font type/size, line spacing)
            2. Required sections and content
            3. Specific attachments or forms
            4. Submission deadlines and method
            5. Any other submission instructions
            
            Return a structured JSON with categories as keys and requirements as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                requirements = json.loads(response)
                # Merge requirements
                for category, req_list in requirements.items():
                    if category in all_requirements:
                        all_requirements[category].extend(req_list)
                    else:
                        all_requirements[category] = req_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("submission_requirements", all_requirements)
        
        return all_requirements
    
    async def _generate_checklist(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a structured checklist from the submission requirements"""
        prompt = """
        Create a comprehensive submission checklist based on these RFP submission requirements.
        
        The checklist should:
        1. Be organized by submission category
        2. Include every requirement as a separate item
        3. Have a clear, actionable description for each item
        4. Note any deadlines or special instructions
        
        Return a structured JSON with:
        1. "checklist_items": [array of items with "category", "description", "deadline" (if applicable)]
        2. "key_deadlines": [important dates]
        3. "special_instructions": [any special notes]
        """
        
        response = await self.call_gemini(prompt, json.dumps(requirements))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate checklist"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class ContractRiskAgent(BaseAgent):
    """Agent that analyzes contract risks in the RFP"""
    async def run(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Analyze contract risks in the RFP"""
        # Extract contract clauses from RFP
        contract_clauses = await self._extract_contract_clauses(rfp_chunks)
        
        # Analyze contract risks
        risk_analysis = await self._analyze_contract_risks(contract_clauses)
        
        # Store results in shared context
        self.shared_context.add_analysis_result("contract_risks", risk_analysis)
        
        return risk_analysis
    
    async def _extract_contract_clauses(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract contract clauses from RFP chunks"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_clauses = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all contract clauses from this RFP chunk. Focus on:
            1. Terms and conditions
            2. Liability and indemnification
            3. Termination clauses
            4. Payment terms
            5. Intellectual property rights
            6. Warranties and guarantees
            7. Any other contractual obligations
            
            Return a structured JSON with clause categories as keys and the actual clause text as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                clauses = json.loads(response)
                # Merge clauses
                for category, clause_list in clauses.items():
                    if category in all_clauses:
                        all_clauses[category].extend(clause_list)
                    else:
                        all_clauses[category] = clause_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("contract_clauses", all_clauses)
        
        return all_clauses
    
    async def _analyze_contract_risks(self, clauses: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze risks in contract clauses"""
        prompt = """
        Analyze these contract clauses for risks to the vendor. Identify:
        1. Biased clauses that put the vendor at a disadvantage
        2. Unbalanced risk allocation
        3. Unreasonable obligations or liabilities
        4. Unclear or ambiguous terms
        5. Excessive penalties or remedies
        
        For each risky clause:
        1. Explain why it's risky
        2. Rate the risk level (High/Medium/Low)
        3. Suggest a more balanced alternative
        
        Return a structured JSON with:
        1. "high_risk_clauses": [list with clause, reason, suggestion]
        2. "medium_risk_clauses": [list with clause, reason, suggestion]
        3. "low_risk_clauses": [list with clause, reason, suggestion]
        4. "summary": overall risk assessment
        """
        
        response = await self.call_gemini(prompt, json.dumps(clauses))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to analyze contract risks"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class StrategicFitAgent(BaseAgent):
    """Agent that analyzes the strategic fit of the RFP with company capabilities"""
    async def run(self, rfp_chunks: List[str], company_data_chunks: List[str]) -> Dict[str, Any]:
        """Analyze the strategic fit of the RFP with company capabilities"""
        # Extract RFP requirements
        rfp_requirements = await self._extract_rfp_requirements(rfp_chunks)
        
        # Extract company capabilities
        company_capabilities = await self._extract_company_capabilities(company_data_chunks)
        
        # Analyze strategic fit
        strategic_fit = await self._analyze_strategic_fit(rfp_requirements, company_capabilities)
        
        # Store in shared context
        self.shared_context.add_analysis_result("strategic_fit", strategic_fit)
        
        return strategic_fit
    
    async def _extract_rfp_requirements(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract requirements from RFP chunks"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_requirements = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all project requirements from this RFP chunk. Focus on:
            1. Technical requirements
            2. Service delivery expectations
            3. Expertise required
            4. Industry-specific knowledge needed
            5. Scale and scope of work
            
            Return a structured JSON with requirement categories as keys and specific requirements as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                requirements = json.loads(response)
                # Merge requirements
                for category, req_list in requirements.items():
                    if category in all_requirements:
                        all_requirements[category].extend(req_list)
                    else:
                        all_requirements[category] = req_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("rfp_requirements", all_requirements)
        
        return all_requirements
    
    async def _extract_company_capabilities(self, company_data_chunks: List[str]) -> Dict[str, Any]:
        """Extract capabilities from company data chunks"""
        combined_chunks = self._combine_chunks(company_data_chunks, max_tokens=7000)
        
        all_capabilities = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all company capabilities from this data. Focus on:
            1. Technical expertise and services
            2. Industry experience
            3. Team skills and resources
            4. Past project successes
            5. Unique selling points
            
            Return a structured JSON with capability categories as keys and specific capabilities as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                capabilities = json.loads(response)
                # Merge capabilities
                for category, cap_list in capabilities.items():
                    if category in all_capabilities:
                        all_capabilities[category].extend(cap_list)
                    else:
                        all_capabilities[category] = cap_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("company_capabilities", all_capabilities)
        
        return all_capabilities
    
    async def _analyze_strategic_fit(self, requirements: Dict[str, Any], capabilities: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the strategic fit between RFP requirements and company capabilities"""
        data = {
            "rfp_requirements": requirements,
            "company_capabilities": capabilities
        }
        
        prompt = """
        Compare the RFP requirements with the company's capabilities to assess strategic fit.
        
        For each requirement area:
        1. Rate the company's capability match (Strong/Moderate/Weak)
        2. Identify competitive advantages
        3. Note any capability gaps
        
        Return a structured JSON with:
        1. "overall_fit": rating from 1-10 with explanation
        2. "strength_areas": [list of areas where company excels]
        3. "gap_areas": [list of areas where company lacks capability]
        4. "opportunity_assessment": strategic assessment of this opportunity
        5. "win_strategy": recommendations to position for success
        """
        
        response = await self.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to analyze strategic fit"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class QuestionnaireAgent(BaseAgent):
    """Agent that generates clarification questions about the RFP"""
    async def run(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Generate clarification questions about the RFP"""
        # Identify areas that need clarification
        unclear_areas = await self._identify_unclear_areas(rfp_chunks)
        
        # Generate specific questions
        questions = await self._generate_questions(unclear_areas)
        
        # Store results in shared context
        self.shared_context.add_analysis_result("clarification_questions", questions)
        
        return questions
    
    async def _identify_unclear_areas(self, rfp_chunks: List[str]) -> Dict[str, List[str]]:
        """Identify areas in the RFP that need clarification"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_unclear_areas = {}
        for chunk in combined_chunks:
            prompt = """
            Identify areas in this RFP chunk that need clarification or are ambiguous. Focus on:
            1. Vague requirements or specifications
            2. Undefined terms or metrics
            3. Conflicting information
            4. Missing critical details
            5. Unclear expectations or deliverables
            
            Return a structured JSON with categories as keys and lists of unclear items as values.
            For each item, provide the specific text that needs clarification and why it's unclear.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                unclear_areas = json.loads(response)
                # Merge areas
                for category, items in unclear_areas.items():
                    if category in all_unclear_areas:
                        all_unclear_areas[category].extend(items)
                    else:
                        all_unclear_areas[category] = items
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("unclear_areas", all_unclear_areas)
        
        return all_unclear_areas
    
    async def _generate_questions(self, unclear_areas: Dict[str, List[str]]) -> Dict[str, Any]:
        """Generate specific questions for clarification"""
        prompt = """
        Based on these unclear areas in the RFP, generate specific questions to ask the RFP issuer.
        
        Create questions that:
        1. Are specific and directly address the ambiguity
        2. Are phrased professionally and constructively
        3. Show understanding of the subject matter
        4. Would provide valuable information for the proposal
        5. Are prioritized by importance
        
        Return a structured JSON with:
        1. "high_priority_questions": [list of most critical questions]
        2. "medium_priority_questions": [list of important but not critical questions]
        3. "low_priority_questions": [list of nice-to-have clarifications]
        4. "question_categories": {category names with arrays of question indices}
        5. "submission_advice": suggestions on how to submit these questions
        """
        
        response = await self.call_gemini(prompt, json.dumps(unclear_areas))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate clarification questions"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class ProposalOutlineAgent(BaseAgent):
    """Agent that creates a proposal outline and suggestions"""
    async def run(self, rfp_chunks: List[str], company_data_chunks: List[str]) -> Dict[str, Any]:
        """Create a proposal outline and strategy suggestions"""
        # Extract proposal requirements from RFP
        proposal_requirements = await self._extract_proposal_requirements(rfp_chunks)
        
        # Extract company strengths for proposal
        company_strengths = await self._extract_company_strengths(company_data_chunks)
        
        # Generate proposal outline and suggestions
        proposal_outline = await self._generate_proposal_outline(proposal_requirements, company_strengths)
        
        # Generate quality checklist for the proposal
        quality_checklist = await self._generate_quality_checklist(proposal_requirements)
        
        # Combine results
        results = {
            "proposal_outline": proposal_outline,
            "quality_checklist": quality_checklist
        }
        
        # Store results in shared context
        self.shared_context.add_analysis_result("proposal_strategy", results)
        
        return results
    
    async def _extract_proposal_requirements(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract proposal structure requirements from RFP"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_requirements = {}
        for chunk in combined_chunks:
            prompt = """
            Extract all requirements for proposal structure, content, and format from this RFP chunk. Focus on:
            1. Required proposal sections and their order
            2. Content requirements for each section
            3. Format specifications (page limits, fonts, margins, etc.)
            4. Evaluation criteria that will be used to score the proposal
            5. Any unique or special requirements for this RFP
            
            Return a structured JSON with categories as keys and requirements as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                requirements = json.loads(response)
                # Merge requirements
                for category, reqs in requirements.items():
                    if category in all_requirements:
                        all_requirements[category].extend(reqs)
                    else:
                        all_requirements[category] = reqs
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("proposal_requirements", all_requirements)
        
        return all_requirements
    
    async def _extract_company_strengths(self, company_data_chunks: List[str]) -> Dict[str, Any]:
        """Extract company strengths for proposal highlighting"""
        combined_chunks = self._combine_chunks(company_data_chunks, max_tokens=7000)
        
        all_strengths = {}
        for chunk in combined_chunks:
            prompt = """
            Extract key company strengths that should be highlighted in a proposal. Focus on:
            1. Core competencies and expertise
            2. Past performance and success stories
            3. Unique selling points and differentiators
            4. Certifications, awards, and recognition
            5. Client testimonials and references
            
            Return a structured JSON with categories as keys and specific strengths as values.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                strengths = json.loads(response)
                # Merge strengths
                for category, strength_list in strengths.items():
                    if category in all_strengths:
                        all_strengths[category].extend(strength_list)
                    else:
                        all_strengths[category] = strength_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("company_strengths", all_strengths)
        
        return all_strengths
    
    async def _generate_proposal_outline(self, requirements: Dict[str, Any], strengths: Dict[str, Any]) -> Dict[str, Any]:
        """Generate proposal outline and strategy suggestions"""
        data = {
            "proposal_requirements": requirements,
            "company_strengths": strengths
        }
        
        prompt = """
        Create a detailed proposal outline based on the RFP requirements and company strengths.
        
        For each section of the proposal:
        1. Provide a clear title and purpose
        2. Outline key content to include
        3. Suggest how to highlight relevant company strengths
        4. Note any specific RFP requirements to address
        5. Recommend approximate length and emphasis
        
        Return a structured JSON with:
        1. "executive_summary": guidance for the executive summary
        2. "sections": [array of proposal sections with details]
        3. "strategic_emphasis": areas to emphasize in the proposal
        4. "win_themes": key themes to weave throughout the proposal
        5. "visual_elements": suggestions for graphics, tables, etc.
        """
        
        response = await self.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate proposal outline"}
    
    async def _generate_quality_checklist(self, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate quality checklist for the proposal"""
        prompt = """
        Create a comprehensive quality checklist for the proposal based on these RFP requirements.
        
        The checklist should verify that the proposal:
        1. Complies with all RFP instructions and requirements
        2. Addresses all evaluation criteria effectively
        3. Is clear, consistent, and well-organized
        4. Contains all required elements and attachments
        5. Is free of common proposal weaknesses and errors
        
        Return a structured JSON with:
        1. "compliance_checks": [checks to ensure RFP compliance]
        2. "content_checks": [checks to ensure complete and effective content]
        3. "quality_checks": [checks for overall proposal quality]
        4. "final_review_process": recommended review process steps
        """
        
        response = await self.call_gemini(prompt, json.dumps(requirements))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate quality checklist"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class CompetitiveAnalysisAgent(BaseAgent):
    """Agent that analyzes competitive aspects of the RFP"""
    async def run(self, rfp_chunks: List[str], company_data_chunks: List[str]) -> Dict[str, Any]:
        """Analyze competitive positioning for this RFP"""
        # Extract competitive factors from RFP
        competitive_factors = await self._extract_competitive_factors(rfp_chunks)
        
        # Analyze company's competitive position
        competitive_position = await self._analyze_competitive_position(competitive_factors, company_data_chunks)
        
        # Generate competitive strategy
        competitive_strategy = await self._generate_competitive_strategy(competitive_position)
        
        # Store results in shared context
        self.shared_context.add_analysis_result("competitive_analysis", {
            "competitive_factors": competitive_factors,
            "competitive_position": competitive_position,
            "competitive_strategy": competitive_strategy
        })
        
        return {
            "competitive_factors": competitive_factors,
            "competitive_position": competitive_position,
            "competitive_strategy": competitive_strategy
        }
    
    async def _extract_competitive_factors(self, rfp_chunks: List[str]) -> Dict[str, Any]:
        """Extract competitive factors from the RFP"""
        combined_chunks = self._combine_chunks(rfp_chunks, max_tokens=7000)
        
        all_factors = {}
        for chunk in combined_chunks:
            prompt = """
            Identify competitive factors in this RFP that would influence vendor selection. Focus on:
            1. Explicit evaluation criteria and their weights
            2. Implicit preferences or requirements that favor certain vendors
            3. Past contract awards for similar work (if mentioned)
            4. Key differentiators that would set vendors apart
            5. Price sensitivity and budget considerations
            
            Return a structured JSON with factor categories as keys and specific factors as values.
            Include relative importance if indicated in the RFP.
            """
            
            response = await self.call_gemini(prompt, chunk)
            try:
                factors = json.loads(response)
                # Merge factors
                for category, factor_list in factors.items():
                    if category in all_factors:
                        all_factors[category].extend(factor_list)
                    else:
                        all_factors[category] = factor_list
            except json.JSONDecodeError:
                print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
        
        # Store in shared context
        self.shared_context.add_extracted_data("competitive_factors", all_factors)
        
        return all_factors
    
    async def _analyze_competitive_position(self, factors: Dict[str, Any], company_chunks: List[str]) -> Dict[str, Any]:
        """Analyze company's competitive position"""
        # First, extract company capabilities relevant to competition
        combined_chunks = self._combine_chunks(company_chunks, max_tokens=7000)
        company_capabilities = self.shared_context.extracted_data.get("company_capabilities", {})
        
        if not company_capabilities:
            for chunk in combined_chunks:
                prompt = """
                Extract key competitive capabilities of this company. Focus on:
                1. Differentiators and unique selling points
                2. Past performance metrics and success stories
                3. Notable expertise, qualifications, and certifications
                4. Cost structure and pricing advantages (if mentioned)
                5. Strategic partnerships and alliances
                
                Return a structured JSON with capability categories as keys and specific capabilities as values.
                """
                
                response = await self.call_gemini(prompt, chunk)
                try:
                    capabilities = json.loads(response)
                    # Merge capabilities
                    for category, cap_list in capabilities.items():
                        if category in company_capabilities:
                            company_capabilities[category].extend(cap_list)
                        else:
                            company_capabilities[category] = cap_list
                except json.JSONDecodeError:
                    print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            
            # Store in shared context if not already there
            self.shared_context.add_extracted_data("company_capabilities", company_capabilities)
        
        # Now analyze competitive position
        data = {
            "competitive_factors": factors,
            "company_capabilities": company_capabilities
        }
        
        prompt = """
        Analyze the company's competitive position for this RFP based on the competitive factors and company capabilities.
        
        For each competitive factor:
        1. Rate the company's position (Strong/Moderate/Weak)
        2. Identify supporting evidence from company capabilities
        3. Note potential competitors' advantages in this area
        4. Suggest how to strengthen position if needed
        
        Return a structured JSON with:
        1. "overall_position": general assessment with strengths and weaknesses
        2. "factor_analysis": [detailed analysis of each competitive factor]
        3. "key_strengths": [competitive strengths to emphasize]
        4. "key_weaknesses": [competitive weaknesses to mitigate]
        """
        
        response = await self.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to analyze competitive position"}
    
    async def _generate_competitive_strategy(self, position: Dict[str, Any]) -> Dict[str, Any]:
        """Generate competitive strategy recommendations"""
        prompt = """
        Based on this competitive position analysis, develop a competitive strategy for this RFP.
        
        The strategy should include:
        1. Positioning approach to highlight strengths and mitigate weaknesses
        2. Pricing strategy recommendations
        3. Key differentiators to emphasize
        4. How to counter likely competitors' advantages
        5. Teaming suggestions if applicable
        
        Return a structured JSON with:
        1. "positioning_strategy": overall approach to positioning
        2. "pricing_strategy": recommendations on pricing approach
        3. "differentiation_strategy": how to stand out from competitors
        4. "risk_mitigation": how to address competitive weaknesses
        5. "win_themes": key competitive messages to emphasize
        """
        
        response = await self.call_gemini(prompt, json.dumps(position))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate competitive strategy"}
    
    def _combine_chunks(self, chunks: List[str], max_tokens: int = 7000) -> List[str]:
        """Combine small chunks to reduce API calls while staying under token limits"""
        combined_chunks = []
        current_chunk = ""
        
        for chunk in chunks:
            # Rough token estimation (characters / 4)
            estimated_tokens = len(current_chunk) / 4
            chunk_tokens = len(chunk) / 4
            
            if estimated_tokens + chunk_tokens > max_tokens:
                combined_chunks.append(current_chunk)
                current_chunk = chunk
            else:
                current_chunk += "\n" + chunk
                
        if current_chunk:
            combined_chunks.append(current_chunk)
            
        return combined_chunks

class RFPManager:
    """Main class that orchestrates the RFP analysis process"""
    def __init__(self):
        self.shared_context = SharedContext()
        self.document_processor = DocumentProcessor()
        # Initialize agents
        self.eligibility_agent = EligibilityAgent(self.shared_context)
        self.dealbreaker_agent = DealBreakerAgent(self.shared_context)
        self.checklist_agent = SubmissionChecklistAgent(self.shared_context)
        self.risk_agent = ContractRiskAgent(self.shared_context)
        self.strategic_agent = StrategicFitAgent(self.shared_context)
        # New agents
        self.questionnaire_agent = QuestionnaireAgent(self.shared_context)
        self.proposal_agent = ProposalOutlineAgent(self.shared_context)
        self.competitive_agent = CompetitiveAnalysisAgent(self.shared_context)
        
    async def analyze_rfp(self, rfp_path: str, company_data_path: str) -> Dict[str, Any]:
        """Analyze RFP and company data"""
        # Check for API key
        if not api_key:
            return {
                "error": "No Gemini API key configured",
                "message": "Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.",
                "help": "You can get an API key from https://makersuite.google.com/app/apikey"
            }
            
        # Load documents
        rfp_text = self._load_document(rfp_path)
        company_data = self._load_document(company_data_path)
        
        if not rfp_text or not company_data:
            return {
                "error": "Failed to load documents",
                "message": "Make sure the PDF and DOCX files exist and are properly formatted."
            }
        
        print("Documents loaded successfully. Starting analysis...")
        print("Using Gemini to extract key information from documents...")
        
        # Skip summarization and directly extract key information using Gemini
        rfp_eligibility = await self.document_processor.extract_key_information(rfp_text, "eligibility")
        rfp_contract_terms = await self.document_processor.extract_key_information(rfp_text, "contract_terms")
        rfp_tech_reqs = await self.document_processor.extract_key_information(rfp_text, "technical_requirements")
        rfp_submission_reqs = await self.document_processor.extract_key_information(rfp_text, "submission_requirements")
        
        # Store extracted information in shared context
        self.shared_context.add_extracted_data("rfp_text", rfp_text)
        self.shared_context.add_extracted_data("company_data", company_data)
        self.shared_context.add_extracted_data("rfp_eligibility", rfp_eligibility)
        self.shared_context.add_extracted_data("rfp_contract_terms", rfp_contract_terms)
        self.shared_context.add_extracted_data("rfp_technical_requirements", rfp_tech_reqs)
        self.shared_context.add_extracted_data("rfp_submission_requirements", rfp_submission_reqs)
        
        # Create chunks directly from the original documents for more efficient processing
        rfp_chunks = await self.document_processor.chunk_document(rfp_text)
        company_data_chunks = await self.document_processor.chunk_document(company_data)
        
        # Store chunks in shared context
        self.shared_context.add_document_chunks("rfp", rfp_chunks)
        self.shared_context.add_document_chunks("company_data", company_data_chunks)
        
        print("Documents preprocessed. Running analysis agents...")
        
        # Run agents in parallel using the chunked data
        tasks = [
            self.eligibility_agent.run(rfp_chunks, company_data_chunks),
            self.dealbreaker_agent.run(rfp_chunks, company_data_chunks),
            self.checklist_agent.run(rfp_chunks),
            self.risk_agent.run(rfp_chunks),
            self.strategic_agent.run(rfp_chunks, company_data_chunks),
            # New agent tasks
            self.questionnaire_agent.run(rfp_chunks),
            self.proposal_agent.run(rfp_chunks, company_data_chunks),
            self.competitive_agent.run(rfp_chunks, company_data_chunks)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Compile final report
        final_report = {
            "eligibility_analysis": results[0],
            "dealbreaker_analysis": results[1],
            "submission_checklist": results[2],
            "contract_risk_analysis": results[3],
            "strategic_fit_analysis": results[4],
            "clarification_questions": results[5],
            "proposal_strategy": results[6],
            "competitive_analysis": results[7],
            "overall_recommendation": await self._generate_overall_recommendation()
        }
        
        return final_report
    
    async def _generate_overall_recommendation(self) -> Dict[str, Any]:
        """Generate overall recommendation based on all agent analyses"""
        # Compile relevant data for overall recommendation
        data = {
            "eligibility": self.shared_context.analysis_results.get("eligibility", {}),
            "dealbreakers": self.shared_context.analysis_results.get("dealbreakers", {}),
            "contract_risks": self.shared_context.analysis_results.get("contract_risks", {}),
            "strategic_fit": self.shared_context.analysis_results.get("strategic_fit", {})
        }
        
        prompt = """
        Based on the detailed analyses of this RFP opportunity, provide an overall recommendation.
        
        Consider:
        1. Eligibility findings
        2. Potential dealbreakers
        3. Contract risks
        4. Strategic fit
        
        Return a structured JSON with:
        1. "bid_recommendation": "Proceed" or "Do Not Proceed"
        2. "confidence": rating from 1-10
        3. "key_reasons": [list of main factors supporting recommendation]
        4. "risk_assessment": overall risk level and explanation
        5. "next_steps": recommended actions if proceeding
        """
        
        response = await self.eligibility_agent.call_gemini(prompt, json.dumps(data))
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            print(f"Failed to parse JSON from Gemini response: {response[:100]}...")
            return {"error": "Failed to generate overall recommendation"}
    
    def _load_document(self, path: str) -> str:
        """Load document from file path, supporting PDF and DOCX formats"""
        try:
            file_extension = os.path.splitext(path)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_text_from_pdf(path)
            elif file_extension in ['.docx', '.doc']:
                return self._extract_text_from_docx(path)
            else:
                # For text files, read directly
                with open(path, 'r', encoding='utf-8') as file:
                    return file.read()
        except Exception as e:
            print(f"Error loading document {path}: {e}")
            return ""
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            
            text = ""
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num in range(len(reader.pages)):
                    text += reader.pages[page_num].extract_text() + "\n"
            return text
        except ImportError:
            print("PyPDF2 not installed. Please install it with: pip install PyPDF2")
            return ""
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""
    
    def _extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            import docx
            
            doc = docx.Document(docx_path)
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except ImportError:
            print("python-docx not installed. Please install it with: pip install python-docx")
            return ""
        except Exception as e:
            print(f"Error extracting text from DOCX: {e}")
            return ""

async def main():
    manager = RFPManager()
    results = await manager.analyze_rfp(
        "s:/Odyssey_Of_Code_Hackathon/data/rfp_document.txt",
        "s:/Odyssey_Of_Code_Hackathon/data/company_data.txt"
    )
    
    # Save results to file
    with open("s:/Odyssey_Of_Code_Hackathon/results/rfp_analysis.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    print("RFP analysis complete. Results saved to rfp_analysis.json")

if __name__ == "__main__":
    asyncio.run(main())
