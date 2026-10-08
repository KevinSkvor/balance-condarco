"""Genera el diagrama de árbol del reel de pesca (SVG, estilo lámina A2).
Para corregir conexiones, editá TREE y volvé a ejecutar: python3 generar_arbol.py
"""
from html import escape

ROOT = "Reel de pesca"
# (nombre, [hijos]) — los hijos de nivel 3 son piezas que se fijan a la pieza padre.
TREE = [
    ("Main Body", [
        ("Eje", ["Arandela plástica", "Arandela bronce"]),
        ("Pivote 1", []),
        ("Pivote 2", []),
        ("Barreta", ["Arandela"]),
        ("Barreta 2", ["Arandela ovalada"]),
        ("Guía resorte", ["Resorte"]),
        ("Tapa", []),
    ]),
    ("Soporte", [
        ("Base Body", ["Tapa cuerpo"]),
        ("Varilla", ["Arandela plástica x2"]),
        ("Varilla con engranaje", ["Engranaje lineal"]),
        ("Dentada", []),
        ("Engranaje 2", []),
    ]),
    ("Manija", [
        ("Manija", ["Tapa manija"]),
        ("Agarre", []),
    ]),
    ("Tapa", [
        ("Cuerpo principal", ["Tornillo x2"]),
        ("Engranaje", ["Tuerca", "Arandela"]),
        ("Chapa click", []),
    ]),
    ("Bobina", [
        ("Bobina", ["Alambre", "Arandela x4", "Arandela espuma x3"]),
    ]),
]

W, H = 1680, 1188
ROW = 30            # alto de cada renglón de pieza
GROUP_GAP = 26      # espacio extra entre subconjuntos
X0, X1, X2, X3 = 60, 400, 760, 1080
RED, LINE, TXT = "#d7191c", "#9a9a9a", "#1a1a1a"
FONT = "Myriad Pro, Liberation Sans, Arial, sans-serif"

out = []
def text(x, y, s, size, weight=400, anchor="start"):
    out.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
               f'text-anchor="{anchor}" fill="{TXT}">{escape(s)}</text>')
def code(x, y, s):
    w = len(s) * 5.6
    out.append(f'<text x="{x}" y="{y}" font-size="10" font-weight="700" fill="{RED}">{s}</text>')
    out.append(f'<line x1="{x}" y1="{y+2}" x2="{x+w}" y2="{y+2}" stroke="{RED}" stroke-width="0.8"/>')
def line(x1, y1, x2, y2, w=1):
    out.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{LINE}" stroke-width="{w}"/>')
def tw(s, size):  # ancho aproximado de texto
    return len(s) * size * 0.52

# Calcular filas
rows = sum(max(1, len(k)) for _, kids in TREE for _, k in kids)
total_h = rows * ROW + (len(TREE) - 1) * GROUP_GAP
y = (H - 170 - total_h) / 2 + 40
groups = []
for g, (gname, parts) in enumerate(TREE, 1):
    items = []
    for p, (pname, kids) in enumerate(parts, 1):
        n = max(1, len(kids))
        py = y + (n - 1) * ROW / 2
        kys = [y + i * ROW for i in range(len(kids))]
        items.append((p, pname, py, list(zip(kids, kys))))
        y += n * ROW
    gy = (items[0][2] + items[-1][2]) / 2
    groups.append((g, gname, gy, items))
    y += GROUP_GAP

root_y = (groups[0][2] + groups[-1][2]) / 2
code(X0, root_y - 22, "A.1")
text(X0, root_y, ROOT, 22, 600)
rx = X0 + tw(ROOT, 22) + 10

for g, gname, gy, items in groups:
    gc = f"A.1.{g}"
    line(rx, root_y - 6, X1 - 10, gy - 6, 1.2)
    code(X1, gy - 22, gc)
    text(X1, gy, gname, 19, 600)
    gx = X1 + tw(gname, 19) + 8
    for p, pname, py, kids in items:
        pc = f"{gc}.{p}"
        line(gx, gy - 6, X2 - 6, py - 4, 0.7)
        code(X2, py - 13, pc)
        text(X2, py, pname + ".", 13, 600)
        px = X2 + tw(pname + ".", 13) + 10
        for k, (kname, ky) in enumerate(kids, 1):
            line(px, py - 4, X3 - 6, ky - 4, 0.7)
            code(X3, ky - 13, f"{pc}.{k}")
            text(X3, ky, kname, 13, 600)

# Cajetín (rótulo) — campos a completar
bx, by, bw, bh = W - 560, H - 175, 520, 140
out.append(f'<g fill="none" stroke="{TXT}" stroke-width="0.8">'
           f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}"/>'
           f'<line x1="{bx+80}" y1="{by}" x2="{bx+80}" y2="{by+bh}"/>'
           f'<line x1="{bx+340}" y1="{by}" x2="{bx+340}" y2="{by+bh}"/>'
           f'<line x1="{bx+80}" y1="{by+56}" x2="{bx+bw}" y2="{by+56}"/>'
           f'<line x1="{bx+340}" y1="{by+28}" x2="{bx+bw}" y2="{by+28}"/>'
           f'<line x1="{bx+340}" y1="{by+98}" x2="{bx+bw}" y2="{by+98}"/>'
           + "".join(f'<line x1="{bx+80}" y1="{by+14*i}" x2="{bx+250}" y2="{by+14*i}"/>' for i in (1, 2, 3))
           + f'<line x1="{bx+130}" y1="{by}" x2="{bx+130}" y2="{by+56}"/>'
           f'<line x1="{bx+80}" y1="{by+112}" x2="{bx+130}" y2="{by+112}"/>'
           f'<line x1="{bx+130}" y1="{by+56}" x2="{bx+130}" y2="{by+bh}"/></g>')
for i, lab in enumerate(["Proyecto", "Dibujo", "Revisó", "Aprobó"]):
    text(bx + 84, by + 11 + 14 * i, lab, 9)
text(bx + 6, by + 16, "Tolerancias", 9); text(bx + 6, by + 27, "Generales", 9)
text(bx + 105, by + 76, "Esc", 10, anchor="middle")
text(bx + 105, by + 130, "A2", 11, 600, "middle")
text(bx + 235, by + 95, "Árbol de diagrama", 13, 600, "middle")
text(bx + 235, by + 113, ROOT, 12, anchor="middle")
text(bx + 346, by + 18, "Materiales y Procesos IV", 11, 600)
text(bx + 346, by + 80, "Universidad de Palermo", 11, 600)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       f'font-family="{FONT}"><rect width="{W}" height="{H}" fill="#fff"/>'
       f'<rect x="20" y="20" width="{W-40}" height="{H-40}" fill="none" stroke="#bbb"/>'
       + "".join(out) + "</svg>")
open("arbol_reel.svg", "w", encoding="utf-8").write(svg)
print("ok, filas:", rows)
