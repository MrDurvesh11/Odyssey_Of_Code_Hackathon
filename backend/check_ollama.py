import os
import sys
import subprocess
import time
import httpx
import asyncio
import platform

async def check_ollama_server():
    """Check if the Ollama server is running"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/version", timeout=5.0)
            if response.status_code == 200:
                print(f"✅ Ollama server is running (version: {response.json().get('version', 'unknown')})")
                return True
            else:
                print(f"❌ Ollama server responded with status code {response.status_code}")
                return False
    except httpx.ConnectError:
        print("❌ Ollama server is not running")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama server: {e}")
        return False

async def list_ollama_models():
    """List available Ollama models"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=5.0)
            if response.status_code == 200:
                models = response.json().get('models', [])
                if models:
                    print("\nAvailable models:")
                    for model in models:
                        print(f"  - {model.get('name')}")
                    return [model.get('name') for model in models]
                else:
                    print("\nNo models available. Please pull a model with 'ollama pull mistral' or similar.")
                    return []
            else:
                print(f"❌ Failed to list models: status code {response.status_code}")
                return []
    except Exception as e:
        print(f"❌ Error listing models: {e}")
        return []

def start_ollama_server():
    """Start the Ollama server"""
    system = platform.system().lower()
    
    if system == "windows":
        # On Windows, start Ollama using the installed executable
        try:
            print("Starting Ollama server...")
            # Start in a new window
            subprocess.Popen(["start", "ollama", "serve"], shell=True)
            return True
        except Exception as e:
            print(f"❌ Error starting Ollama: {e}")
            print("Please make sure Ollama is installed and in the PATH.")
            print("Download from: https://ollama.com/download")
            return False
    elif system == "linux" or system == "darwin":  # macOS
        # On Linux/macOS, start Ollama using the command
        try:
            print("Starting Ollama server...")
            subprocess.Popen(["ollama", "serve"], 
                            stdout=subprocess.DEVNULL, 
                            stderr=subprocess.DEVNULL)
            return True
        except Exception as e:
            print(f"❌ Error starting Ollama: {e}")
            print("Please make sure Ollama is installed and in the PATH.")
            print("Download from: https://ollama.com/download")
            return False
    else:
        print(f"❌ Unsupported operating system: {system}")
        return False

def pull_ollama_model(model_name="ollama"):
    """Pull an Ollama model if not already available"""
    try:
        print(f"Checking/pulling model: {model_name}...")
        result = subprocess.run(["ollama", "pull", model_name], 
                               stdout=subprocess.PIPE, 
                               stderr=subprocess.PIPE,
                               text=True)
        if result.returncode == 0:
            print(f"✅ Model {model_name} is ready")
            return True
        else:
            print(f"❌ Error pulling model: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error pulling model: {e}")
        return False

async def main():
    print("=== Ollama Status Check ===")
    
    # Check if Ollama server is running
    server_running = await check_ollama_server()
    
    if not server_running:
        start = input("\nStart Ollama server? (y/n): ").strip().lower()
        if start == 'y':
            if start_ollama_server():
                print("Waiting for Ollama server to start...")
                for _ in range(5):  # Try up to 5 times
                    await asyncio.sleep(2)  # Wait 2 seconds
                    if await check_ollama_server():
                        server_running = True
                        break
    
    if server_running:
        available_models = await list_ollama_models()
        
        if not available_models:
            model_choices = ["mistral", "llama2", "gemma"]
            print("\nNo models found. You need to pull a model to use Ollama.")
            print("Recommended models:")
            for i, model in enumerate(model_choices, 1):
                print(f"  {i}. {model}")
            
            choice = input("\nSelect a model to pull (1-3) or enter a custom model name: ").strip()
            
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(model_choices):
                    model_to_pull = model_choices[idx]
                else:
                    model_to_pull = choice
            except ValueError:
                model_to_pull = choice
            
            if model_to_pull:
                pull_ollama_model(model_to_pull)
        else:
            print("\nYou can use one of the available models.")
    
    print("\nDone! You can now run the RFP analyzer.")

if __name__ == "__main__":
    asyncio.run(main())
