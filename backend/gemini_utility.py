import os
import json
import time
import re
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("WARNING: No Gemini API key found in environment variables.")
    print("Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.")
    print("You can get an API key from https://makersuite.google.com/app/apikey")

class GeminiProcessor:
    """Utility class for processing text with Google's Gemini API"""
    
    def __init__(self, model="gemini-1.5-flash"):
        self.model = model
        self.responses_dir = os.path.join(os.path.dirname(__file__), "responses", "gemini")
        os.makedirs(self.responses_dir, exist_ok=True)
    
    async def process_text(self, prompt: str, text: str, max_tokens: int = 30000) -> str:
        """Process text with Gemini API"""
        try:
            # Handle large inputs by chunking
            if len(text) > max_tokens:
                return await self._process_large_text(prompt, text, max_tokens)
            
            # For smaller texts, process directly
            return await self._call_gemini(prompt, text)
        except Exception as e:
            print(f"Error in text processing: {e}")
            return f"Error: Failed to process text - {str(e)}"
    
    async def extract_structured_data(self, prompt: str, text: str, 
                                     output_format: str = "json") -> Dict[str, Any]:
        """Extract structured data from text"""
        enhanced_prompt = f"""
        {prompt}
        
        Return your response as valid {output_format.upper()}.
        """
        
        response = await self.process_text(enhanced_prompt, text)
        
        if output_format.lower() == "json":
            # Try to extract JSON from the response
            try:
                return self._extract_json(response)
            except Exception as e:
                print(f"Error extracting JSON: {e}")
                return {"error": str(e), "raw_response": response}
        
        return {"response": response}
    
    async def analyze_document(self, document_text: str, 
                              analysis_type: str = "general") -> Dict[str, Any]:
        """Analyze document based on analysis type"""
        analysis_prompts = {
            "general": """
                Analyze this document and provide a general overview of its contents,
                key points, and important information.
            """,
            "rfp": """
                Analyze this Request for Proposal (RFP) document. Identify:
                1. Key requirements and specifications
                2. Important deadlines and dates
                3. Eligibility criteria
                4. Evaluation criteria
                5. Submission guidelines
                
                Organize the information by these categories and highlight critical information.
            """,
            "contract": """
                Analyze this contract document. Identify:
                1. Key terms and conditions
                2. Obligations of each party
                3. Payment terms
                4. Termination clauses
                5. Risks and liabilities
                
                Highlight any unusual or potentially problematic clauses.
            """
        }
        
        prompt = analysis_prompts.get(analysis_type.lower(), analysis_prompts["general"])
        
        # For document analysis, we want structured data
        result = await self.extract_structured_data(prompt, document_text)
        
        # Save analysis results
        timestamp = int(time.time())
        filename = f"analysis_{analysis_type}_{timestamp}.json"
        filepath = os.path.join(self.responses_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
        
        return result
    
    async def _process_large_text(self, prompt: str, text: str, max_tokens: int) -> str:
        """Process large text by chunking"""
        chunks = self._chunk_text(text, max_tokens // 2)  # Allow room for prompt and response
        
        # Process each chunk
        chunk_responses = []
        for i, chunk in enumerate(chunks):
            chunk_prompt = f"{prompt}\n\nThis is part {i+1} of {len(chunks)}."
            response = await self._call_gemini(chunk_prompt, chunk)
            chunk_responses.append(response)
        
        # If we have multiple chunks, combine them
        if len(chunks) > 1:
            combined_responses = "\n\n".join(chunk_responses)
            
            # Generate a final summary/synthesis of all chunk responses
            synthesis_prompt = f"""
            Synthesize the following information from multiple parts of a document into a cohesive response.
            Ensure the final response addresses the original request:
            
            Original request: {prompt}
            """
            
            return await self._call_gemini(synthesis_prompt, combined_responses)
        
        # If only one chunk, return its response directly
        return chunk_responses[0]
    
    async def _call_gemini(self, prompt: str, context: str) -> str:
        """Call Gemini API"""
        try:
            model = genai.GenerativeModel(self.model)
            
            # Create full prompt with context
            full_prompt = f"{prompt}\n\n{context}"
            
            # Call Gemini API
            response = model.generate_content(full_prompt)
            
            # Save response for debugging
            timestamp = int(time.time())
            prompt_hash = abs(hash(prompt[:50])) % 1000  # Simple hash of prompt beginning
            filename = f"gemini_response_{prompt_hash}_{timestamp}.txt"
            filepath = os.path.join(self.responses_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write("=== PROMPT ===\n")
                f.write(prompt[:1000] + ("..." if len(prompt) > 1000 else ""))
                f.write("\n\n=== RESPONSE ===\n")
                f.write(response.text)
            
            return response.text
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return f"Error: {str(e)}"
    
    def _chunk_text(self, text: str, chunk_size: int = 10000) -> List[str]:
        """Split text into chunks of roughly equal size"""
        # If text is short enough, return as is
        if len(text) <= chunk_size:
            return [text]
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            # If adding this paragraph would exceed chunk size,
            # save current chunk and start a new one
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append(current_chunk)
                current_chunk = para
            else:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
        
        # Add the last chunk if it has content
        if current_chunk:
            chunks.append(current_chunk)
        
        # If any chunk is still too large, split it by sentences
        final_chunks = []
        for chunk in chunks:
            if len(chunk) <= chunk_size:
                final_chunks.append(chunk)
            else:
                # Simple sentence splitting
                sentences = re.split(r'(?<=[.!?])\s+', chunk)
                current_chunk = ""
                
                for sentence in sentences:
                    if len(current_chunk) + len(sentence) > chunk_size and current_chunk:
                        final_chunks.append(current_chunk)
                        current_chunk = sentence
                    else:
                        if current_chunk:
                            current_chunk += " " + sentence
                        else:
                            current_chunk = sentence
                
                if current_chunk:
                    final_chunks.append(current_chunk)
        
        return final_chunks
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from text"""
        # First try to parse the entire response as JSON
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Look for JSON between code blocks
            json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
            matches = re.findall(json_pattern, text, re.DOTALL)
            
            if matches:
                try:
                    return json.loads(matches[0])
                except json.JSONDecodeError:
                    pass
            
            # Try to find content between braces
            brace_pattern = r'(\{[\s\S]*\})'
            matches = re.findall(brace_pattern, text, re.DOTALL)
            
            for match in matches:
                try:
                    return json.loads(match)
                except json.JSONDecodeError:
                    continue
            
            # If we can't parse JSON, return text in a simple structure
            return {"text": text}
