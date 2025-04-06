import os
import json
import argparse
from pathlib import Path
import re

def list_responses(response_dir, response_type):
    """List all response files in a directory"""
    base_dir = os.path.join(os.path.dirname(__file__), "responses", response_type)
    
    if not os.path.exists(base_dir):
        print(f"No {response_type} responses found. Run the analyzer first.")
        return []
    
    response_files = list(Path(base_dir).glob("*.*"))
    
    if not response_files:
        print(f"No {response_type} responses found in {base_dir}")
        return []
    
    print(f"\n=== {response_type.capitalize()} Responses ===")
    for i, file in enumerate(response_files):
        print(f"{i+1}. {file.name}")
    
    return response_files

def view_response(file_path):
    """View a response file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if it's a JSON file
        if file_path.suffix.lower() == '.json':
            try:
                parsed = json.loads(content)
                content = json.dumps(parsed, indent=2)
            except json.JSONDecodeError:
                pass
        
        print("\n=== Response Content ===")
        print(content)
        
        # Try to extract JSON objects for better debugging
        try_extract_json(content)
            
    except Exception as e:
        print(f"Error reading file: {e}")

def try_extract_json(text):
    """Try to extract JSON objects from text"""
    # Look for JSON-like structures in the text
    json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    if matches:
        print("\n=== Extracted JSON ===")
        for i, match in enumerate(matches):
            try:
                parsed = json.loads(match)
                print(f"\nJSON Object {i+1}:")
                print(json.dumps(parsed, indent=2))
            except json.JSONDecodeError:
                print(f"\nInvalid JSON in match {i+1}:")
                print(match[:100] + "..." if len(match) > 100 else match)

def main():
    parser = argparse.ArgumentParser(description="View and debug API responses")
    parser.add_argument("--type", choices=["gemini", "ollama"], default="gemini",
                        help="Type of responses to view (default: gemini)")
    
    args = parser.parse_args()
    
    response_files = list_responses(args.type, args.type)
    
    if not response_files:
        return
    
    while True:
        choice = input("\nEnter the number of the response to view (or 'q' to quit): ").strip()
        
        if choice.lower() == 'q':
            break
        
        try:
            index = int(choice) - 1
            if 0 <= index < len(response_files):
                view_response(response_files[index])
            else:
                print("Invalid number. Try again.")
        except ValueError:
            print("Please enter a number or 'q' to quit.")

if __name__ == "__main__":
    main()
