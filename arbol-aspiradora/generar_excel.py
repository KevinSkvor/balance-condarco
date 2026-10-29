"""Exporta la versión de avance del árbol de la aspiradora a Excel.
Uso: python3 generar_excel.py  →  arbol_aspiradora_avance.xlsx
"""
import sys
sys.argv = ["x", "--avance"]
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    import generar_arbol as g   # reutiliza el mismo árbol podado y el rótulo
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill

F = "Arial"
red = Font(name=F, size=9, bold=True, color="D7191C", underline="single")
thin = Side(style="thin", color="000000")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
gray = Side(style="thin", color="9A9A9A")

wb = Workbook()
ws = wb.active
ws.title = "Árbol de diagrama"
ws["A1"] = f'{g.ROTULO["titulo"]} — {g.ROTULO["objeto"]} (avance)'
ws["A1"].font = Font(name=F, size=14, bold=True)
ws["A2"] = f'{g.ROTULO["asignatura"]} · Alumna: {g.ROTULO["alumno"]} · Docente: {g.ROTULO["docente"]} · {g.ROTULO["universidad"]}'
ws["A2"].font = Font(name=F, size=9, italic=True)
heads = ["Nivel 1", "Nivel 2", "Nivel 3", "Nivel 4"]
for i, h in enumerate(heads):
    c = ws.cell(row=4, column=1 + i * 2, value=h)
    c.font = Font(name=F, size=9, bold=True, color="666666")
sizes = [14, 12, 11, 11]
nodes = []
def walk(n, depth):
    nodes.append((depth, n[0], n[1]))
    for k in n[2]:
        walk(k, depth + 1)
walk(g.TREE, 0)
r = 5
for depth, code, name in nodes:
    col = 1 + depth * 2
    ws.cell(row=r, column=col, value=code).font = red
    c = ws.cell(row=r + 1, column=col, value=name)
    c.font = Font(name=F, size=sizes[depth], bold=True)
    # línea que conecta con el padre (borde izquierdo en la columna del nivel)
    if depth:
        for rr in (r, r + 1):
            ws.cell(row=rr, column=col - 1).border = Border(right=gray)
    r += 2
for col, w in zip("ABCDEFG", [28, 3, 22, 3, 26, 3, 20]):
    ws.column_dimensions[col].width = w
ws.sheet_view.showGridLines = False
ws.page_setup.orientation = "landscape"
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.page_setup.fitToWidth, ws.page_setup.fitToHeight = 1, 0

# Lista de piezas, con el mismo formato que el plano de conjunto
bl = wb.create_sheet("Lista de piezas")
hdr = ["Piez.", "Cant.", "Denominación", "N° Pieza", "Material", "Observación"]
for i, h in enumerate(hdr, 1):
    c = bl.cell(row=1, column=i, value=h)
    c.font = Font(name=F, bold=True); c.border = box
    c.alignment = Alignment(horizontal="center")
    c.fill = PatternFill("solid", fgColor="EDEDED")
for i, (depth, code, name) in enumerate(nodes, 1):
    vals = [i, 1, name, code, None, None]
    for j, v in enumerate(vals, 1):
        c = bl.cell(row=1 + i, column=j, value=v)
        c.font = Font(name=F, color="0000FF" if j == 2 else "000000")
        c.border = box
        c.alignment = Alignment(horizontal="left" if j == 3 else "center")
last = 1 + len(nodes)
bl.cell(row=last + 1, column=1, value="Total").font = Font(name=F, bold=True)
t = bl.cell(row=last + 1, column=2, value=f"=SUM(B2:B{last})")
t.font = Font(name=F, bold=True); t.alignment = Alignment(horizontal="center")
bl.cell(row=last + 3, column=1, value="Cantidades en azul: dato cargado a mano. Material y Observación: a completar.").font = Font(name=F, size=9, italic=True)
for col, w in zip("ABCDEF", [7, 7, 30, 12, 20, 24]):
    bl.column_dimensions[col].width = w
bl.freeze_panes = "A2"

# Lámina con el diagrama dibujado
from openpyxl.drawing.image import Image
im = wb.create_sheet("Lámina")
img = Image("arbol_aspiradora_avance.png"); img.width, img.height = 1260, 891
im.add_image(img, "A1")
im.sheet_view.showGridLines = False

wb.save("arbol_aspiradora_avance.xlsx")
print("ok", len(nodes), "piezas")
