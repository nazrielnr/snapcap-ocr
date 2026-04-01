# Setup & Instalasi — SnapCap OCR

Panduan lengkap untuk menyiapkan environment pengembangan SnapCap OCR.

---

## Prasyarat

| Software | Versi Minimum | Catatan |
|----------|--------------|---------|
| Python | 3.10+ | Direkomendasikan 3.11 |
| Node.js | 18+ | Direkomendasikan LTS |
| Git | 2.x | — |
| GPU NVIDIA | — | Opsional, CUDA 12.1 |

---

## 1. Clone Repository

```bash
git clone https://github.com/nazrielnr/snapcap-ocr.git
cd snapcap-ocr
```

---

## 2. Setup Backend (Python / FastAPI)

### Cara Cepat (Windows PowerShell)

```powershell
.\setup_env.ps1
```

### Manual

```powershell
# Buat virtual environment
python -m venv .venv

# Aktifkan
.\.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# PyTorch dengan CUDA 12.1 (GPU NVIDIA)
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Atau PyTorch CPU-only
# python -m pip install torch torchvision torchaudio

# docTR + dependensi
python -m pip install "python-doctr[torch]" opencv-python-headless Pillow

# FastAPI + server
python -m pip install fastapi uvicorn[standard]
```

### Download Model Weights

File model tidak disertakan di repository (ukuran ±100 MB):

- `doctr_det_model.pt` — Detection model (FAST-tiny)
- `doctr_rec_model.pt` — Recognition model (CRNN VGG16-BN)

Letakkan kedua file di folder root project (sejajar dengan `server.py`).

---

## 3. Jalankan Backend

```powershell
# Aktifkan venv jika belum
.\.venv\Scripts\Activate.ps1

# Jalankan server
.\run.ps1
# atau
python server.py
```

Server berjalan di `http://localhost:8000`

Cek status: `http://localhost:8000/api/health`

---

## 4. Setup Frontend (React + Vite)

```bash
cd snapcap-pwa

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend berjalan di `http://localhost:5173`

### Build Production

```bash
npm run build
# Output → snapcap-pwa/dist/
```

---

## 5. Konfigurasi

### Backend — CORS

Edit `server.py` untuk mengizinkan origin tertentu:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # sesuaikan
    ...
)
```

### Frontend — API URL

Edit `snapcap-pwa/src/` (cari konfigurasi baseURL atau env variable):

```env
VITE_API_URL=http://localhost:8000
```

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ModuleNotFoundError: doctr` | Aktifkan venv: `.\.venv\Scripts\Activate.ps1` |
| `CUDA out of memory` | Model berjalan otomatis di CPU |
| `Address already in use` | Ubah port di `server.py` atau kill proses lama |
| CORS error di browser | Pastikan origin frontend sudah ada di `allow_origins` backend |
