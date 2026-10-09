"""Genera M2_OID_Presentacion_Rediseño.pdf — Proyecto Integrador M2 sobre OID.

Uso:
    python3 build_presentation.py

Las imágenes se buscan en ./images. Si una imagen no está, se dibuja un marco
redondeado con el nombre de archivo esperado, para poder reemplazarlo luego:
basta con copiar el archivo a ./images y volver a ejecutar el script.
"""
import os

from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(HERE, "images")
OUT = os.path.join(HERE, "M2_OID_Presentacion_Rediseño.pdf")

# 4:3 — 960 x 720 pt (escala a 1920 x 1440 px sin pérdida: es vectorial)
W, H = 960, 720
M = 64  # margen

# Paleta
CREAM = HexColor("#F5F5F5")
INK = HexColor("#1A1A1A")
RED = HexColor("#C63030")
G1 = HexColor("#4A4A4A")
G2 = HexColor("#8A8A8A")
G3 = HexColor("#D6D6D6")
G4 = HexColor("#E8E8E8")
R = 18  # radio de bordes de imágenes

TOTAL = 12

# Tipografía: Liberation Sans (métrica idéntica a Arial) embebida; si no está, Helvetica.
_LIB = "/usr/share/fonts/truetype/liberation"
try:
    pdfmetrics.registerFont(TTFont("Sans", os.path.join(_LIB, "LiberationSans-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Sans-Bold", os.path.join(_LIB, "LiberationSans-Bold.ttf")))
    REG, BOLD = "Sans", "Sans-Bold"
except Exception:
    REG, BOLD = "Helvetica", "Helvetica-Bold"

# Imágenes: clave -> nombres candidatos (el primero que exista se usa)
IMAGES = {
    "holway": ["Holway_Antropometricos.png", "Holway_Antropometricos.jpg"],
    "mate": ["Mate_Nelo.png", "1790977233178_image.png", "Mate_Nelo.jpg"],
    "reel": ["Reel_Puma.png", "Reel_Puma.jpg"],
    "reel_h": ["Reel_Puma_miniatura.png", "Reel_Puma_horizontal.png"],
    "futbolin": ["Futbolin.png", "Futbolín.png", "Futbolin.jpg"],
    "produccion": ["OID_Produccion.jpg", "OID_Produccion.png"],
}

# Fotos de producto sobre fondo liso: se muestran completas ("contain") sobre
# el color de fondo de la propia imagen, en lugar de recortarse.
CONTAIN = {"holway", "mate"}


# ---------------------------------------------------------------- utilidades

def find_image(key):
    for name in IMAGES[key]:
        path = os.path.join(IMG_DIR, name)
        if os.path.exists(path):
            return path
    return None


def rimg(c, key, x, y, w, h, r=R, dark=False, pad=0.08):
    """Imagen con bordes redondeados: 'cover' o 'contain' (o placeholder)."""
    path = find_image(key)
    c.saveState()
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    c.clipPath(p, stroke=0, fill=0)
    if path:
        img = ImageReader(path)
        iw, ih = img.getSize()
        if key in CONTAIN:
            r_, g_, b_ = img.getRGBData()[:3]
            c.setFillColorRGB(r_ / 255, g_ / 255, b_ / 255)
            c.rect(x, y, w, h, stroke=0, fill=1)
            s = min(w * (1 - 2 * pad) / iw, h * (1 - 2 * pad) / ih)
        else:
            s = max(w / iw, h / ih)
        dw, dh = iw * s, ih * s
        c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    else:
        c.setFillColor(HexColor("#2A2A2A") if dark else G4)
        c.rect(x, y, w, h, stroke=0, fill=1)
        # pictograma de imagen
        cx, cy = x + w / 2, y + h / 2 + 10
        c.setStrokeColor(G2)
        c.setLineWidth(1.4)
        c.roundRect(cx - 22, cy - 16, 44, 32, 5, stroke=1, fill=0)
        c.circle(cx - 9, cy + 5, 4, stroke=1, fill=0)
        p2 = c.beginPath()
        p2.moveTo(cx - 20, cy - 13)
        p2.lineTo(cx - 4, cy + 1)
        p2.lineTo(cx + 6, cy - 7)
        p2.lineTo(cx + 20, cy + 6)
        c.drawPath(p2, stroke=1, fill=0)
        c.setFillColor(G2)
        c.setFont(REG, 10)
        c.drawCentredString(cx, cy - 34, IMAGES[key][0])
    c.restoreState()


def text(c, s, x, y, size=16, font=None, color=INK, width=None, leading=None,
         align="left"):
    """Texto con ajuste de línea. Devuelve la y de la línea siguiente."""
    font = font or REG
    leading = leading or size * 1.3
    lines = simpleSplit(s, font, size, width) if width else s.split("\n")
    c.setFont(font, size)
    c.setFillColor(color)
    for line in lines:
        if align == "center":
            c.drawCentredString(x, y, line)
        elif align == "right":
            c.drawRightString(x, y, line)
        else:
            c.drawString(x, y, line)
        y -= leading
    return y


def spaced(c, s, x, y, size=10, font=None, color=G2, tracking=1.6):
    """Texto en versalitas espaciadas (rótulos)."""
    font = font or BOLD
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(tracking)
    t.setFillColor(color)
    t.textOut(s.upper())
    t.setCharSpace(0)  # no propagar el tracking al resto del texto
    c.drawText(t)


def pill(c, s, x, y, fill=INK, fg=white, size=10, pad=10, h=22):
    w = pdfmetrics.stringWidth(s, BOLD, size) + pad * 2
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, h / 2, stroke=0, fill=1)
    c.setFillColor(fg)
    c.setFont(BOLD, size)
    c.drawString(x + pad, y + (h - size) / 2 + 2, s)
    return w


