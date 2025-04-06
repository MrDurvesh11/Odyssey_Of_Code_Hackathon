import asyncio
import argparse
import json
import os
import sys
from rfp_analyzer import RFPManager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def analyze_rfp(rfp_path, company_data_path, output_path=None):
    """Analyze an RFP against company data and generate a report"""
    print(f"Analyzing RFP: {rfp_path}")
    print(f"Using company data: {company_data_path}")
    print(f"Raw API responses will be stored in the 'responses' folder for debugging")
    
    # Check for Gemini API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("\nERROR: No Gemini API key found in environment variables.")
        print("Please set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.")
        print("You can get an API key from https://makersuite.google.com/app/apikey")
        print("\nThen, create a .env file in the backend directory with:")
        print("GEMINI_API_KEY=your_api_key_here")
        return
    
    # Check for Ollama availability
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/version")
            if response.status_code == 200:
                print("Ollama server detected. Will use available models for document preprocessing.")
                
                # Check for available models
                try:
                    model_response = await client.get("http://localhost:11434/api/tags")
                    if model_response.status_code == 200:
                        models = model_response.json().get('models', [])
                        if models:
                            model_names = [model.get('name') for model in models]
                            print(f"Available models: {', '.join(model_names)}")
                            print(f"Will use: {model_names[0]}")
                        else:
                            print("WARNING: No models found. Will use Gemini API for all processing.")
                except Exception as model_error:
                    print(f"WARNING: Could not fetch Ollama models: {model_error}")
            else:
                print("WARNING: Ollama server not responding. Will skip preprocessing step.")
    except Exception as e:
        print(f"WARNING: Ollama server not available: {e}")
        print("Will use Gemini API for all processing.")
    
    # Create output directory if it doesn't exist
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Initialize RFP manager
    manager = RFPManager()
    
    # Run analysis
    results = await manager.analyze_rfp(rfp_path, company_data_path)
    
    # Check for errors
    if "error" in results:
        print(f"\nERROR: {results['error']}")
        if "message" in results:
            print(results["message"])
        if "help" in results:
            print(results["help"])
        return
    
    # Save or print results
    if output_path:
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"Results saved to {output_path}")
    else:
        print(json.dumps(results, indent=2))
    
    # Print executive summary
    print("\n=== EXECUTIVE SUMMARY ===")
    recommendation = results.get("overall_recommendation", {})
    if "error" in recommendation:
        print("Could not generate recommendation due to an error.")
    else:
        print(f"Bid Recommendation: {recommendation.get('bid_recommendation', 'N/A')}")
        print(f"Confidence: {recommendation.get('confidence', 'N/A')}/10")
        print("\nKey Reasons:")
        for reason in recommendation.get("key_reasons", []):
            print(f"- {reason}")
        print(f"\nRisk Assessment: {recommendation.get('risk_assessment', 'N/A')}")
        
        # Display clarification questions summary
        questions = results.get("clarification_questions", {})
        if questions and "high_priority_questions" in questions:
            print("\nTop Clarification Questions:")
            for i, question in enumerate(questions.get("high_priority_questions", [])[:3], 1):
                print(f"  {i}. {question}")
            if len(questions.get("high_priority_questions", [])) > 3:
                print(f"  ...and {len(questions.get('high_priority_questions', [])) - 3} more high priority questions")
        
        # Display proposal strategy summary
        proposal = results.get("proposal_strategy", {}).get("proposal_outline", {})
        if proposal and "win_themes" in proposal:
            print("\nKey Win Themes:")
            for theme in proposal.get("win_themes", [])[:3]:
                print(f"- {theme}")
        
        eligibility = results.get("eligibility_analysis", {})
        if eligibility.get("overall_eligible") == False:
            print("\nWARNING: Company does not meet eligibility requirements!")
            
        dealbreakers = results.get("dealbreaker_analysis", {})
        if dealbreakers.get("has_dealbreakers") == True:
            print("\nWARNING: Potential deal-breakers identified!")

def main():
    parser = argparse.ArgumentParser(description="Process RFP document and company data")
    parser.add_argument("rfp_document", nargs='?', help="Path to the RFP document")
    parser.add_argument("company_data", nargs='?', help="Path to the company data document")
    parser.add_argument("--output", help="Path to save the output JSON file")
    
    args = parser.parse_args()
    
    # If no arguments were provided, use default files in the backend folder
    if args.rfp_document is None or args.company_data is None:
        rfp_path = "S:\\Odyssey_Of_Code_Hackathon\\backend\\rpfs2.pdf"
        company_data_path = "S:\\Odyssey_Of_Code_Hackathon\\backend\\company_data.docx"
    else:
        rfp_path = args.rfp_document
        company_data_path = args.company_data
    
    output_path = args.output
    
    asyncio.run(analyze_rfp(rfp_path, company_data_path, output_path))

if __name__ == "__main__":
    main()
