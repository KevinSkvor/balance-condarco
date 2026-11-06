"""Genera M3_OID_Presentacion.pdf — Proyecto Integrador M3 sobre OID.

Reutiliza el sistema visual del M2 (../m2_oid/build_presentation.py): misma
paleta, tipografía, cromado y helpers. Uso:
    python3 build_presentation_m3.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "m2_oid"))
import build_presentation as base  # noqa: E402
from build_presentation import (  # noqa: E402
    BOLD, CREAM, G1, G2, G3, G4, H, INK, M, R, RED, REG, W, HexColor, canvas,
    icon, outline_pill, pdfmetrics, pill, rimg, spaced, spectrum, text, title, white,
)

base.IMG_DIR = os.path.join(HERE, "images")
base.IMAGES = {
    "mates": ["Oid_mates_Nelo_serie.png"],
    "holway": ["Holway_Antropometricos.png"],
    "holway_set": ["Oid_Holway_set.png"],
    "mate": ["Mate_Nelo.png"],
    "reel": ["Reel_Puma_miniatura.png"],
    "reel_v": ["Reel_Puma.png"],
}
base.CONTAIN = {"mates", "holway", "holway_set", "mate"}
OUT = os.path.join(HERE, "M3_OID_Presentacion.pdf")
TOTAL = 12


def page(c, n, section, dark=False):
    c.setFillColor(INK if dark else CREAM)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(RED)
    c.rect(M, H - 40, 18, 3, stroke=0, fill=1)
    spaced(c, "OID  ·  " + section, M + 28, H - 42, size=9, color=G2, tracking=1.4)
    c.setFont(BOLD, 9)
    c.setFillColor(G2)
    c.drawRightString(W - M, H - 42, f"{n:02d} / {TOTAL:02d}")
    c.setFont(REG, 8)
    c.drawString(M, 30, "Historia y Tendencias del Diseño  ·  Proyecto Integrador  ·  M3 2026")
    c.drawRightString(W - M, 30, "Kevin Skvor  ·  Universidad de Palermo")


def source(c, s, x=M, y=56, color=G2):
    text(c, "Fuente: " + s, x, y, size=8.5, color=color)


# -------------------------------------------------------------------- slides

def s01_portada(c):
    page(c, 1, "Proyecto Integrador · M3", dark=True)
    rimg(c, "mates", 470, 70, 426, 580, dark=True, pad=0.05)
    spaced(c, "Historia y Tendencias del Diseño", M, 520, size=10, color=G2)
    y = text(c, "ORDÓÑEZ\nINDUSTRIAL\nDESIGN", M, 470, size=50, font=BOLD, color=white, leading=52)
    c.setFillColor(RED)
    c.rect(M, y - 4, 56, 4, stroke=0, fill=1)
    text(c, "Entre el Taller\ny la Estrategia", M, y - 52, size=28, color=G3, leading=34)
    pill(c, "M3 · CAPÍTULO 3 Y CONCLUSIONES", M, 170, fill=RED)
    text(c, "Kevin Skvor  ·  Prof. Gastón Girod", M, 120, size=11, font=BOLD, color=G3)
    text(c, "Licenciatura en Diseño Industrial  ·  2026", M, 100, size=10, color=G2)


def s02_pregunta(c):
    page(c, 2, "Pregunta e hipótesis")
    spaced(c, "Pregunta guía", M, H - 110, color=RED)
    text(c, "¿Cómo articula OID la tensión entre modernidad y posmodernidad "
            "en el diseño industrial argentino (2001–2026)?",
         M, H - 150, size=28, font=BOLD, width=W - 2 * M, leading=34)
    spaced(c, "Hipótesis revisada", M, 400, color=RED)
    text(c, "No pasa de un paradigma al otro:\nlos distribuye en niveles.", M, 360,
         size=20, leading=26)
    # diagrama de capas
    x, w = 520, W - M - 520
    layers = [("DISCURSO Y GESTIÓN", "Posmoderno", RED, white, "signo · marca · servicio global"),
              ("OBJETO", "Moderno", INK, white, "función · precisión · buena forma")]
    y = 330
    for tag, name, bg, fg, sub in layers:
        c.setFillColor(bg)
        c.roundRect(x, y, w, 110, R, stroke=0, fill=1)
        spaced(c, tag, x + 24, y + 80, size=9, color=fg if bg == RED else G3)
        text(c, name, x + 24, y + 42, size=28, font=BOLD, color=fg)
        text(c, sub, x + 24, y + 20, size=11, color=fg if bg == RED else G3)
        y -= 130
    text(c, "Corrige la M2: no hay un tránsito lineal 2001 → 2026.", M, 150,
         size=12, color=G1)


def s03_emblematico(c):
    page(c, 3, "¿Por qué OID?")
    title(c, "Un caso emblemático, con fuentes")
    x0, x1, y0 = M + 20, W - M - 20, 400
    c.setStrokeColor(G3)
    c.setLineWidth(2)
    c.line(x0, y0, x1, y0)
    items = [
        ("2001", "Fundación", "Año de la crisis", "Oid (2026)", False),
        ("2007", "INNOVAR", "1.er premio, reel\nde pesca con mosca", "Oid (2024)", False),
        ("2016", "Buen Diseño", "Sello para\nMate Nelo y Mito", "Oid (2024)", False),
        ("2019", "ABC del D. I.\nLatinoamericano", "Representa\na Argentina", "Oid (2024)", False),
        ("2023", "Red Dot", "Instrumentos\nHolway", "red-dot.org", True),
    ]
    step = (x1 - x0) / (len(items) - 1)
    for i, (yr, name, desc, src, ver) in enumerate(items):
        x = x0 + i * step
        c.setFillColor(RED if ver else INK)
        c.circle(x, y0, 8 if ver else 6, stroke=0, fill=1)
        text(c, yr, x, y0 + 40, size=24, font=BOLD, color=RED if ver else INK, align="center")
        text(c, name, x, y0 - 34, size=12, font=BOLD, align="center", leading=15)
        text(c, desc, x, y0 - 70 - (15 if "\n" in name else 0), size=10, color=G1,
             align="center", leading=13)
        col = RED if ver else G2
        w = pdfmetrics.stringWidth(src, BOLD, 9.5) + 18
        c.setStrokeColor(col)
        c.setLineWidth(1)
        c.roundRect(x - w / 2, y0 + 80, w, 20, 10, stroke=1, fill=0)
        c.setFillColor(col)
        c.setFont(BOLD, 9.5)
        c.drawCentredString(x, y0 + 86.5, src)
    # nota crítica
    c.setFillColor(white)
    c.setStrokeColor(G3)
    c.roundRect(M, 80, W - 2 * M, 110, R, stroke=1, fill=1)
    spaced(c, "Distancia crítica", M + 24, 162, size=9, color=RED)
    text(c, "Solo el Red Dot se verificó con una fuente externa, que además revela un "
            "co-diseño con Rapids (Hong Kong) ausente en el folleto. La línea de tiempo "
            "institucional incluye trabajos de la UBA anteriores a la fundación (2000–2002).",
         M + 24, 138, size=12.5, width=W - 2 * M - 48, leading=17)


def s04_marco(c):
    page(c, 4, "Marco teórico corregido")
    title(c, "¿Qué es posmoderno en diseño?")
    cols = [
        ("Moderno", INK, white, G3, ["Función y buena forma", "Racionalidad productiva", "Bauhaus · Ulm"],
         "Maldonado (1993) · Bürdek (1994)"),
        ("Posmoderno histórico", RED, white, white, ["Signo, color, ironía, cita", "Doble codificación", "Radical Design · Memphis (1981)"],
         "Venturi (1966/1978) · Jencks (1977/1980)"),
        ("Contemporáneo", white, INK, G1, ["CNC · impresión 3D · IoT", "UX · sustentabilidad", "Pueden servir a la modernidad"],
         "Beducci (2015) · Battista (2015)"),
    ]
    gap = 20
    cw = (W - 2 * M - 2 * gap) / 3
    y, h = 120, 430
    for i, (name, bg, fg, sub, rows, auth) in enumerate(cols):
        x = M + i * (cw + gap)
        c.setFillColor(bg)
        c.setStrokeColor(G3)
        c.setLineWidth(1)
        c.roundRect(x, y, cw, h, R, stroke=1 if bg == white else 0, fill=1)
        text(c, name, x + 24, y + h - 50, size=20, font=BOLD, color=fg, width=cw - 48, leading=23)
        yy = y + h - 130
        for r_ in rows:
            c.setFillColor(fg if bg != white else RED)
            c.circle(x + 28, yy + 5, 3, stroke=0, fill=1)
            yy = text(c, r_, x + 40, yy, size=14, color=fg, width=cw - 64, leading=18) - 22
        c.setStrokeColor(sub)
        c.setLineWidth(0.6)
        c.line(x + 24, y + 70, x + cw - 24, y + 70)
        text(c, auth, x + 24, y + 44, size=10, color=sub, width=cw - 48, leading=13)
    text(c, "Corrección de la devolución M2: la tecnología no define lo posmoderno; lo define la dimensión comunicativa.",
         M, 86, size=11.5, color=G1, width=W - 2 * M)


def s05_metodologia(c):
    page(c, 5, "Metodología OID")
    title(c, "Las 5 fases que declara el estudio")
    phases = [
        ("idea", "Concepto", "Inmersión,\nplanificación, sprint"),
        ("sketch", "Diseño", "Forma, función,\nusabilidad, UX"),
        ("proto", "Prototipado", "Maquetas,\nensayos, validación"),
        ("search", "Desarrollo", "DFM, documentación,\ningeniería inversa"),
        ("globe", "Producción", "Gestión local\ny en China"),
    ]
    gap = 16
    cw = (W - 2 * M - gap * 4) / 5
    y, h = 170, 330
    for i, (ic, name, desc) in enumerate(phases):
        x = M + i * (cw + gap)
        accent = i == 4
        c.setFillColor(RED if accent else white)
        c.setStrokeColor(G3)
        c.setLineWidth(1)
        c.roundRect(x, y, cw, h, R, stroke=0 if accent else 1, fill=1)
        fg = white if accent else INK
        text(c, f"{i + 1:02d}", x + 20, y + h - 60, size=40, font=BOLD, color=white if accent else RED)
        icon(c, ic, x + cw / 2, y + h / 2 + 10, s=24, color=fg)
        text(c, name, x + 20, y + 90, size=16, font=BOLD, color=fg)
        text(c, desc, x + 20, y + 64, size=10.5, color=white if accent else G1, leading=14)
    text(c, "El taller sigue en el prototipado; la estrategia crece en la producción gestionada.",
         M, 120, size=14, color=G1)
    source(c, "Oid (2024; 2026)")


def s06_corpus(c):
    page(c, 6, "Capítulo 3 · Corpus")
    title(c, "Tres productos, tres momentos")
    cases = [
        ("reel", "2007", "Reel Puma", "INNOVAR · Correntoso", 0.5, "La técnica se vuelve imagen"),
        ("mate", "2016", "Mate Nelo", "Sello de Buen Diseño", 0.72, "La tradición se vuelve marca"),
        ("holway", "2023", "Holway", "Red Dot · Rapids (HK)", 0.28, "La buena forma, premiada"),
    ]
    gap = 22
    cw = (W - 2 * M - 2 * gap) / 3
    for i, (key, yr, name, prize, pos, line) in enumerate(cases):
        x = M + i * (cw + gap)
        rimg(c, key, x, 330, cw, 250)
        pill(c, yr, x + 14, 330 + 250 - 36, fill=INK)
        text(c, name, x, 296, size=22, font=BOLD)
        text(c, prize, x, 274, size=11, color=G1)
        text(c, line, x, 238, size=13, font=BOLD, color=RED, width=cw)
        spectrum(c, x + 4, 180, cw - 8, pos, left="Moderno", right="Posmoderno")
    text(c, "Se descartó el triciclo: es un trabajo académico de 2000, anterior a la fundación.",
         M, 96, size=11.5, color=G1)
    source(c, "Oid (2020; 2024); Red Dot (2023)")


def mark(c, x, y, kind):
    """Celda de la matriz: M (negro), P (rojo), C (gris), MP (mitad), p (P moderada)."""
    r = 13
    if kind == "M":
        c.setFillColor(INK)
        c.circle(x, y, r, stroke=0, fill=1)
        fg = white
    elif kind in ("P", "p"):
        c.setFillColor(RED)
        c.circle(x, y, r if kind == "P" else r - 4, stroke=0, fill=1)
        fg = white
    elif kind == "MP":
        c.setFillColor(INK)
        c.circle(x, y, r, stroke=0, fill=1)
        c.saveState()
        pth = c.beginPath()
        pth.rect(x, y - r, r, 2 * r)
        c.clipPath(pth, stroke=0, fill=0)
        c.setFillColor(RED)
        c.circle(x, y, r, stroke=0, fill=1)
        c.restoreState()
        return
    else:  # C → al servicio de M
        c.setStrokeColor(G2)
        c.setLineWidth(1.5)
        c.setFillColor(CREAM)
        c.circle(x, y, r, stroke=1, fill=1)
        fg = G1
    if kind != "p":
        c.setFillColor(fg)
        c.setFont(BOLD, 10)
        c.drawCentredString(x, y - 3.5, kind)


def s07_matriz(c):
    page(c, 7, "Capítulo 3 · Matriz")
    title(c, "Matriz de análisis comparativo")
    rows = ["Forma y composición", "Materiales y procesos", "Función y uso",
            "Dimensión comunicativa", "Producción y mercado"]
    data = {
        "reel": ["M", "C", "M", "P", "P"],
        "mate": ["MP", "M", "M", "P", "P"],
        "holway": ["M", "C", "M", "p", "P"],
    }
    labels = [("reel", "Puma"), ("mate", "Nelo"), ("holway", "Holway")]
    lx, cx0, cwid = M, 420, 160
    top = 500
    for j, (key, name) in enumerate(labels):
        x = cx0 + j * cwid
        rimg(c, key, x, top + 14, cwid - 20, 72, r=12)
        text(c, name, x + (cwid - 20) / 2, top - 6, size=12, font=BOLD, align="center")
    rh = 52
    for i, r_ in enumerate(rows):
        y = top - 50 - i * rh
        c.setStrokeColor(G4)
        c.setLineWidth(1)
        c.line(lx, y - rh / 2 + 6, cx0 + 3 * cwid - 20, y - rh / 2 + 6)
        text(c, r_, lx, y - 5, size=15, font=BOLD if i == 3 else REG, color=RED if i == 3 else INK)
        for j, (key, _) in enumerate(labels):
            mark(c, cx0 + j * cwid + (cwid - 20) / 2, y, data[key][i])
    # leyenda
    ly = 160
    leg = [("M", "Moderno"), ("P", "Posmoderno"), ("p", "Posmoderno moderado"), ("C", "Contemporáneo al servicio de lo moderno")]
    x = lx
    for k, t in leg:
        mark(c, x + 13, ly, k)
        text(c, t, x + 34, ly - 5, size=11, color=G1)
        x += 60 + pdfmetrics.stringWidth(t, REG, 11)
    text(c, "Lo posmoderno aparece en la comunicación y el mercado, no en la forma.",
         lx, 100, size=14, font=BOLD)
    source(c, "Elaboración propia a partir de Oid (2024; 2026) y Red Dot (2023)")


def s08_hallazgo(c):
    page(c, 8, "Hallazgo", dark=True)
    text(c, "El objeto es moderno.", M, 470, size=52, font=BOLD, color=white)
    text(c, "El discurso es posmoderno.", M, 400, size=52, font=BOLD, color=RED)
    c.setFillColor(G1)
    c.rect(M, 340, 56, 3, stroke=0, fill=1)
    text(c, "“Buenos diseños, buenos negocios.”", M, 280, size=22, color=G3)
    text(c, "Oid (2024)", M, 254, size=11, color=G2)
    text(c, "El diseño se legitima por su rendimiento, no por un proyecto social: "
            "la performatividad que Lyotard (1979/1987) describe como rasgo de la condición posmoderna.",
         M, 180, size=14, color=G3, width=560, leading=19)


def s09_red(c):
    page(c, 9, "Del taller a la red")
    title(c, "El taller se convierte en gestión")
    # mapa esquemático de nodos
    nodes = [("Boise", "EE. UU.", 260, 450), ("Buenos Aires", "Vicente López", 330, 230),
             ("Hong Kong", "Wan Chai", 690, 400), ("China", "Producción", 640, 290)]
    c.setStrokeColor(G3)
    c.setLineWidth(1.5)
    c.setDash(4, 4)
    ba = nodes[1]
    for n in (nodes[0], nodes[2], nodes[3]):
        c.line(ba[2], ba[3], n[2], n[3])
    c.setDash()
    for name, sub, x, y in nodes:
        main = name == "Buenos Aires"
        c.setFillColor(RED if main else INK)
        c.circle(x, y, 14 if main else 9, stroke=0, fill=1)
        text(c, name, x + 22, y + 2, size=14, font=BOLD)
        text(c, sub, x + 22, y - 14, size=10, color=G1)
    # puntos
    x = M
    items = [("Sedes", "Boise · Buenos Aires · Hong Kong"),
             ("Producción", "Local y en China"),
             ("Red Dot 2023", "Co-diseño con Rapids (HK)")]
    for i, (h, d) in enumerate(items):
        xx = M + i * 280
        text(c, h, xx, 150, size=13, font=BOLD, color=RED)
        text(c, d, xx, 130, size=12, color=G1)
    text(c, "Bonsiepe (1985), revisitado: la periferia exporta proyecto; la fabricación ocurre en otra parte.",
         M, 92, size=12, color=INK, width=W - 2 * M)
    source(c, "Oid (2024); Red Dot (2023)")


def s10_conclusiones(c):
    page(c, 10, "Conclusiones")
    title(c, "Conclusiones")
    items = [
        ("01", "Niveles, no etapas",
         "OID no reemplaza la modernidad: la mantiene en el objeto y suma la posmodernidad en el discurso y la gestión."),
        ("02", "Taller administrado",
         "La estrategia no sustituye al oficio: lo administra a través de una red global de producción."),
        ("03", "Periferia que exporta",
         "Un estudio argentino que vende proyecto al mundo: una variante contemporánea del diseño de la periferia."),
    ]
    gap = 20
    cw = (W - 2 * M - 2 * gap) / 3
    for i, (n, h, d) in enumerate(items):
        x = M + i * (cw + gap)
        c.setFillColor(INK if i == 0 else white)
        c.setStrokeColor(G3)
        c.roundRect(x, 140, cw, 420, R, stroke=0 if i == 0 else 1, fill=1)
        fg = white if i == 0 else INK
        text(c, n, x + 24, 500, size=44, font=BOLD, color=RED)
        text(c, h, x + 24, 400, size=22, font=BOLD, color=fg, width=cw - 48, leading=26)
        text(c, d, x + 24, 300, size=14, color=G3 if i == 0 else G1, width=cw - 48, leading=19)
    text(c, "Respuesta a la pregunta guía: la tensión se articula distribuyéndola, no resolviéndola.",
         M, 100, size=13, color=G1)


def s11_cierre(c):
    page(c, 11, "Cierre de la investigación")
    title(c, "Límites, futuro y aprendizaje")
    cols = [
        ("Límites", ["Fuentes mayormente institucionales", "Solo el Red Dot verificado afuera", "Sin entrevistas propias"]),
        ("Líneas futuras", ["Entrevista a Ignacio Ordóñez", "Producción tercerizada", "Comparar con estudios post-2001"]),
        ("Aprendizaje", ["No todo lo nuevo es posmoderno", "Distinguir relato y objeto", "Toda afirmación, con fuente"]),
    ]
    gap = 20
    cw = (W - 2 * M - 2 * gap) / 3
    for i, (h, rows) in enumerate(cols):
        x = M + i * (cw + gap)
        last = i == 2
        c.setFillColor(RED if last else white)
        c.setStrokeColor(G3)
        c.roundRect(x, 150, cw, 400, R, stroke=0 if last else 1, fill=1)
        fg = white if last else INK
        text(c, h, x + 24, 500, size=24, font=BOLD, color=fg)
        yy = 420
        for r_ in rows:
            c.setFillColor(white if last else RED)
            c.circle(x + 28, yy + 5, 3, stroke=0, fill=1)
            yy = text(c, r_, x + 40, yy, size=14, color=fg, width=cw - 64, leading=18) - 30
    text(c, "La historia del diseño como herramienta para leer la práctica profesional.",
         M, 104, size=14, color=G1)


def s12_gracias(c):
    page(c, 12, "Referencias")
    text(c, "Gracias.", M, 560, size=56, font=BOLD)
    text(c, "Preguntas y devoluciones", M, 524, size=16, color=G2)
    refs = [
        "Bonsiepe, G. (1985). El diseño de la periferia. Gustavo Gili.",
        "Bürdek, B. E. (1994). Diseño. Historia, teoría y práctica del diseño industrial. Gustavo Gili.",
        "Fernández, S. y Bonsiepe, G. (2008). Historia del diseño en América Latina y el Caribe. Blucher.",
        "Jencks, C. (1980 [1977]). El lenguaje de la arquitectura posmoderna. Gustavo Gili.",
        "Lyotard, J.-F. (1987 [1979]). La condición postmoderna. Cátedra.",
        "Maldonado, T. (1993). El diseño industrial reconsiderado. Gustavo Gili.",
        "Oid -Ordóñez Industrial Design-. (2024). Folleto institucional. ordonezid.com",
        "Red Dot. (2023). Anthropometric Instruments Set. red-dot.org",
        "Sparke, P. (2010). Diseño y cultura. Gustavo Gili.",
        "Venturi, R. (1978 [1966]). Complejidad y contradicción en la arquitectura. Gustavo Gili.",
    ]
    spaced(c, "Referencias principales", M, 440, size=9, color=RED)
    y = 410
    for r_ in refs:
        y = text(c, r_, M, y, size=11, color=G1, width=W - 2 * M) - 8


def build():
    base.TOTAL = TOTAL
    c = canvas.Canvas(OUT, pagesize=(W, H))
    c.setTitle("Ordóñez Industrial Design — M3")
    c.setAuthor("Kevin Skvor")
    for fn in [s01_portada, s02_pregunta, s03_emblematico, s04_marco, s05_metodologia,
               s06_corpus, s07_matriz, s08_hallazgo, s09_red, s10_conclusiones,
               s11_cierre, s12_gracias]:
        fn(c)
        c.showPage()
    c.save()
    print("OK ->", OUT)


if __name__ == "__main__":
    build()
