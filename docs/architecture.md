# Arsitektur Sistem — SnapCap OCR

---

## Overview

SnapCap terdiri dari dua komponen utama yang berjalan terpisah:

```
┌─────────────────────────────────┐     HTTP (REST API)    ┌──────────────────────────────┐
│        Frontend (PWA)           │ ─────────────────────► │      Backend (FastAPI)        │
│   React + TypeScript + Vite     │ ◄───────────────────── │   Python + docTR + PyTorch   │
│   http://localhost:5173         │      JSON Response      │   http://localhost:8000      │
└─────────────────────────────────┘                        └──────────────────────────────┘
```

---

## Backend

### Stack

- **FastAPI** — REST API framework
- **Uvicorn** — ASGI server
- **docTR** — Document Text Recognition library
- **PyTorch** — Deep learning framework

### Alur Pemrosesan OCR

```
User Upload Gambar
       │
       ▼
FastAPI /api/ocr
       │
       ▼
Validasi file type & size
       │
       ▼
Simpan ke tempfile
       │
       ▼
DocumentFile.from_images()
       │
       ▼
OCR Predictor
  ├── Detection Model (FAST-tiny)
  │   └── Mendeteksi bounding box teks
  └── Recognition Model (CRNN VGG16-BN)
      └── Membaca karakter per bounding box
       │
       ▼
Ekstrak lines + confidence
       │
       ▼
receipt_parser.py
  ├── Identifikasi merchant name
  ├── Extract item + harga
  ├── Identifikasi subtotal, tax, service
  └── Identifikasi grand total + tanggal
       │
       ▼
JSON Response → Frontend
```

### Model

| Model | Arsitektur | Fungsi |
|-------|------------|--------|
| `doctr_det_model.pt` | FAST-tiny | Deteksi lokasi teks (bounding box) |
| `doctr_rec_model.pt` | CRNN VGG16-BN | Pengenalan karakter teks |

> Model detection menggunakan layer yang sudah di-reparameterize (fused BatchNorm), sehingga menggunakan pretrained fallback untuk inference.

---

## Frontend

### Stack

- **React 18** + **TypeScript**
- **Vite** — Build tool
- **PWA** — Service worker + manifest

### Struktur Direktori

```
snapcap-pwa/
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # App icons
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Camera/        # Komponen kamera
│   │   ├── Dashboard/     # Widget dashboard
│   │   └── ...
│   ├── pages/             # Halaman aplikasi
│   │   ├── Home.tsx       # Scan & beranda
│   │   ├── History.tsx    # Riwayat transaksi
│   │   ├── Reports.tsx    # Laporan pengeluaran
│   │   └── Profile.tsx    # Profil pengguna
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

### Data Flow Frontend

```
Kamera/File Input
       │
       ▼
FormData (multipart)
       │
       ▼
POST /api/ocr
       │
       ▼
Parse JSON Response
       │
       ▼
Simpan ke localStorage
       │
       ▼
Update UI (Dashboard, History, Reports)
```

---

## Komunikasi Frontend ↔ Backend

| Aspek | Detail |
|-------|--------|
| Protocol | HTTP REST |
| Format data | `multipart/form-data` (upload), `application/json` (response) |
| CORS | Backend mengizinkan `localhost:5173` & `localhost:3000` |
| Auth | Tidak ada (penggunaan lokal) |

---

## Storage

Data transaksi disimpan di **browser localStorage** (tidak ada database eksternal):

```json
{
  "snapcap_transactions": [
    {
      "id": "uuid",
      "date": "2024-03-15",
      "merchant": "Restoran XYZ",
      "items": [...],
      "grand_total": 95450,
      "imageBase64": "..."
    }
  ]
}
```
