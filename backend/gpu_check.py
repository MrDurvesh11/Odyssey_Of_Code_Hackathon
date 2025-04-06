import os
import asyncio
import httpx
import json
import time
import subprocess
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def check_gpu_availability():
    """Check if GPU is available for processing"""
    print("=== GPU Availability Check ===")
    
    # 1. Check for CUDA availability (for NVIDIA GPUs)
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            device_count = torch.cuda.device_count()
            device_name = torch.cuda.get_device_name(0) if device_count > 0 else "Unknown"
            print(f"✅ CUDA is available with {device_count} device(s)")
            print(f"   GPU: {device_name}")
            
            # Get more GPU details
            print("\nGPU Details:")
            for i in range(device_count):
                print(f"  Device {i}: {torch.cuda.get_device_name(i)}")
                print(f"    Memory: {torch.cuda.get_device_properties(i).total_memory / 1e9:.2f} GB")
                print(f"    Compute capability: {torch.cuda.get_device_capability(i)}")
        else:
            print("❌ CUDA is not available")
    except ImportError:
        print("❌ PyTorch not installed. Install with: pip install torch")
        cuda_available = False
    
    # 2. Check for ROCm (for AMD GPUs)
    rocm_available = False
    try:
        if sys.platform.startswith('linux'):
            result = subprocess.run(["rocminfo"], capture_output=True, text=True)
            if result.returncode == 0 and "GPU Agent" in result.stdout:
                print("✅ ROCm is available (AMD GPU)")
                rocm_available = True
                # Extract GPU name from rocminfo output
                for line in result.stdout.splitlines():
                    if "Marketing Name" in line:
                        gpu_name = line.split(":")[1].strip()
                        print(f"   GPU: {gpu_name}")
            else:
                print("❌ ROCm is not available")
        else:
            print("❌ ROCm is only available on Linux")
    except FileNotFoundError:
        print("❌ ROCm tools not found")
    
    # 3. Check for DirectML (Windows only)
    directml_available = False
    if sys.platform.startswith('win'):
        try:
            import tensorflow as tf
            physical_devices = tf.config.list_physical_devices('GPU')
            if len(physical_devices) > 0:
                print("✅ DirectML/TensorFlow GPU available")
                print(f"   Found {len(physical_devices)} GPU(s)")
                directml_available = True
            else:
                print("❌ DirectML/TensorFlow GPU not available")
        except ImportError:
            print("❌ TensorFlow not installed. DirectML status unknown.")
    
    # 4. Check Ollama GPU acceleration
    print("\n=== Checking Ollama GPU Acceleration ===")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get("http://localhost:11434/api/version")
                if response.status_code == 200:
                    print("✅ Ollama server is running")
                    
                    # Run a test to see if GPU is being used
                    start_time = time.time()
                    response = await client.post(
                        "http://localhost:11434/api/generate",
                        json={
                            "model": "llama2",  # Use any available model
                            "prompt": "Test GPU acceleration with a complex task: Explain quantum computing in detail.",
                            "stream": False
                        }
                    )
                    
                    if response.status_code == 200:
                        end_time = time.time()
                        duration = end_time - start_time
                        
                        # Check for CUDA/GPU usage in Ollama
                        # Faster responses might indicate GPU usage
                        if duration < 5.0:  # Arbitrary threshold
                            print(f"✅ Ollama response was fast ({duration:.2f}s), likely using GPU")
                        else:
                            print(f"⚠️ Ollama response was slow ({duration:.2f}s), might be CPU-only")
                            
                        # Check system info from Ollama
                        try:
                            sysinfo_response = await client.get("http://localhost:11434/api/info")
                            if sysinfo_response.status_code == 200:
                                info = sysinfo_response.json()
                                if "cuda" in str(info).lower() or "gpu" in str(info).lower():
                                    print("✅ Ollama reports GPU/CUDA capability")
                                    print(f"   System info: {json.dumps(info, indent=2)}")
                                else:
                                    print("❌ No explicit GPU info found in Ollama system info")
                        except Exception as e:
                            print(f"Error getting Ollama system info: {e}")
                    else:
                        print(f"❌ Ollama test generation failed: {response.text}")
                else:
                    print(f"❌ Ollama server returned error: {response.status_code}")
            except Exception as e:
                print(f"❌ Ollama server not available: {e}")
    except ImportError:
        print("❌ httpx not installed. Install with: pip install httpx")
    
    # 5. Check Gemini API GPU usage (indirect, as it's a cloud service)
    print("\n=== Checking Gemini API ===")
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            print("✅ Gemini API key is configured")
            print("   Note: Gemini API runs on Google's servers with GPU acceleration")
            
            # Get model information
            try:
                models = genai.list_models()
                print(f"\nAvailable Gemini models:")
                for model in models:
                    if "gemini" in model.name:
                        print(f"  - {model.name}")
            except Exception as e:
                print(f"❌ Error listing Gemini models: {e}")
        except ImportError:
            print("❌ google-generativeai not installed. Install with: pip install google-generativeai")
    else:
        print("❌ Gemini API key not found")
    
    # Summary
    print("\n=== GPU Acceleration Summary ===")
    if cuda_available or rocm_available or directml_available:
        print("✅ GPU is available for acceleration")
        
        # Config suggestions
        print("\nTo use GPU acceleration:")
        if cuda_available:
            print("- For Ollama: Run 'ollama serve' with CUDA support (should be automatic if properly installed)")
            print("- Test with 'nvidia-smi' command to confirm GPU usage during inference")
        if rocm_available:
            print("- For AMD GPUs: Ensure ROCm is properly configured with Ollama")
        
        print("\nRecommendations:")
        print("1. If running Ollama, ensure it's using the GPU for inference")
        print("2. Monitor GPU usage with 'nvidia-smi' (NVIDIA) or 'rocm-smi' (AMD)")
        print("3. For best performance, close other GPU-intensive applications")
    else:
        print("❌ No GPU acceleration detected")
        print("You're currently running on CPU only.")

async def main():
    await check_gpu_availability()

if __name__ == "__main__":
    asyncio.run(main())
