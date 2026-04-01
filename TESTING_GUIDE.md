# Panduan Testing Model OCR (docTR)

Dokumentasi cara menjalankan dan menguji model OCR berbasis [docTR](https://github.com/mindee/doctr) untuk membaca teks dari gambar receipt.

## Model yang Digunakan

| Model | File | Arsitektur | Ukuran |
|-------|------|------------|--------|
| **Detection** | `doctr_det_model.pt` | FAST-tiny (reparameterized) | ~40 MB |
| **Recognition** | `doctr_rec_model.pt` | CRNN VGG16-BN | ~60 MB |

- **Detection model** bertugas mendeteksi area teks pada gambar (bounding box).
- **Recognition model** bertugas membaca/mengenali karakter dari area teks yang terdeteksi.

> **Catatan:** Detection model (`doctr_det_model.pt`) memiliki layer yang sudah di-reparameterize (fused BatchNorm → Conv), sehingga tidak bisa langsung di-load ke arsitektur `fast_tiny` standar. Script akan otomatis fallback ke pretrained `fast_tiny` untuk detection, dan menggunakan custom weights untuk recognition.

---

## 1. Setup Environment

### Prasyarat

- Python 3.10+
- GPU dengan CUDA (opsional, untuk performa lebih cepat)

### Instalasi

Jalankan script setup atau lakukan manual:

```powershell
# Buat virtual environment
python -m venv .venv

# Aktifkan virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install PyTorch (dengan CUDA 12.1 untuk GPU NVIDIA)
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install docTR dan dependensi
python -m pip install "python-doctr[torch]" opencv-python-headless Pillow

# (Opsional) Install matplotlib untuk visualisasi
python -m pip install matplotlib
```

Atau jalankan langsung:

```powershell
.\setup_env.ps1
```

---

## 2. Cara Menjalankan Test

### Aktifkan Environment Terlebih Dahulu

```powershell
.\.venv\Scripts\Activate.ps1
```

### Test Dasar

Membaca teks dari gambar dan menampilkan hasil di terminal:

```powershell
python test_ocr.py receipt_0000.jpg
```

### Test dengan Output JSON

Menampilkan hasil lengkap dalam format JSON (termasuk koordinat bounding box dan confidence per kata):

```powershell
python test_ocr.py receipt_0000.jpg --show-json
```

### Test dengan Visualisasi

Menyimpan gambar perbandingan antara gambar asli dan teks hasil rekonstruksi OCR:

```powershell
python test_ocr.py receipt_0000.jpg --visualize
```

Hasil visualisasi akan disimpan sebagai `receipt_0000_ocr_result.png`.

### Menggunakan Model Kustom

Jika memiliki model detection/recognition lain:

```powershell
python test_ocr.py receipt_0000.jpg --det-model path/to/det.pt --rec-model path/to/rec.pt
```

---

## 3. Membaca Output

### Format Output Terminal

```
  [H] Nasi Campur Bali                              (conf: 0.98)
  [H] 75,000                                        (conf: 1.00)
  [M] 1 K                                           (conf: 0.65)
```

| Indikator | Arti | Confidence |
|-----------|------|------------|
| `[H]` | High confidence | > 0.80 |
| `[M]` | Medium confidence | 0.50 - 0.80 |
| `[L]` | Low confidence | < 0.50 |

### Struktur Output JSON (`--show-json`)

```json
{
  "pages": [
    {
      "blocks": [
        {
          "lines": [
            {
              "words": [
                {
                  "value": "Nasi",
                  "confidence": 0.99,
                  "geometry": [[x1, y1], [x2, y2]]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Contoh Hasil Test

Dari gambar `receipt_0000.jpg` (receipt restoran):

- **Total baris terbaca:** 67 baris
- **Total kata terbaca:** 133 kata
- **Confidence rata-rata:** Sangat tinggi (hampir semua > 0.8)

Contoh item yang berhasil terbaca:

| Teks pada Receipt | Hasil OCR | Confidence |
|-------------------|-----------|------------|
| Nasi Campur Bali | Nasi Campur Bali | 0.98 |
| 125,000 | 125,000 | 1.00 |
| Grand Total | Grand Total | 0.99 |
| 1,591,600 | 1,591,600 | 1.00 |

---

## 5. Struktur File

```
SOFTWARE AOL/
├── doctr_det_model.pt      # Model detection (FAST-tiny)
├── doctr_rec_model.pt      # Model recognition (CRNN VGG16-BN)
├── receipt_0000.jpg        # Contoh gambar receipt untuk testing
├── test_ocr.py             # Script utama untuk testing
├── try_doctr.py            # Script alternatif (versi sederhana)
├── setup_env.ps1           # Script setup environment
├── Research_Method.ipynb   # Notebook penelitian
└── .venv/                  # Virtual environment Python
```

---

## 6. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ModuleNotFoundError: No module named 'doctr'` | Aktifkan venv terlebih dahulu: `.\.venv\Scripts\Activate.ps1` |
| `No module named 'matplotlib'` | Install: `pip install matplotlib` |
| `CUDA out of memory` | Model akan otomatis berjalan di CPU jika GPU tidak tersedia |
| Detection model warning (fused layers) | Normal — script otomatis fallback ke pretrained model |