def outline_pill(c, s, x, y, color=G1, size=11, pad=12, h=26):
    w = pdfmetrics.stringWidth(s, REG, size) + pad * 2
    c.setStrokeColor(G3)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, h / 2, stroke=1, fill=0)
    c.setFillColor(color)
    c.setFont(REG, size)
    c.drawString(x + pad, y + (h - size) / 2 + 2, s)
    return w


def page(c, n, section, dark=False):
    """Fondo + cromado editorial común (rótulo, folio, regla)."""
    c.setFillColor(INK if dark else CREAM)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    fg = G2
    c.setFillColor(RED)
    c.rect(M, H - 40, 18, 3, stroke=0, fill=1)
    spaced(c, "OID  ·  " + section, M + 28, H - 42, size=9, color=fg, tracking=1.4)
    c.setFont(BOLD, 9)
    c.setFillColor(fg)
    c.drawRightString(W - M, H - 42, f"{n:02d} / {TOTAL:02d}")
    c.setFont(REG, 8)
    c.drawString(M, 30, "Historia y Tendencias del Diseño  ·  Proyecto Integrador  ·  M2 2026")
    c.drawRightString(W - M, 30, "Universidad de Palermo")


def title(c, s, y=H - 110, size=36, color=INK, x=M, width=None):
    return text(c, s, x, y, size=size, font=BOLD, color=color,
                width=width or W - 2 * M, leading=size * 1.12)


def spectrum(c, x, y, w, pos, left="Modernidad", right="Posmodernidad"):
    """Escala Modernidad ↔ Posmodernidad con marcador en 'pos' (0..1)."""
    c.setStrokeColor(G3)
    c.setLineWidth(2)
    c.line(x, y, x + w, y)
    c.setFillColor(G3)
    c.circle(x, y, 3, stroke=0, fill=1)
    c.circle(x + w, y, 3, stroke=0, fill=1)
    c.setStrokeColor(RED)
    c.setLineWidth(3)
    c.line(x + w / 2, y, x + w * pos, y)
    c.setFillColor(RED)
    c.circle(x + w * pos, y, 7, stroke=0, fill=1)
    c.setFillColor(white)
    c.circle(x + w * pos, y, 2.5, stroke=0, fill=1)
    c.setFillColor(G1)
    c.setFont(REG, 10)
    c.drawString(x, y - 20, left)
    c.drawRightString(x + w, y - 20, right)


# --------------------------------------------------------------- pictogramas

