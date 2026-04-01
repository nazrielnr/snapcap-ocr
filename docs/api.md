# API Reference — SnapCap OCR

Base URL (development): `http://localhost:8000`

---

## `GET /api/health`

Mengecek apakah server dan model OCR sudah siap.

### Response

```json
{
  "status": "ok",
  "model_loaded": true
}
```

| Field | Type | Keterangan |
|-------|------|-----------|
| `status` | string | `"ok"` jika server berjalan |
| `model_loaded` | boolean | `true` jika model OCR sudah dimuat |

---

## `POST /api/ocr`

Upload gambar struk/receipt untuk diproses OCR.

### Request

- **Content-Type:** `multipart/form-data`
- **Body field:** `file` — file gambar (JPEG, PNG, dll.)

**Contoh cURL:**

```bash
curl -X POST http://localhost:8000/api/ocr \
  -F "file=@receipt.jpg"
```

**Contoh JavaScript (Fetch):**

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const res = await fetch('http://localhost:8000/api/ocr', {
  method: 'POST',
  body: formData,
});
const data = await res.json();
```

### Response — Success (200)

```json
{
  "success": true,
  "data": {
    "merchant": "RESTORAN XYZ",
    "items": [
      { "name": "Nasi Campur Bali", "price": 75000 },
      { "name": "Es Teh Manis", "price": 8000 }
    ],
    "subtotal": 83000,
    "tax": 8300,
    "service": 4150,
    "grand_total": 95450,
    "date": "2024-03-15",
    "raw_lines": [
      { "text": "RESTORAN XYZ", "confidence": 0.99 },
      { "text": "Nasi Campur Bali  75,000", "confidence": 0.97 }
    ],
    "confidence": "high",
    "confidence_score": 95
  },
  "processing_time_ms": 1240
}
```

### Response Fields

| Field | Type | Keterangan |
|-------|------|-----------|
| `success` | boolean | Status pemrosesan |
| `data.merchant` | string / null | Nama merchant |
| `data.items` | array | Daftar item dengan nama & harga |
| `data.subtotal` | number / null | Subtotal (IDR) |
| `data.tax` | number / null | Pajak |
| `data.service` | number / null | Service charge |
| `data.grand_total` | number / null | Total akhir |
| `data.date` | string / null | Tanggal transaksi |
| `data.raw_lines` | array | Semua baris terbaca beserta confidence |
| `data.confidence` | string | `"high"`, `"low"`, atau `"failed"` |
| `data.confidence_score` | integer | Skor confidence 0–100 |
| `processing_time_ms` | integer | Waktu proses dalam milidetik |

### Confidence Levels

| Level | Skor | Arti |
|-------|------|------|
| `high` | ≥ 80 | Hasil OCR andal |
| `low` | 50–79 | Hasil perlu dicek manual |
| `failed` | < 50 | Kualitas gambar kurang baik |

### Response — Error

```json
{
  "success": false,
  "error": "Pesan error",
  "data": null
}
```

| HTTP Status | Keterangan |
|-------------|-----------|
| `400` | File bukan gambar / file kosong |
| `503` | Model OCR belum selesai dimuat |
| `500` | Error internal saat memproses |
