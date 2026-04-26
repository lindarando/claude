#!/usr/bin/env python3
"""
Compose 3 antas (104x216mm each, with 3mm bleed) into a 300x216mm sheet.
Place antas at x = 0, 98mm, 196mm so their bleeds overlap at the fold lines.
Add small crop marks at the 4 corners of the trim (294x210mm).

Output: pieghevole-out/lato-A.pdf and pieghevole-out/lato-B.pdf
"""
import io
import os
import sys
from pypdf import PdfReader, PdfWriter, Transformation
from pypdf.generic import RectangleObject, NameObject
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm

OUT_DIR = "pieghevole-out"
ANTAS_DIR = f"{OUT_DIR}/antas"

LATO_A = ["manifesto", "bundle", "copertina"]
LATO_B = ["lettore", "studio", "backoffice"]

PAGE_W_MM, PAGE_H_MM = 300, 216
TRIM_W_MM, TRIM_H_MM = 294, 210
BLEED_MM = 3
ANTA_W_MM = 104  # 98 + 2*3 bleed
ANTA_H_MM = 216  # 210 + 2*3 bleed
PANEL_W_MM = 98

CROP_MARK_LEN_MM = 2.5   # spec wanted 5mm but bleed is only 3mm; using 2.5 + 0.5 gap fits
CROP_MARK_GAP_MM = 0.5
CROP_MARK_THICK_PT = 0.25


def build_marks_overlay():
    """Create a single-page PDF (300x216mm) with only the crop marks at the 4 trim corners."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(PAGE_W_MM * mm, PAGE_H_MM * mm))
    c.setLineWidth(CROP_MARK_THICK_PT)
    c.setStrokeColorRGB(0, 0, 0)

    # Trim corners (in mm, origin bottom-left):
    # bl (3, 3), br (297, 3), tl (3, 213), tr (297, 213)
    corners = [
        ("bl", BLEED_MM, BLEED_MM),
        ("br", BLEED_MM + TRIM_W_MM, BLEED_MM),
        ("tl", BLEED_MM, BLEED_MM + TRIM_H_MM),
        ("tr", BLEED_MM + TRIM_W_MM, BLEED_MM + TRIM_H_MM),
    ]
    g = CROP_MARK_GAP_MM
    L = CROP_MARK_LEN_MM
    for label, x, y in corners:
        # Horizontal mark: at y=corner_y, extends outward from corner along x
        if "l" in label:  # left side -> mark extends to the left
            c.line((x - g - L) * mm, y * mm, (x - g) * mm, y * mm)
        else:  # right side
            c.line((x + g) * mm, y * mm, (x + g + L) * mm, y * mm)
        # Vertical mark: at x=corner_x, extends outward from corner along y
        if "b" in label:  # bottom -> mark extends downward
            c.line(x * mm, (y - g - L) * mm, x * mm, (y - g) * mm)
        else:  # top
            c.line(x * mm, (y + g) * mm, x * mm, (y + g + L) * mm)
    c.showPage()
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def compose_lato(name, antas):
    """antas: list of 3 anta names, in left-to-right order."""
    writer = PdfWriter()
    page = writer.add_blank_page(width=PAGE_W_MM * mm, height=PAGE_H_MM * mm)
    # PDF coord origin is bottom-left. Anta PDFs are 104x216mm full-page.
    # We place anta i at x=i*98mm, y=0 (full-height).
    for i, anta_name in enumerate(antas):
        anta_pdf = PdfReader(f"{ANTAS_DIR}/{anta_name}.pdf")
        anta_page = anta_pdf.pages[0]
        tx = i * PANEL_W_MM * mm  # 0, 277.8, 555.6 pts
        ty = 0
        page.merge_transformed_page(anta_page, Transformation().translate(tx=tx, ty=ty), expand=False)
    # Add crop marks overlay
    marks = build_marks_overlay()
    page.merge_page(marks)
    out_path = f"{OUT_DIR}/lato-{name}.pdf"
    with open(out_path, "wb") as f:
        writer.write(f)
    print(f"✓ {out_path}")


if __name__ == "__main__":
    compose_lato("A", LATO_A)
    compose_lato("B", LATO_B)
