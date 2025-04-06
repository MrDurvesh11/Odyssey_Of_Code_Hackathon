import json
import re
import argparse

def fix_json(input_text):
    """Try to fix common JSON syntax errors"""
    # Replace single quotes with double quotes
    text = input_text.replace("'", '"')
    
    # Fix unquoted keys
    text = re.sub(r'([{,])\s*([a-zA-Z0-9_]+)\s*:', r'\1"\2":', text)
    
    # Fix trailing commas in arrays/objects
    text = re.sub(r',\s*([}\]])', r'\1', text)
    
    # Fix missing commas between items
    text = re.sub(r'(["\d])\s*([{[])', r'\1,\2', text)
    
    return text

def main():
    parser = argparse.ArgumentParser(description="Fix common JSON syntax errors")
    parser.add_argument("--file", help="Path to file containing the JSON to fix")
    
    args = parser.parse_args()
    
    if args.file:
        try:
            with open(args.file, 'r', encoding='utf-8') as f:
                input_text = f.read()
        except Exception as e:
            print(f"Error reading file: {e}")
            return
    else:
        print("Enter/paste the text with JSON errors (Ctrl+D or Ctrl+Z to end):")
        lines = []
        while True:
            try:
                line = input()
                lines.append(line)
            except EOFError:
                break
        input_text = '\n'.join(lines)
    
    if not input_text.strip():
        print("No input provided.")
        return
    
    # Try to extract JSON-like content
    json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    matches = re.findall(json_pattern, input_text, re.DOTALL)
    
    if matches:
        input_text = matches[0]
    else:
        # Look for content between braces
        brace_pattern = r'(\{.*\})'
        matches = re.findall(brace_pattern, input_text, re.DOTALL)
        if matches:
            input_text = matches[0]
    
    fixed_text = fix_json(input_text)
    
    try:
        # Validate the fixed JSON
        parsed = json.loads(fixed_text)
        print("\n=== Fixed JSON ===")
        print(json.dumps(parsed, indent=2))
        
        if args.file:
            output_file = args.file.replace('.', '_fixed.')
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(parsed, f, indent=2)
            print(f"\nFixed JSON saved to {output_file}")
            
    except json.JSONDecodeError as e:
        print(f"\nStill couldn't parse as valid JSON. Error: {e}")
        print("\nPartially fixed JSON:")
        print(fixed_text)

if __name__ == "__main__":
    main()
