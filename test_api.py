"""Debug: show raw OCR lines and parsed receipt."""
import urllib.request, json

boundary = "----Bd"
with open("receipt_0000.jpg", "rb") as f:
    file_data = f.read()

body = (
    f"------Bd\r\n"
    f'Content-Disposition: form-data; name="file"; filename="r.jpg"\r\n'
    f"Content-Type: image/jpeg\r\n\r\n"
).encode() + file_data + b"\r\n------Bd--\r\n"

req = urllib.request.Request(
    "http://localhost:8000/api/ocr",
    data=body,
    headers={"Content-Type": "multipart/form-data; boundary=----Bd"},
    method="POST",
)
resp = urllib.request.urlopen(req, timeout=60)
result = json.loads(resp.read())
d = result["data"]

print("=== RAW LINES ===")
for i, line in enumerate(d["raw_lines"]):
    print(f"  [{i:2d}] {line}")

print(f"\n=== PARSED ===")
print(f"  subtotal    = {d['subtotal']}")
print(f"  service     = {d['service']}")
print(f"  tax         = {d['tax']}")
print(f"  grand_total = {d['grand_total']}")
print(f"  items count = {len(d['items'])}")