def icon(c, kind, cx, cy, s=18, color=INK):
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(2)
    c.setLineCap(1)
    c.setLineJoin(1)
    if kind == "search":
        c.circle(cx - 3, cy + 3, s * 0.5, stroke=1, fill=0)
        c.line(cx + s * 0.32, cy - s * 0.32, cx + s * 0.75, cy - s * 0.75)
    elif kind == "idea":
        c.circle(cx, cy + 3, s * 0.55, stroke=1, fill=0)
        c.line(cx - 6, cy - s * 0.6, cx + 6, cy - s * 0.6)
        c.line(cx - 4, cy - s * 0.85, cx + 4, cy - s * 0.85)
        c.circle(cx, cy + 3, 2.5, stroke=0, fill=1)
    elif kind == "sketch":
        p = c.beginPath()
        p.moveTo(cx - s * 0.7, cy - s * 0.7)
        p.lineTo(cx - s * 0.55, cy - s * 0.25)
        p.lineTo(cx + s * 0.45, cy + s * 0.75)
        p.lineTo(cx + s * 0.75, cy + s * 0.45)
        p.lineTo(cx - s * 0.25, cy - s * 0.55)
        p.close()
        c.drawPath(p, stroke=1, fill=0)
    elif kind == "proto":
        a = s * 0.7
        p = c.beginPath()
        p.moveTo(cx, cy + a)
        p.lineTo(cx + a, cy + a / 2)
        p.lineTo(cx + a, cy - a / 2)
        p.lineTo(cx, cy - a)
        p.lineTo(cx - a, cy - a / 2)
        p.lineTo(cx - a, cy + a / 2)
        p.close()
        c.drawPath(p, stroke=1, fill=0)
        c.line(cx - a, cy + a / 2, cx, cy)
        c.line(cx + a, cy + a / 2, cx, cy)
        c.line(cx, cy, cx, cy - a)
    elif kind == "globe":
        c.circle(cx, cy, s * 0.7, stroke=1, fill=0)
        c.ellipse(cx - s * 0.3, cy - s * 0.7, cx + s * 0.3, cy + s * 0.7, stroke=1, fill=0)
        c.line(cx - s * 0.7, cy, cx + s * 0.7, cy)
    elif kind == "arrow":
        c.line(cx - s, cy, cx + s, cy)
        c.line(cx + s - 8, cy + 7, cx + s, cy)
        c.line(cx + s - 8, cy - 7, cx + s, cy)
    elif kind == "check":
        p = c.beginPath()
        p.moveTo(cx - s * 0.45, cy)
        p.lineTo(cx - s * 0.1, cy - s * 0.35)
        p.lineTo(cx + s * 0.5, cy + s * 0.35)
        c.drawPath(p, stroke=1, fill=0)
    c.restoreState()


# -------------------------------------------------------------------- slides

def s01_portada(c):
    page(c, 1, "Proyecto Integrador · M2", dark=True)
    # imagen protagonista a la derecha
    rimg(c, "holway", 470, 70, 426, 580, dark=True, pad=0.06)
    spaced(c, "Historia y Tendencias del Diseño", M, 520, size=10, color=G2)
    y = text(c, "ORDÓÑEZ\nINDUSTRIAL\nDESIGN", M, 470, size=50, font=BOLD,
             color=white, leading=52)
    c.setFillColor(RED)
    c.rect(M, y - 4, 56, 4, stroke=0, fill=1)
    text(c, "Entre el Taller\ny la Estrategia", M, y - 52, size=28, color=G3, leading=34)
    text(c, "Modernidad y posmodernidad en el diseño\nindustrial argentino · 2001–2026",
         M, 150, size=12, color=G2, leading=17)
    text(c, "Kevin Skvor  ·  Prof. Gaston Girod", M, 100, size=11, font=BOLD, color=G3)


