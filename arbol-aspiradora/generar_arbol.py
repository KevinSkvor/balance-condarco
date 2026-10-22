"""Genera el diagrama de árbol de la aspiradora de escritorio (SVG, estilo lámina A2).
Estructura y códigos tomados del plano de conjunto (lista de piezas).
Para corregir, editá TREE y volvé a ejecutar: python3 generar_arbol.py
"""
from html import escape

# (código, nombre, [hijos])
TREE = ("A1", "Aspiradora de escritorio", [
    ("A1.1", "Cuerpo superior", [
        ("A1.1.1", "Carcasa", [("A1.1.1.1", "Tornillo Phillips", [])]),
        ("A1.1.2", "Malla filtro", [("A1.1.2.1", "Tornillo Phillips", [])]),
        ("A1.1.3", "Boquilla", []),
        ("A1.1.4", "Turbina", []),
        ("A1.1.5", "Anillo de soporte", []),
        ("A1.1.6", "Filtro boquilla", []),
    ]),
    ("A1.2", "Cuerpo lateral 1", []),
    ("A1.3", "Cuerpo lateral 2", [
        ("A1.3.1", "Funda botón", []),
        ("A1.3.2", "Bastidor interno", [
            ("A1.3.2.1", "Tornillo Phillips", []),
            ("A1.3.2.2", "Tornillo Phillips", []),
        ]),
        ("A1.3.3", "Motor universal", []),
        ("A1.3.4", "Batería cilíndrica Li-ion", []),
        ("A1.3.5", "Interruptor de botón", [("A1.3.5.1", "Resorte", [])]),
    ]),
    ("A1.4", "Cuerpo base", [
        ("A1.4.1", "Conector de batería", [("A1.4.1.1", "Tornillo Phillips", [])]),
    ]),
])

ROTULO = {
    "titulo": "Árbol de diagrama", "objeto": "Aspiradora de escritorio",
    "asignatura": "Materiales y Procesos IV", "alumno": "Paloma Leyton",
    "docente": "Lucas Machado", "universidad": "Universidad de Palermo",
    "entrega": "8/10/2026", "formato": "A2",
}

W, H = 1680, 1188
ROW, GROUP_GAP = 40, 40
COLS = [60, 400, 760, 1100]
SIZES = [22, 19, 13, 13]
WEIGHTS = [600, 600, 600, 600]
RED, LINE, TXT = "#d7191c", "#9a9a9a", "#1a1a1a"
FONT = "Myriad Pro, Liberation Sans, Arial, sans-serif"

out = []
def text(x, y, s, size, weight=400, anchor="start"):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
               f'text-anchor="{anchor}" fill="{TXT}">{escape(s)}</text>')
def code(x, y, s):
    out.append(f'<text x="{x}" y="{y}" font-size="10" font-weight="700" fill="{RED}">{s}</text>')
    out.append(f'<line x1="{x}" y1="{y+2}" x2="{x+len(s)*5.6}" y2="{y+2}" stroke="{RED}" stroke-width="0.8"/>')
def line(x1, y1, x2, y2, w):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{LINE}" stroke-width="{w}"/>')
def tw(s, size):
    return len(s) * size * 0.55

def leaves(n):
    return max(1, sum(leaves(k) for k in n[2]))

# Asignar posición vertical: cada hoja ocupa un renglón, cada padre se centra en sus hijos
pos = {}
total = leaves(TREE) * ROW + (len(TREE[2]) - 1) * GROUP_GAP
cursor = [(H - 170 - total) / 2 + 30]
def place(n, depth):
    if not n[2]:
        pos[n[0]] = cursor[0]; cursor[0] += ROW
    else:
        for i, k in enumerate(n[2]):
            if depth == 0 and i: cursor[0] += GROUP_GAP
            place(k, depth + 1)
        ys = [pos[k[0]] for k in n[2]]
        pos[n[0]] = (ys[0] + ys[-1]) / 2
place(TREE, 0)

def draw(n, depth):
    c, name, kids = n
    x, y, size = COLS[depth], pos[c], SIZES[depth]
    code(x, y - size - 3, c)
    text(x, y, name, size, WEIGHTS[depth])
    ex = x + tw(name, size) + 8
    for k in kids:
        line(ex, y - 5, COLS[depth + 1] - 8, pos[k[0]] - 5, 1.2 if depth == 0 else 0.8)
        draw(k, depth + 1)
draw(TREE, 0)

# Cajetín
R = ROTULO
bx, by, bw, bh = W - 560, H - 175, 520, 140
out.append(f'<g fill="none" stroke="{TXT}" stroke-width="0.8">'
           f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}"/>'
           f'<line x1="{bx+80}" y1="{by}" x2="{bx+80}" y2="{by+bh}"/>'
           f'<line x1="{bx+340}" y1="{by}" x2="{bx+340}" y2="{by+bh}"/>'
           f'<line x1="{bx+80}" y1="{by+56}" x2="{bx+bw}" y2="{by+56}"/>'
           f'<line x1="{bx+340}" y1="{by+100}" x2="{bx+bw}" y2="{by+100}"/>'
           f'<line x1="{bx+340}" y1="{by+120}" x2="{bx+bw}" y2="{by+120}"/>'
           + "".join(f'<line x1="{bx+80}" y1="{by+14*i}" x2="{bx+200}" y2="{by+14*i}"/>' for i in (1, 2, 3))
           + f'<line x1="{bx+130}" y1="{by}" x2="{bx+130}" y2="{by+56}"/>'
           f'<line x1="{bx+80}" y1="{by+112}" x2="{bx+130}" y2="{by+112}"/>'
           f'<line x1="{bx+130}" y1="{by+56}" x2="{bx+130}" y2="{by+bh}"/></g>')
for i, lab in enumerate(["Proyecto", "Dibujo", "Revisó", "Aprobó"]):
    text(bx + 84, by + 11 + 14 * i, lab, 9)
text(bx + 6, by + 16, "Tolerancias", 9); text(bx + 6, by + 27, "Generales", 9)
text(bx + 105, by + 76, "Esc", 10, anchor="middle")
text(bx + 105, by + 130, R["formato"], 11, 600, "middle")
text(bx + 235, by + 95, R["titulo"], 13, 600, "middle")
text(bx + 235, by + 113, R["objeto"], 12, anchor="middle")
text(bx + 205, by + 11, "Asignatura", 7); text(bx + 270, by + 34, R["asignatura"], 10, 600, "middle")
text(bx + 346, by + 11, "Alumno", 7); text(bx + 346, by + 30, R["alumno"], 11, 600)
text(bx + 346, by + 66, "Docente", 7); text(bx + 346, by + 84, R["docente"], 11, 600)
text(bx + 346, by + 114, R["universidad"], 11, 600)
text(bx + 346, by + 128, "Entrega", 7); text(bx + 400, by + 134, R["entrega"], 11, 600)
out.append(f'<line x1="{bx+200}" y1="{by}" x2="{bx+200}" y2="{by+56}" stroke="{TXT}" stroke-width="0.8"/>')

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       f'font-family="{FONT}"><rect width="{W}" height="{H}" fill="#fff"/>'
       f'<rect x="20" y="20" width="{W-40}" height="{H-40}" fill="none" stroke="#bbb"/>'
       + "".join(out) + "</svg>")
open("arbol_aspiradora.svg", "w", encoding="utf-8").write(svg)
print("ok")
