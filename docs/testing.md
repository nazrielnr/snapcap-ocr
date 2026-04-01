# Panduan Testing — SnapCap OCR

Dokumentasi lengkap cara menjalankan dan menguji sistem OCR.

---

## Model yang Digunakan

| Model | File | Arsitektur | Ukuran |
|-------|------|------------|--------|
| **Detection** | `doctr_det_model.pt` | FAST-tiny (reparameterized) | ~40 MB |
| **Recognition** | `doctr_rec_model.pt` | CRNN VGG16-BN | ~60 MB |

> **Catatan:** Detection model memiliki layer yang sudah di-reparameterize (BatchNorm fused → Conv), sehingga tidak bisa langsung dimuat ke arsitektur `fast_tiny` standar. Script akan otomatis fallback ke pretrained `fast_tiny` untuk detection.

---

## 1. Test OCR Langsung (Offline)

Tanpa server — langsung uji model terhadap gambar.

```powershell
# Aktifkan venv
.\.venv\Scripts\Activate.ps1

# Test dasar
python test_ocr.py receipt_0000.jpg

# Tampilkan output JSON lengkap
python test_ocr.py receipt_0000.jpg --show-json

# Simpan visualisasi
python test_ocr.py receipt_0000.jpg --visualize

# Gunakan model kustom
python test_ocr.py receipt_0000.jpg --det-model path/to/det.pt --rec-model path/to/rec.pt
```

---

## 2. Test via API

Pastikan backend sudah berjalan (`.\run.ps1`), kemudian:

```powershell
# Test semua endpoint
python test_api.py
```

Atau dengan cURL:

```bash
# Health check
curl http://localhost:8000/api/health

# Upload gambar
curl -X POST http://localhost:8000/api/ocr -F "file=@receipt_0000.jpg"
```

---

## 3. Membaca Output Terminal

```
  [H] Nasi Campur Bali                              (conf: 0.98)
  [H] 75,000                                        (conf: 1.00)
  [M] 1 K                                           (conf: 0.65)
```

| Indikator | Arti | Confidence |
|-----------|------|------------|
| `[H]` | High confidence | > 0.80 |
| `[M]` | Medium confidence | 0.50 – 0.80 |
| `[L]` | Low confidence | < 0.50 |

---

## 4. Contoh Hasil Test

Dari gambar `receipt_0000.jpg` (receipt restoran):

- **Total baris terbaca:** 67 baris
- **Total kata terbaca:** 133 kata
- **Confidence rata-rata:** Sangat tinggi (hampir semua > 0.8)

| Teks pada Receipt | Hasil OCR | Confidence |
|-------------------|-----------|------------|
| Nasi Campur Bali | Nasi Campur Bali | 0.98 |
| 125,000 | 125,000 | 1.00 |
| Grand Total | Grand Total | 0.99 |
| 1,591,600 | 1,591,600 | 1.00 |

---

## 5. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ModuleNotFoundError: No module named 'doctr'` | Aktifkan venv: `.\.venv\Scripts\Activate.ps1` |
| `No module named 'matplotlib'` | `pip install matplotlib` |
| `CUDA out of memory` | Model berjalan otomatis di CPU |
| Detection model warning (fused layers) | Normal — script otomatis fallback ke pretrained model |
| `Connection refused` saat test API | Pastikan backend sudah jalan di port 8000 |