def s02_pregunta(c):
    page(c, 2, "Pregunta central")
    spaced(c, "Problema de investigación", M, H - 110, color=RED)
    text(c, "¿Cómo articula OID la herencia moderna del taller con las lógicas "
            "posmodernas de la estrategia, la identidad y el mercado global?",
         M, H - 160, size=30, font=BOLD, width=380, leading=36)
    text(c, "Objeto de estudio: Ordóñez Industrial Design (Argentina, 2001–2026).",
         M, 170, size=13, color=G1, width=400)

    # Diagrama de Venn
    cx, cy, rr = 700, 350, 150
    c.saveState()
    c.setStrokeColor(INK)
    c.setLineWidth(2)
    c.setFillColor(INK)
    c.setFillAlpha(0.06)
    c.circle(cx - 85, cy, rr, stroke=1, fill=1)
    c.setStrokeColor(G2)
    c.setDash(5, 5)
    c.circle(cx + 85, cy, rr, stroke=1, fill=0)
    c.restoreState()
    # intersección
    c.saveState()
    p = c.beginPath()
    p.circle(cx - 85, cy, rr)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(RED)
    c.circle(cx + 85, cy, rr, stroke=0, fill=1)
    c.restoreState()
    text(c, "OID", cx, cy - 8, size=26, font=BOLD, color=white, align="center")
    text(c, "Modernidad", cx - 150, cy + 20, size=14, font=BOLD, align="center")
    text(c, "función · sistema\nindustria · oficio", cx - 150, cy - 4, size=11,
         color=G1, align="center", leading=15)
    text(c, "Posmodernidad", cx + 150, cy + 20, size=14, font=BOLD, align="center")
    text(c, "identidad · relato\nmarca · global", cx + 150, cy - 4, size=11,
         color=G1, align="center", leading=15)
    text(c, "Par dialéctico", cx, cy - rr - 40, size=10, color=G2, align="center")


def s03_timeline(c):
    page(c, 3, "Trayectoria")
    title(c, "OID 2001–2026: veinticinco años de diseño")
    y0 = 430
    x0, x1 = M + 20, W - M - 20
    c.setStrokeColor(G3)
    c.setLineWidth(2)
    c.line(x0, y0, x1, y0)
    milestones = [
        ("2001", "Fundación", "Taller y\nprimeros encargos"),
        ("2002–09", "Oficio", "Producción local,\nprototipo manual"),
        ("2010–19", "Consolidación", "Productos propios\ny Reel Puma (2015)"),
        ("2020–25", "Expansión", "Estrategia, marca\ny proyección global"),
        ("2026", "Hoy", "Estudio entre\ntaller y estrategia"),
    ]
    step = (x1 - x0) / (len(milestones) - 1)
    for i, (yr, name, desc) in enumerate(milestones):
        x = x0 + i * step
        last = i in (0, len(milestones) - 1)
        c.setFillColor(RED if last else INK)
        c.circle(x, y0, 9 if last else 6, stroke=0, fill=1)
        up = i % 2 == 0
        text(c, yr, x, y0 + (58 if up else -40), size=26 if last else 20, font=BOLD,
             color=RED if last else INK, align="center")
        text(c, name, x, y0 + (36 if up else -60), size=12, font=BOLD, align="center")
        text(c, desc, x, (y0 + 120) if up else (y0 - 80), size=10, color=G1,
             align="center", leading=13)
    # tira de productos
    tw, th, gap = 262, 150, 22
    ty = 70
    spaced(c, "Productos emblemáticos", M, ty + th + 18, size=9)
    for i, key in enumerate(["holway", "mate", "reel_h"]):
        rimg(c, key, M + i * (tw + gap), ty, tw, th)


def product(c, n, key, num, name, kicker, chips, reading, pos):
    page(c, n, f"Producto {num}")
    rimg(c, key, M, 70, 500, 560)
    x = M + 540
    wcol = W - M - x
    spaced(c, f"Producto {num} / 03", x, 600, color=RED)
    y = text(c, name, x, 560, size=40, font=BOLD, width=wcol, leading=42)
    y = text(c, kicker, x, y - 4, size=14, color=G1, width=wcol, leading=19)
    y -= 10
    cy = y
    cx = x
    for ch in chips:
        w = pdfmetrics.stringWidth(ch, REG, 11) + 24
        if cx + w > W - M:
            cx = x
            cy -= 34
        outline_pill(c, ch, cx, cy - 18, size=11)
        cx += w + 8
    y = cy - 60
    spaced(c, "Lectura", x, y, size=9)
    text(c, reading, x, y - 22, size=13, width=wcol, leading=18)
    spaced(c, "Posición en el par dialéctico", x, 175, size=9)
    spectrum(c, x, 140, wcol, pos)


