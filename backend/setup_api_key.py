import os
import sys

def setup_api_key():
    """Set up the Gemini API key in the .env file"""
    print("=== Gemini API Key Setup ===")
    print("This script will help you set up your Gemini API key.")
    print("You can get an API key from: https://makersuite.google.com/app/apikey")
    print("")
    
    api_key = input("Enter your Gemini API key: ").strip()
    
    if not api_key:
        print("No API key entered. Exiting.")
        return
    
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    
    try:
        with open(env_path, "w") as f:
            f.write(f"GEMINI_API_KEY={api_key}\n")
        
        print(f"\nSuccess! API key saved to {env_path}")
        print("You can now run the RFP Analyzer.")
    except Exception as e:
        print(f"Error saving API key: {e}")
        print("Please manually create a .env file with:")
        print(f"GEMINI_API_KEY={api_key}")

if __name__ == "__main__":
    setup_api_key()
