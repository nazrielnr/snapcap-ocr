"""
receipt_parser.py - Parse raw OCR lines into structured receipt data.

Handles Indonesian receipt format:
  - Qty x Item Name  Price
  - Sub-Total / Grand Total patterns
  - Rp currency format with comma separators
"""

import re
from typing import Optional


def parse_receipt(lines: list[dict]) -> dict:
    """
    Parse OCR lines into structured receipt data.

    Args:
        lines: List of dicts with 'text' and 'confidence' keys.
              Example: [{"text": "1 x  Nasi Goreng  25,000", "confidence": 0.95}, ...]

    Returns:
        Dict with merchant, items, subtotal, tax, service, grand_total, date, raw_lines
    """
    raw_texts = [l["text"] for l in lines]
    confidences = [l["confidence"] for l in lines]

    result = {
        "merchant": "",
        "items": [],
        "subtotal": 0,
        "tax": 0,
        "service": 0,
        "grand_total": 0,
        "date": "",
        "raw_lines": raw_texts,
        "avg_confidence": round(sum(confidences) / len(confidences), 2) if confidences else 0,
    }

    # --- Extract structured fields ---
    items = []
    found_grand_total = False
    i = 0

    while i < len(raw_texts):
        line = raw_texts[i].strip()
        line_lower = line.lower()

        # Skip decorative lines (dashes, equals, empty)
        if _is_decorative(line):
            i += 1
            continue

        # --- Grand Total ---
        if _match_grand_total(line_lower):
            amount = _extract_amount(line)
            # Look forward for amount
            if amount is None and i + 1 < len(raw_texts):
                amount = _extract_amount(raw_texts[i + 1])
                i += 1
            # Look backward for amount (OCR sometimes puts value before label)
            if amount is None and i - 1 >= 0:
                amount = _extract_amount(raw_texts[i - 1])
            if amount is not None:
                result["grand_total"] = amount
                found_grand_total = True
            i += 1
            continue

        # --- Sub-Total ---
        if _match_subtotal(line_lower):
            amount = _extract_amount(line)
            if amount is None and i + 1 < len(raw_texts):
                amount = _extract_amount(raw_texts[i + 1])
                i += 1
            if amount is not None:
                result["subtotal"] = amount
            i += 1
            continue

        # --- Service ---
        if _match_service(line_lower):
            amount = _extract_amount(line)
            if amount is None and i + 1 < len(raw_texts):
                amount = _extract_amount(raw_texts[i + 1])
                i += 1
            if amount is not None:
                result["service"] = amount
            i += 1
            continue

        # --- Tax (PB1/PPN/Tax) ---
        if _match_tax(line_lower):
            amount = _extract_amount(line)
            if amount is None and i + 1 < len(raw_texts):
                amount = _extract_amount(raw_texts[i + 1])
                i += 1
            if amount is not None:
                result["tax"] = amount
            i += 1
            continue

        # --- Rounding ---
        if "rounding" in line_lower:
            i += 1
            continue

        # --- Date ---
        date_match = _extract_date(line)
        if date_match and not result["date"]:
            result["date"] = date_match
            i += 1
            continue

        # --- Item line (qty x name price) ---
        item = _parse_item_line(line, raw_texts, i)
        if item:
            items.append(item)
            i = item.pop("_next_i", i + 1)
            continue

        # --- Merchant (first meaningful non-item line) ---
        if not result["merchant"] and not items and len(line) > 2:
            # Likely merchant name if it appears before items
            if not _has_price(line) and not any(c.isdigit() for c in line[:3]):
                result["merchant"] = line

        i += 1

    result["items"] = items

    # If no grand total found, use subtotal or sum of items
    if not found_grand_total:
        if result["subtotal"] > 0:
            result["grand_total"] = result["subtotal"] + result["service"] + result["tax"]
        elif items:
            result["grand_total"] = sum(it["price"] for it in items)

    return result


# ---- Helper functions ----