def s04_holway(c):
    product(c, 4, "holway", "01", "Holway",
            "Equipamiento antropométrico: instrumentos para medir el cuerpo.",
            ["Ergonomía", "Medida", "Serie", "Función"],
            "La forma nace de la medida del usuario: un gesto moderno de "
            "racionalidad y estandarización.", 0.25)


def s05_mate(c):
    product(c, 5, "mate", "02", "Mate Nelo",
            "Un ritual cotidiano argentino reinterpretado como objeto de diseño.",
            ["Identidad", "Ritual", "Relato", "Local"],
            "El valor está en el significado cultural: el objeto narra un "
            "territorio. Lectura posmoderna con oficio moderno.", 0.75)


def s06_reel(c):
    product(c, 6, "reel", "03", "Reel Puma",
            "Reel de pesca con mosca premiado por su innovación. "
            "Cliente: Correntoso, 2015.",
            ["Aluminio CNC", "Sistema de freno", "Innovación", "Premiado"],
            "El gran vaciado central exhibe el mecanismo y rompe los códigos "
            "estéticos del rubro: la técnica se vuelve imagen.", 0.5)


def s07_comparativa(c):
    page(c, 7, "Marco teórico")
    title(c, "Modernidad vs. Posmodernidad")
    top, bot = 560, 80
    cw = (W - 2 * M - 80) / 2
    lx, rx = M, M + cw + 80
    c.setFillColor(INK)
    c.roundRect(lx, bot, cw, top - bot, R, stroke=0, fill=1)
    c.setStrokeColor(G3)
    c.setLineWidth(1.2)
    c.setFillColor(white)
    c.roundRect(rx, bot, cw, top - bot, R, stroke=1, fill=1)
    spaced(c, "Modernidad", lx + 32, top - 44, size=12, color=G3)
    spaced(c, "Posmodernidad", rx + 32, top - 44, size=12, color=RED)
    rows = [
        ("Función", "Significado"),
        ("Estandarización", "Diferenciación"),
        ("Universal", "Local / identitario"),
        ("Industria", "Marca y relato"),
        ("La forma sigue a la función", "La forma sigue a la emoción"),
    ]
    rh = (top - bot - 90) / len(rows)
    for i, (a, b) in enumerate(rows):
        y = top - 100 - i * rh
        text(c, a, lx + 32, y, size=18, font=BOLD, color=white, width=cw - 64)
        text(c, b, rx + 32, y, size=18, font=BOLD, color=INK, width=cw - 64)
        if i < len(rows) - 1:
            c.setLineWidth(0.6)
            c.setStrokeColor(G1)
            c.line(lx + 32, y - rh / 2 + 6, lx + cw - 32, y - rh / 2 + 6)
            c.setStrokeColor(G4)
            c.line(rx + 32, y - rh / 2 + 6, rx + cw - 32, y - rh / 2 + 6)
    # nodo OID
    mx = M + cw + 40
    c.setFillColor(RED)
    c.circle(mx, (top + bot) / 2, 30, stroke=0, fill=1)
    text(c, "OID", mx, (top + bot) / 2 - 6, size=16, font=BOLD, color=white,
         align="center")
    text(c, "Sullivan (1896)  ·  Venturi (1966)  ·  Lyotard (1979)", M, 56,
         size=9, color=G2)


