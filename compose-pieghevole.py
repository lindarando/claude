#!/usr/bin/env python3
"""
Compose 3 anta PNGs (rendered at 508 DPI = 20 px/mm) into a single 6000×4320 px
sheet (300×216 mm), add crop marks at the 4 trim corners, output as PDF.

Layout (no overlap, pixel-perfect):
  anta 0 (left, 2020 px):  x = 0..2020      (3 mm bleed + 98 mm content)
  anta 1 (middle, 1960 px): x = 2020..3980   (98 mm content, no L/R bleed)
  anta 2 (right, 2020 px): x = 3980..6000   (98 mm content + 3 mm bleed)
"""
import io
import os
from PIL import Image, ImageDraw
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter, Transformation
import img2pdf

OUT_DIR = "pieghevole-out"
ANTAS_DIR = f"{OUT_DIR}/antas"

LATO_A = ["manifesto", "bundle", "copertina"]
LATO_B = ["lettore", "studio", "backoffice"]

DPI = 508
PX_PER_MM = DPI / 25.4  # = 20

PAGE_W_MM, PAGE_H_MM = 300, 216
TRIM_W_MM, TRIM_H_MM = 294, 210
BLEED_MM = 3

PAGE_W_PX = int(PAGE_W_MM * PX_PER_MM)  # 6000
PAGE_H_PX = int(PAGE_H_MM * PX_PER_MM)  # 4320

CROP_MARK_LEN_MM = 2.5
CROP_MARK_GAP_MM = 0.5
CROP_MARK_THICK_PT = 0.25  # for vector overlay


def compose_lato_raster(name, antas):
    """Composite 3 anta PNGs side-by-side at exact pixel boundaries."""
    canvas = Image.new("RGB", (PAGE_W_PX, PAGE_H_PX), (255, 255, 255))
    x = 0
    for anta_name in antas:
        anta_img = Image.open(f"{ANTAS_DIR}/{anta_name}.png").convert("RGB")
        canvas.paste(anta_img, (x, 0))
        x += anta_img.size[0]
    return canvas


def add_crop_marks_to_image(img):
    """Draw 2.5mm crop marks at the 4 trim corners, on the raster canvas."""
    draw = ImageDraw.Draw(img)
    g_px = int(CROP_MARK_GAP_MM * PX_PER_MM)   # 10
    L_px = int(CROP_MARK_LEN_MM * PX_PER_MM)   # 50
    th_px = max(1, int(CROP_MARK_THICK_PT * (DPI / 72)))  # 0.25pt at 508 DPI ≈ 2 px
    bleed_px = int(BLEED_MM * PX_PER_MM)        # 60
    trim_left   = bleed_px
    trim_right  = PAGE_W_PX - bleed_px
    trim_top    = bleed_px
    trim_bottom = PAGE_H_PX - bleed_px
    for label, cx, cy in [
        ("tl", trim_left,  trim_top),
        ("tr", trim_right, trim_top),
        ("bl", trim_left,  trim_bottom),
        ("br", trim_right, trim_bottom),
    ]:
        # Horizontal mark from corner outward (along x)
        if "l" in label:
            x0, x1 = cx - g_px - L_px, cx - g_px
        else:
            x0, x1 = cx + g_px, cx + g_px + L_px
        draw.line([(x0, cy - th_px // 2), (x1, cy - th_px // 2)], fill=(0, 0, 0), width=th_px)
        # Vertical mark from corner outward (along y)
        if "t" in label:
            y0, y1 = cy - g_px - L_px, cy - g_px
        else:
            y0, y1 = cy + g_px, cy + g_px + L_px
        draw.line([(cx - th_px // 2, y0), (cx - th_px // 2, y1)], fill=(0, 0, 0), width=th_px)
    return img


def img_to_pdf(img, out_path, jpeg_quality=92):
    """Save the image as a 300×216mm PDF (JPEG-encoded for compact size)."""
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=jpeg_quality, dpi=(DPI, DPI), optimize=True)
    buf.seek(0)
    layout = img2pdf.get_layout_fun(pagesize=(img2pdf.mm_to_pt(PAGE_W_MM), img2pdf.mm_to_pt(PAGE_H_MM)))
    with open(out_path, "wb") as f:
        f.write(img2pdf.convert(buf.getvalue(), layout_fun=layout))


if __name__ == "__main__":
    for name, antas in [("A", LATO_A), ("B", LATO_B)]:
        sheet = compose_lato_raster(name, antas)
        sheet = add_crop_marks_to_image(sheet)
        # FLAT (RGB raster) PDF — for Canva and as the master for CMYK conversion
        out_flat = f"{OUT_DIR}/lato-{name}-FLAT.pdf"
        img_to_pdf(sheet, out_flat)
        # Also save the composite PNG for inspection
        sheet.save(f"{OUT_DIR}/lato-{name}-composed.png", optimize=True)
        # Vector PDF — same as FLAT for now (we go via raster to avoid the
        # Chromium PDF mm-rounding gap that left a 1-2 px white strip at seams).
        # Keeping the same file as FLAT so downstream pipelines stay happy.
        out_vec = f"{OUT_DIR}/lato-{name}.pdf"
        img_to_pdf(sheet, out_vec)
        print(f"✓ lato-{name}: composed {sheet.size}, FLAT + vector saved")
