import os
import sys
import subprocess
import asyncio
import platform
import shutil
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_ollama_gpu_config():
    """Get the recommended Ollama GPU configuration"""
    system = platform.system().lower()
    
    if system == "windows":
        return {
            "model_path": os.path.expanduser("~/.ollama/models"),
            "env_vars": {
                "CUDA_VISIBLE_DEVICES": "0",  # Use first GPU
                "OMP_NUM_THREADS": "4"        # Optimize CPU thread usage
            },
            "options": [
                "--noavx512",  # Disable AVX512 for better compatibility
                "--nvidia"      # Explicitly use NVIDIA GPU
            ]
        }
    elif system == "linux":
        return {
            "model_path": os.path.expanduser("~/.ollama/models"),
            "env_vars": {
                "CUDA_VISIBLE_DEVICES": "0",
                "OMP_NUM_THREADS": "4",
                "OLLAMA_CUDA_SYSTEM": "1"   # Enable CUDA if available
            }
        }
    elif system == "darwin":  # macOS
        return {
            "model_path": os.path.expanduser("~/.ollama/models"),
            "env_vars": {
                "OMP_NUM_THREADS": "4",
                "OLLAMA_METAL_SYSTEM": "1"  # Enable Metal (Apple GPU) if available
            }
        }
    else:
        return None

def configure_ollama_for_gpu():
    """Configure Ollama for GPU acceleration"""
    print("Configuring Ollama for GPU acceleration...")
    
    config = get_ollama_gpu_config()
    if not config:
        print("Unsupported operating system.")
        return False
    
    # Check if Ollama is installed
    ollama_path = shutil.which("ollama")
    if not ollama_path:
        print("Ollama not found in PATH. Please install Ollama first.")
        return False
    
    system = platform.system().lower()
    
    # Set environment variables
    for key, value in config["env_vars"].items():
        if system == "windows":
            # For Windows, set user environment variables
            subprocess.run(["setx", key, value], capture_output=True)
            # Also set for current session
            os.environ[key] = value
        else:
            # For Linux/macOS, add to shell profile
            profile_path = os.path.expanduser("~/.bashrc")
            if os.path.exists(os.path.expanduser("~/.zshrc")):
                profile_path = os.path.expanduser("~/.zshrc")
                
            with open(profile_path, "a") as f:
                f.write(f"\n# Added by GPU config for Ollama\nexport {key}={value}\n")
            
            # Also set for current session
            os.environ[key] = value
    
    print("Environment variables set for GPU acceleration.")
    
    # Create or modify Ollama configuration file
    if system == "windows":
        ollama_config_dir = os.path.expanduser("~/.ollama")
    else:
        ollama_config_dir = os.path.expanduser("~/.ollama")
        
    os.makedirs(ollama_config_dir, exist_ok=True)
    
    config_file = os.path.join(ollama_config_dir, "config")
    with open(config_file, "w") as f:
        f.write("# Ollama GPU Configuration\n")
        f.write(f"MODEL_PATH={config['model_path']}\n")
        
        if system == "windows" and "options" in config:
            for option in config["options"]:
                f.write(f"OLLAMA_OPTS=$OLLAMA_OPTS {option}\n")
    
    print(f"Ollama configuration written to {config_file}")
    
    # Restart Ollama service if running
    print("To apply changes, please restart Ollama:")
    if system == "windows":
        print("1. Open Task Manager and end 'ollama.exe' process")
        print("2. Start Ollama again from Start Menu")
    else:
        print("1. Run: killall ollama")
        print("2. Run: ollama serve")
    
    return True

def main():
    print("=== GPU Configuration for RFP Analyzer ===")
    print("This utility will configure your system for GPU acceleration with Ollama")
    print()
    
    proceed = input("Do you want to configure GPU acceleration? (y/n): ").lower().strip()
    if proceed != 'y':
        print("Operation cancelled.")
        return
    
    # Configure Ollama for GPU
    success = configure_ollama_for_gpu()
    
    if success:
        print("\nConfiguration complete!")
        print("Next steps:")
        print("1. Restart Ollama service as instructed above")
        print("2. Run 'python gpu_check.py' to verify GPU acceleration")
        print("3. Run the RFP analyzer for GPU-accelerated processing")
    else:
        print("\nConfiguration failed.")
        print("Please check the requirements and try again.")

if __name__ == "__main__":
    main()