def s08_metodologia(c):
    page(c, 8, "Metodología")
    title(c, "Metodología OID en 5 fases")
    phases = [
        ("search", "Investigar", "Usuario, contexto\ny mercado"),
        ("idea", "Conceptualizar", "Idea rectora\ny relato"),
        ("sketch", "Bocetar", "Exploración\nformal"),
        ("proto", "Prototipar", "Taller, prueba\ny ajuste"),
        ("globe", "Producir", "Industria\ny lanzamiento"),
    ]
    gap = 16
    cw = (W - 2 * M - gap * 4) / 5
    y, h = 170, 340
    for i, (ic, name, desc) in enumerate(phases):
        x = M + i * (cw + gap)
        accent = i == 3
        c.setFillColor(INK if accent else white)
        c.setStrokeColor(G3)
        c.setLineWidth(1)
        c.roundRect(x, y, cw, h, R, stroke=0 if accent else 1, fill=1)
        fg = white if accent else INK
        text(c, f"{i + 1:02d}", x + 20, y + h - 60, size=40, font=BOLD,
             color=RED)
        icon(c, ic, x + cw / 2, y + h / 2 + 10, s=24, color=fg)
        text(c, name, x + 20, y + 90, size=16, font=BOLD, color=fg)
        text(c, desc, x + 20, y + 64, size=11, color=G3 if accent else G1, leading=15)
        if i < 4:
            c.setFillColor(RED)
            c.circle(x + cw + gap / 2, y + h / 2, 3, stroke=0, fill=1)
    text(c, "El prototipo de taller sigue siendo el corazón del proceso.",
         M, 110, size=14, color=G1)


def s09_evolucion(c):
    page(c, 9, "Evolución metodológica")
    title(c, "Del taller a la estrategia")
    cw, ch = 360, 330
    y = 170
    cards = [
        (M, INK, white, G3, "ANTES · TALLER", "Oficio",
         "Intuición, oficio y\nprototipo manual", ["sketch", "proto"]),
        (W - M - cw, RED, white, white, "HOY · ESTRATEGIA", "Sistema",
         "Investigación, sistema\ny visión de marca", ["search", "globe"]),
    ]
    for x, bg, fg, sub, tag, word, desc, icons in cards:
        c.setFillColor(bg)
        c.roundRect(x, y, cw, ch, R, stroke=0, fill=1)
        pill(c, tag, x + 24, y + ch - 46, fill=white, fg=INK)
        for j, ic in enumerate(icons):
            icon(c, ic, x + 52 + j * 70, y + ch - 120, s=26, color=fg)
        text(c, word, x + 24, y + 110, size=44, font=BOLD, color=fg)
        text(c, desc, x + 24, y + 70, size=15, color=sub, leading=20)
    icon(c, "arrow", W / 2, y + ch / 2, s=34, color=RED)
    # barra de progresión
    by = 96
    steps = ["Oficio", "Proceso", "Método", "Estrategia"]
    bw = (W - 2 * M) / len(steps)
    for i, s in enumerate(steps):
        shade = [G3, G2, G1, RED][i]
        c.setFillColor(shade)
        c.roundRect(M + i * bw + 2, by, bw - 4, 8, 4, stroke=0, fill=1)
        text(c, s, M + i * bw + 2, by - 20, size=11, font=BOLD,
             color=RED if i == 3 else G1)


def s10_produccion(c):
    page(c, 10, "Producción")
    title(c, "Producción: de lo local a lo global")
    cx, cy = 236, 330
    rings = [
        (172, "Mercado global", G4),
        (130, "Latinoamérica", HexColor("#DEDEDE")),
        (88, "Argentina", G3),
        (44, "Taller", INK),
    ]
    for rr, _, col in rings:
        c.setFillColor(col)
        c.circle(cx, cy, rr, stroke=0, fill=1)
    c.setFillColor(RED)
    c.circle(cx, cy, 7, stroke=0, fill=1)
    text(c, "Taller", cx, cy - 24, size=10, font=BOLD, color=white, align="center")
    for rr, label, _ in rings[:3]:
        text(c, label, cx, cy + rr - 20, size=10, font=BOLD, color=G1, align="center")
    c.setStrokeColor(RED)
    c.setLineWidth(2)
    e = 128
    c.line(cx + 10, cy + 10, cx + e, cy + e)
    c.line(cx + e, cy + e, cx + e - 11, cy + e)
    c.line(cx + e, cy + e, cx + e, cy + e - 11)
    # foto de planta
    ix, iw = 450, W - M - 450
    ih = iw * 0.62
    iy = 560 - ih
    rimg(c, "produccion", ix, iy, iw, ih)
    pill(c, "TALLER OID", ix + 16, iy + ih - 38, fill=white, fg=INK)
    items = [
        ("01", "Origen", "Prototipo y\noficio en taller"),
        ("02", "Escala", "Industria y\nproveedores"),
        ("03", "Proyección", "Marca pensada\npara el mundo"),
    ]
    colw = iw / 3
    for i, (num, h, d) in enumerate(items):
        x = ix + i * colw
        text(c, num, x, 200, size=20, font=BOLD, color=RED)
        text(c, h, x, 172, size=15, font=BOLD)
        text(c, d, x, 150, size=11, color=G1, leading=15)


