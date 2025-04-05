import os
import sys
import requests
from tqdm import tqdm
import argparse

def download_model(model_url, save_path):
    """Download a model file with progress bar"""
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    # Check if file already exists
    if os.path.exists(save_path):
        print(f"Model file already exists at {save_path}")
        overwrite = input("Do you want to download again? (y/n): ").lower().strip()
        if overwrite != 'y':
            print("Download cancelled.")
            return
    
    print(f"Downloading model from {model_url}")
    print(f"This might take a while depending on your internet connection...")
    
    try:
        # Get file size for progress bar
        response = requests.get(model_url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        # Download with progress bar
        with open(save_path, 'wb') as f, tqdm(
            desc=os.path.basename(save_path),
            total=total_size,
            unit='B',
            unit_scale=True,
            unit_divisor=1024,
        ) as bar:
            for data in response.iter_content(chunk_size=1024):
                size = f.write(data)
                bar.update(size)
        
        print(f"Download complete! Model saved to {save_path}")
    except Exception as e:
        print(f"Error downloading model: {e}")
        if os.path.exists(save_path):
            os.remove(save_path)  # Remove partial download

def main():
    parser = argparse.ArgumentParser(description="Download LLM model for RFP Analyzer")
    parser.add_argument("--model", type=str, default="llama-2-7b-chat.Q4_K_M.gguf", 
                        help="Model filename to download")
    parser.add_argument("--url", type=str, 
                        default="https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf", 
                        help="URL to download the model from")
    
    args = parser.parse_args()
    
    # Set paths
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    save_path = os.path.join(models_dir, args.model)
    
    # Download the model
    download_model(args.url, save_path)

if __name__ == "__main__":
    main()
