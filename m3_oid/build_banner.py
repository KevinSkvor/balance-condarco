"""Genera el banner A2 vertical (420 x 594 mm) y el carrusel para Instagram.

Uso:
    python3 build_banner.py                 # banner con recuadro para el QR
    python3 build_banner.py --qr URL        # banner con el QR generado desde URL

Salidas: M3_OID_Banner_A2.pdf y post/OID_post_01..03.png (1080 x 1350 px).
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "m2_oid"))
import build_presentation as base  # noqa: E402
from build_presentation import (  # noqa: E402
    BOLD, CREAM, G1, G2, G3, G4, INK, RED, REG, canvas, pdfmetrics, rimg, spaced,
    spectrum, text, white,
)
from reportlab.lib.units import mm  # noqa: E402

base.IMG_DIR = os.path.join(HERE, "images")
base.IMAGES = {
    "mates": ["Oid_mates_Nelo_serie.png"],
    "holway": ["Oid_Holway_set.png"],
    "mate": ["Mate_Nelo.png"],
    "reel": ["Oid_reel_Puma.png"],
    "reel_sq": ["Reel_Puma_miniatura.png"],
}
base.CONTAIN = {"mates", "holway", "mate"}

AW, AH = 420 * mm, 594 * mm
MG = 10 * mm          # margen de seguridad pedido por la cátedra
PAD = 24 * mm         # aire editorial interno


def qr_block(c, x, y, s, url):
    if url:
        from reportlab.graphics import renderPDF
        from reportlab.graphics.barcode.qr import QrCodeWidget
        from reportlab.graphics.shapes import Drawing
        w = QrCodeWidget(url, barBorder=0)
        x0, y0, x1, y1 = w.getBounds()
        d = Drawing(s, s, transform=[s / (x1 - x0), 0, 0, s / (y1 - y0), 0, 0])
        d.add(w)
        c.setFillColor(white)
        c.roundRect(x - 8, y - 8, s + 16, s + 16, 8, stroke=0, fill=1)  # zona de silencio
        renderPDF.draw(d, c, x, y)
    else:
        c.setStrokeColor(G2)
        c.setDash(6, 5)
        c.setLineWidth(1.5)
        c.roundRect(x, y, s, s, 10, stroke=1, fill=0)
        c.setDash()
        text(c, "QR", x + s / 2, y + s / 2 + 2, size=26, font=BOLD, color=G2, align="center")
        text(c, "portfolio", x + s / 2, y + s / 2 - 22, size=12, color=G2, align="center")


def banner(url=None):
    out = os.path.join(HERE, "M3_OID_Banner_A2.pdf")
    c = canvas.Canvas(out, pagesize=(AW, AH))
    c.setTitle("OID — Banner A2")
    c.setAuthor("Kevin Skvor")
    c.setFillColor(CREAM)
    c.rect(0, 0, AW, AH, stroke=0, fill=1)
    L, Rr = PAD, AW - PAD
    wcol = Rr - L

    # cabecera oscura
    top_h = 520
    c.setFillColor(INK)
    c.rect(0, AH - top_h, AW, top_h, stroke=0, fill=1)
    c.setFillColor(RED)
    c.rect(L, AH - PAD - 6, 40, 6, stroke=0, fill=1)
    spaced(c, "Proyecto Integrador  ·  Historia y Tendencias del Diseño II", L + 56, AH - PAD - 8,
           size=13, color=G2, tracking=2)
    y = text(c, "ORDÓÑEZ\nINDUSTRIAL DESIGN", L, AH - PAD - 110, size=92, font=BOLD,
             color=white, leading=94)
    text(c, "Entre el taller y la estrategia", L, y - 24, size=44, color=G3)
    text(c, "Modernidad y posmodernidad en el diseño industrial argentino · 2001–2026",
         L, y - 74, size=19, color=G2)

    # imagen protagonista
    hy, hh = 750, AH - top_h - 40 - 750
    rimg(c, "mates", L, hy, wcol, hh, r=28, pad=0.03)

    # hallazgo
    text(c, "El objeto es moderno.", L, 680, size=60, font=BOLD)
    text(c, "El discurso es posmoderno.", L, 612, size=60, font=BOLD, color=RED)
    text(c, "OID mantiene la racionalidad moderna en sus productos y adopta lógicas "
            "posmodernas en la comunicación, la marca y la gestión global de la producción.",
         L, 566, size=18, color=G1, width=wcol * 0.85, leading=24)

    # tres casos
    gap = 24
    cw = (wcol - 2 * gap) / 3
    cases = [("reel", "2007", "Reel Puma", "La técnica se vuelve imagen", 0.5),
             ("mate", "2016", "Mate Nelo", "La tradición se vuelve marca", 0.72),
             ("holway", "2023", "Holway", "La buena forma, premiada", 0.28)]
    spaced(c, "Capítulo 3  ·  Corpus de análisis", L, 500, size=12, color=RED, tracking=2)
    for i, (key, yr, name, line, pos) in enumerate(cases):
        x = L + i * (cw + gap)
        rimg(c, key, x, 330, cw, 150, r=20)
        text(c, yr, x, 302, size=16, font=BOLD, color=RED)
        text(c, name, x + 50, 302, size=20, font=BOLD)
        text(c, line, x, 278, size=14, color=G1)
        spectrum(c, x + 4, 252, cw - 8, pos, left="Moderno", right="Posmoderno")

    # rótulo
    c.setStrokeColor(G3)
    c.setLineWidth(1)
    c.line(L, 212, Rr, 212)
    qs = 140
    qr_block(c, Rr - qs, 52, qs, url)
    rows = [("Estudiante", "Kevin Skvor  ·  Legajo 0136840"),
            ("Materia", "Historia y Tendencias del Diseño II"),
            ("Cátedra", "Prof. Gastón Girod"),
            ("Carrera", "Licenciatura en Diseño Industrial  ·  Universidad de Palermo  ·  2026")]
    yy = 178
    for k, v in rows:
        spaced(c, k, L, yy, size=10, color=G2, tracking=1.6)
        text(c, v, L + 120, yy, size=15, font=BOLD if k == "Estudiante" else REG)
        yy -= 34
    text(c, "Imágenes: Oid (2024). Folleto institucional.", L, MG + 22, size=9, color=G2)
    c.save()
    print("OK ->", out)


def post():
    """Carrusel de 3 imágenes 1080 x 1350 px para el feed del portfolio."""
    d = os.path.join(HERE, "post")
    os.makedirs(d, exist_ok=True)
    PW, PH = 1080, 1350
    pdf = os.path.join(d, "post.pdf")
    c = canvas.Canvas(pdf, pagesize=(PW, PH))
    L = 80

    # 1 · portada
    c.setFillColor(INK)
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    rimg(c, "mates", L, 560, PW - 2 * L, 680, r=32, pad=0.04, dark=True)
    c.setFillColor(RED)
    c.rect(L, 470, 60, 6, stroke=0, fill=1)
    text(c, "ORDÓÑEZ INDUSTRIAL DESIGN", L, 400, size=54, font=BOLD, color=white)
    text(c, "Entre el taller y la estrategia", L, 340, size=40, color=G3)
    text(c, "Proyecto Integrador · Historia y Tendencias del Diseño II", L, 160, size=22, color=G2)
    text(c, "Kevin Skvor · UP 2026", L, 120, size=22, font=BOLD, color=G3)
    text(c, "1 / 3", PW - L, 120, size=22, color=G2, align="right")
    c.showPage()

    # 2 · casos
    c.setFillColor(CREAM)
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    spaced(c, "Tres productos, tres momentos", L, PH - 120, size=20, color=RED, tracking=2)
    cases = [("reel_sq", "2007", "Reel Puma", "La técnica se vuelve imagen"),
             ("mate", "2016", "Mate Nelo", "La tradición se vuelve marca"),
             ("holway", "2023", "Holway", "La buena forma, premiada")]
    y = PH - 180
    for key, yr, name, line in cases:
        y -= 330
        rimg(c, key, L, y, 420, 310, r=26)
        text(c, yr, L + 470, y + 220, size=30, font=BOLD, color=RED)
        text(c, name, L + 470, y + 160, size=46, font=BOLD)
        text(c, line, L + 470, y + 110, size=26, color=G1, width=440, leading=32)
    text(c, "2 / 3", PW - L, 60, size=22, color=G2, align="right")
    c.showPage()

    # 3 · hallazgo
    c.setFillColor(RED)
    c.rect(0, 0, PW, PH, stroke=0, fill=1)
    text(c, "El objeto\nes moderno.", L, 960, size=96, font=BOLD, color=white, leading=100)
    text(c, "El discurso\nes posmoderno.", L, 700, size=96, font=BOLD, color=INK, leading=100)
    text(c, "Un estudio argentino que mantiene la buena forma en sus productos "
            "y adopta lógicas posmodernas en la marca y la gestión global.",
         L, 390, size=30, color=white, width=PW - 2 * L, leading=40)
    text(c, "Kevin Skvor · Historia y Tendencias del Diseño II · UP", L, 120, size=22, color=white)
    text(c, "3 / 3", PW - L, 120, size=22, color=white, align="right")
    c.save()

    subprocess.run(["pdftoppm", "-r", "72", "-png", pdf, os.path.join(d, "OID_post")], check=True)
    os.remove(pdf)
    for i in (1, 2, 3):
        src = os.path.join(d, f"OID_post-{i}.png")
        os.replace(src, os.path.join(d, f"OID_post_0{i}.png"))
    print("OK ->", d)


if __name__ == "__main__":
    url = sys.argv[sys.argv.index("--qr") + 1] if "--qr" in sys.argv else None
    banner(url)
    post()
