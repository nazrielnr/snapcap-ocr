# setup_env.ps1
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Upgrade pip
python -m pip install --upgrade pip

# 4. Install PyTorch (with CUDA 12.1 for your RTX 4060)
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 5. Install DocTR and other dependencies
python -m pip install "python-doctr[torch]" opencv-python-headless Pillow