def _is_decorative(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if all(c in "-=_*. " for c in stripped):
        return True
    return False


def _extract_amount(text: str) -> Optional[int]:
    """Extract a numeric amount from text. Returns integer (no decimals for Rupiah)."""
    # Remove Rp prefix
    text = re.sub(r"[Rr][Pp]\.?\s*", "", text)

    # Match number with comma/dot separators: 1,591,600 or 1.591.600
    patterns = [
        r"(-?\d{1,3}(?:[,\.]\d{3})+)",  # 1,346,000 or 1.346.000
        r"(-?\d+)",                       # plain number like 0 or -45
    ]
    for pat in patterns:
        match = re.search(pat, text)
        if match:
            num_str = match.group(1)
            # Remove separators
            num_str = num_str.replace(",", "").replace(".", "")
            try:
                return int(num_str)
            except ValueError:
                continue
    return None


def _has_price(line: str) -> bool:
    return bool(re.search(r"\d{2,3}[,\.]\d{3}", line) or re.search(r"^\s*\d+\s*$", line.strip()))


def _match_grand_total(line_lower: str) -> bool:
    keywords = ["grand total", "grand_total", "grandtotal", "total akhir", "total bayar"]
    return any(k in line_lower for k in keywords)


def _match_subtotal(line_lower: str) -> bool:
    keywords = ["sub-total", "sub total", "subtotal", "sub_total"]
    return any(k in line_lower for k in keywords)


def _match_service(line_lower: str) -> bool:
    return "service" in line_lower and "termsofservice" not in line_lower.replace(" ", "")


def _match_tax(line_lower: str) -> bool:
    keywords = ["pb1", "pbi", "ppn", "tax", "pajak"]
    return any(k in line_lower for k in keywords)


def _extract_date(line: str) -> Optional[str]:
    """Try to extract a date from a line."""
    # Pattern: DD/MM/YYYY or DD-MM-YYYY
    m = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", line)
    if m:
        return m.group(1)
    # Pattern: DD Mon YYYY (e.g. 25 Feb 2026)
    m = re.search(r"(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})", line, re.IGNORECASE)
    if m:
        return m.group(1)
    return None


def _parse_item_line(line: str, all_lines: list[str], idx: int) -> Optional[dict]:
    """
    Parse a receipt item line. Handles multi-line items where qty/name and price
    may be on separate lines.

    Common formats:
      "1 x  Nasi Goreng  25,000"
      "2 X Tahu Goreng          36,000"
      "1 x" (next line: "Nasi Campur Bali") (next line: "75,000")
    """
    # Pattern: qty_marker name price_on_same_line
    # qty marker: digit(s) followed by x, X, *, or similar
    qty_match = re.match(r"^\s*(\d+)\s*[xX\*]\s*", line)
    if not qty_match:
        return None

    qty = int(qty_match.group(1))
    rest = line[qty_match.end():].strip()

    # Try to split name and price from rest
    # Price is usually the last number pattern
    price_match = re.search(r"(\d{1,3}(?:[,\.]\d{3})+|\d+)\s*\.?\s*$", rest)

    if price_match:
        name = rest[:price_match.start()].strip()
        price_str = price_match.group(1).replace(",", "").replace(".", "")
        price = int(price_str) if price_str else 0
        return {"name": name, "qty": qty, "price": price, "_next_i": idx + 1}

    # No price on same line - name might be rest, price on next line(s)
    name = rest
    price = 0
    next_i = idx + 1

    # Look ahead for name continuation and/or price
    while next_i < len(all_lines):
        next_line = all_lines[next_i].strip()
        if _is_decorative(next_line):
            next_i += 1
            continue

        # If next line is purely a price
        if re.match(r"^\s*\d{1,3}(?:[,\.]\d{3})*\s*$", next_line):
            price = _extract_amount(next_line) or 0
            next_i += 1
            break

        # If next line starts with a qty marker, it's a new item
        if re.match(r"^\s*\d+\s*[xX\*]", next_line):
            break

        # If next line is a keyword (sub-total etc), stop
        if any(k in next_line.lower() for k in ["sub-total", "subtotal", "grand total", "service", "pb1", "ppn", "rounding"]):
            break

        # Otherwise it's probably name continuation or name + price
        price_in_next = re.search(r"(\d{1,3}(?:[,\.]\d{3})+|\d+)\s*$", next_line)
        if price_in_next:
            name_part = next_line[:price_in_next.start()].strip()
            if name_part:
                name = (name + " " + name_part).strip() if name else name_part
            price_str = price_in_next.group(1).replace(",", "").replace(".", "")
            price = int(price_str) if price_str else 0
            next_i += 1
            break
        else:
            # Pure name continuation
            name = (name + " " + next_line).strip() if name else next_line
            next_i += 1

    if not name:
        name = "Unknown Item"

    return {"name": name, "qty": qty, "price": price, "_next_i": next_i}
