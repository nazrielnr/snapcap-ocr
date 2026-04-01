# SnapCap OCR

> **SnapCap** adalah aplikasi PWA (Progressive Web App) untuk scan & catat struk belanja secara otomatis menggunakan OCR berbasis deep learning.

---

## ✨ Fitur Utama

- 📷 **Scan struk** via kamera atau upload foto
- 🔍 **OCR otomatis** menggunakan model docTR (FAST-tiny + CRNN VGG16-BN)
- 📊 **Parse terstruktur** — merchant, item, subtotal, pajak, grand total
- 💾 **Riwayat transaksi** tersimpan di localStorage
- 📈 **Dashboard & laporan** pengeluaran bulanan
- 🌐 **PWA** — bisa diinstall di HP/desktop, support offline

---

## 🏗️ Arsitektur

```
snapcap-ocr/
├── server.py              # FastAPI backend (OCR engine)
├── receipt_parser.py      # Parser receipt text → JSON terstruktur
├── run.ps1                # Script run backend (Windows)
├── setup_env.ps1          # Script setup virtual environment
├── snapcap-pwa/           # Frontend React + Vite PWA
│   ├── src/
│   │   ├── components/    # Komponen UI (Camera, Dashboard, dll)
│   │   ├── pages/         # Halaman (Home, History, Reports)
│   │   └── ...
│   └── dist/              # Output build (di-gitignore)
├── docs/                  # Dokumentasi lengkap
├── TESTING_GUIDE.md       # Panduan testing OCR
└── Research_Method.ipynb  # Notebook riset
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- Python 3.10+
- Node.js 18+
- (Opsional) GPU NVIDIA + CUDA 12.1 untuk performa OCR lebih cepat

### 1. Setup & Jalankan Backend

```powershell
# Clone repo
git clone https://github.com/nazrielnr/snapcap-ocr.git
cd snapcap-ocr

# Setup virtual environment & install dependencies
.\setup_env.ps1

# Jalankan backend (port 8000)
.\run.ps1
```

Backend akan berjalan di: `http://localhost:8000`

> **Catatan:** File model `.pt` (±100 MB) tidak diinclude di repo karena ukurannya besar. Download terpisah atau hubungi tim.

### 2. Setup & Jalankan Frontend

```bash
cd snapcap-pwa

# Install dependencies
npm install

# Jalankan dev server (port 5173)
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

### 3. Build Frontend (Production)

```bash
cd snapcap-pwa
npm run build
# Output di snapcap-pwa/dist/ (di-gitignore)
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/health` | Cek status server & model |
| `POST` | `/api/ocr` | Upload gambar → hasil OCR terstruktur |

### Contoh Response `/api/ocr`

```json
{
  "success": true,
  "data": {
    "merchant": "RESTORAN XYZ",
    "items": [
      { "name": "Nasi Campur Bali", "price": 75000 }
    ],
    "subtotal": 75000,
    "tax": 7500,
    "service": 5000,
    "grand_total": 87500,
    "date": "2024-03-15",
    "confidence": "high",
    "confidence_score": 95
  },
  "processing_time_ms": 1240
}
```

---

## 🧪 Testing

Lihat panduan lengkap di [TESTING_GUIDE.md](TESTING_GUIDE.md) atau di [docs/testing.md](docs/testing.md).

```powershell
# Test OCR langsung
python test_ocr.py receipt_0000.jpg

# Test API endpoint
python test_api.py
```

---

## 📚 Dokumentasi

| Dokumen | Keterangan |
|---------|------------|
| [docs/setup.md](docs/setup.md) | Instalasi & konfigurasi |
| [docs/api.md](docs/api.md) | Referensi API endpoint |
| [docs/testing.md](docs/testing.md) | Panduan testing |
| [docs/architecture.md](docs/architecture.md) | Arsitektur sistem |

---

## 🛠️ Tech Stack

**Backend**
- Python 3.10+
- FastAPI + Uvicorn
- [docTR](https://github.com/mindee/doctr) (detection: FAST-tiny, recognition: CRNN VGG16-BN)
- PyTorch

**Frontend**
- React + TypeScript
- Vite
- PWA (service worker)

---

## 📝 Lisensi

MIT License — lihat [LICENSE](LICENSE) untuk detail.