def s11_conclusion(c):
    page(c, 11, "Conclusión")
    title(c, "Articular tensiones, no resolverlas", width=400)
    pairs = [("Taller", "Estrategia"), ("Local", "Global"), ("Función", "Identidad")]
    x, w = M, 360
    y = 440
    for a, b in pairs:
        c.setStrokeColor(G3)
        c.setLineWidth(2)
        c.line(x + 92, y + 5, x + w - 104, y + 5)
        c.setFillColor(RED)
        c.circle(x + (w - 12) / 2, y + 5, 7, stroke=0, fill=1)
        text(c, a, x, y, size=17, font=BOLD)
        text(c, b, x + w, y, size=17, font=BOLD, align="right")
        y -= 70
    text(c, "OID opera en el punto medio: oficio moderno al servicio de "
            "un relato posmoderno.", M, 190, size=17, color=INK, width=380,
         leading=23)
    ix, iw = 470, W - M - 470
    ih = iw * 863 / 1112
    rimg(c, "futbolin", ix, 340 - ih / 2 + 20, iw, ih)
    text(c, "Futbolín OID: madera, acero y juego.", ix, 340 - ih / 2, size=10,
         color=G2)


def s12_m3(c):
    page(c, 12, "Próximos pasos")
    title(c, "Hacia M3")
    steps = [
        ("M2", "Introducción,\nCapítulos 1 y 2", True),
        ("Cap. 3", "Análisis de\ncasos OID", False),
        ("Campo", "Entrevista\nal estudio", False),
        ("Cierre", "Conclusión\ny revisión APA", False),
        ("M3", "Entrega\nfinal", False),
    ]
    x0, x1, y = M + 50, W - M - 50, 380
    c.setStrokeColor(G3)
    c.setLineWidth(2)
    c.line(x0, y, x1, y)
    c.setStrokeColor(RED)
    c.setLineWidth(3)
    step = (x1 - x0) / (len(steps) - 1)
    c.line(x0, y, x0 + step * 0.5, y)
    for i, (h, d, done) in enumerate(steps):
        x = x0 + i * step
        if done:
            c.setFillColor(RED)
            c.circle(x, y, 22, stroke=0, fill=1)
            icon(c, "check", x, y, s=20, color=white)
        else:
            c.setFillColor(CREAM)
            c.setStrokeColor(INK if i == len(steps) - 1 else G2)
            c.setLineWidth(2)
            c.circle(x, y, 22, stroke=1, fill=1)
            text(c, str(i), x, y - 6, size=16, font=BOLD, color=INK, align="center")
        text(c, h, x, y + 46, size=18, font=BOLD, color=RED if done else INK,
             align="center")
        text(c, d, x, y - 56, size=12, color=G1, align="center", leading=16)
    text(c, "Gracias.", M, 140, size=40, font=BOLD)
    text(c, "Preguntas y devoluciones", M, 108, size=14, color=G2)


def build():
    c = canvas.Canvas(OUT, pagesize=(W, H))
    c.setTitle("Ordóñez Industrial Design — Entre el Taller y la Estrategia")
    c.setAuthor("Proyecto Integrador M2 · Historia y Tendencias del Diseño")
    for fn in [s01_portada, s02_pregunta, s03_timeline, s04_holway, s05_mate,
               s06_reel, s07_comparativa, s08_metodologia, s09_evolucion,
               s10_produccion, s11_conclusion, s12_m3]:
        fn(c)
        c.showPage()
    c.save()
    missing = [v[0] for k, v in IMAGES.items() if not find_image(k)]
    print("OK ->", OUT)
    if missing:
        print("Imágenes faltantes (placeholder):", ", ".join(missing))


if __name__ == "__main__":
    build()
