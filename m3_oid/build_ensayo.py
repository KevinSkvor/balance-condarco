"""Genera el Proyecto Integrador completo (Cuerpos A, B y C) en PDF.

Formato según las pautas de la cátedra: Times (Liberation Serif, métrica
idéntica) 11, interlineado 1,5, títulos en negrita a margen izquierdo, párrafos
sin sangría, epígrafes en tamaño 9 centrados, citas de más de 40 palabras en
bloque. El índice y el índice de tablas y figuras se numeran solos.

Uso:  python3 build_ensayo.py   ->  SkvorKevin_ProyectoIntegrador_M3.pdf
"""
import os
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "images")
OUT = os.path.join(HERE, "SkvorKevin_ProyectoIntegrador_M3.pdf")

LIB = "/usr/share/fonts/truetype/liberation"
for name, f in [("Serif", "Regular"), ("Serif-Bold", "Bold"), ("Serif-Italic", "Italic"),
                ("Serif-BoldItalic", "BoldItalic")]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(LIB, f"LiberationSerif-{f}.ttf")))
pdfmetrics.registerFontFamily("Serif", normal="Serif", bold="Serif-Bold",
                              italic="Serif-Italic", boldItalic="Serif-BoldItalic")

AUTOR, LEGAJO, FECHA = "Kevin Skvor", "0136840", "06/11/2026"
TITULO = "Entre el taller y la estrategia"
SUB1 = "Modernidad y posmodernidad en el diseño industrial argentino"
SUB2 = "Un análisis de la trayectoria de Ordóñez Industrial Design (2001-2026)"

# ------------------------------------------------------------------ estilos
BODY = ParagraphStyle("body", fontName="Serif", fontSize=11, leading=16.5,
                      alignment=TA_JUSTIFY, spaceAfter=10)
H1 = ParagraphStyle("h1", fontName="Serif-Bold", fontSize=12, leading=18, spaceBefore=0,
                    spaceAfter=14, alignment=TA_LEFT)
H2 = ParagraphStyle("h2", fontName="Serif-Bold", fontSize=11, leading=16.5, spaceBefore=10,
                    spaceAfter=8)
CAP = ParagraphStyle("cap", fontName="Serif", fontSize=9, leading=11.5, alignment=TA_CENTER,
                     spaceBefore=4, spaceAfter=14)
QUOTE = ParagraphStyle("quote", parent=BODY, leading=13, leftIndent=2.5 * cm, spaceAfter=12)
REF = ParagraphStyle("ref", parent=BODY, alignment=TA_LEFT, leftIndent=1.25 * cm,
                     firstLineIndent=-1.25 * cm, spaceAfter=8)
CELL = ParagraphStyle("cell", fontName="Serif", fontSize=9, leading=11.5)
CENTER = ParagraphStyle("center", parent=BODY, alignment=TA_CENTER, spaceAfter=4)


def md(s):
    """*itálica*  ->  <i>itálica</i>, escapando & < >."""
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return re.sub(r"\*([^*]+)\*", r"<i>\1</i>", s)


def P(s, st=BODY):
    return Paragraph(md(s), st)


class Heading(Paragraph):
    """Título que se registra en el índice (kind = 'TOCEntry')."""

    def __init__(self, text, style=H1, toc=True):
        super().__init__(md(text), style)
        self.toc_text, self.toc = text, toc


class Caption(Paragraph):
    """Epígrafe que se registra en el índice de tablas o de figuras."""

    def __init__(self, text, kind):
        super().__init__(md(text), CAP)
        self.kind, self.short = kind, text.split(" Fuente:")[0]


class KindTOC(TableOfContents):
    def __init__(self, kind, **kw):
        super().__init__(**kw)
        self.kind = kind

    def notify(self, kind, stuff):
        if kind == self.kind:
            self.addEntry(*stuff)


class Doc(SimpleDocTemplate):
    def afterFlowable(self, f):
        if isinstance(f, Heading) and f.toc:
            self.notify("TOCEntry", (0, f.toc_text, self.page))
        elif isinstance(f, Caption):
            self.notify(f.kind, (0, f.short, self.page))


def toc(kind="TOCEntry"):
    t = KindTOC(kind, dotsMinLevel=0)
    t.levelStyles = [ParagraphStyle("toc", fontName="Serif", fontSize=11, leading=15,
                                    leftIndent=0, firstLineIndent=0, spaceAfter=6)]
    return t


def fig(file, w_cm, caption):
    path = os.path.join(IMG, file)
    from PIL import Image as PI
    iw, ih = PI.open(path).size
    w = w_cm * cm
    return KeepTogether([Spacer(1, 6), Image(path, w, w * ih / iw), Caption(caption, "FigEntry")])


def footer(c, doc):
    c.setFont("Serif", 9)
    c.drawRightString(A4[0] - 2.5 * cm, 1.5 * cm, str(doc.page))


def cover(cuerpo, extra=None):
    out = [Spacer(1, 1.2 * cm),
           P("PROYECTO INTEGRADOR", ParagraphStyle("c0", parent=CENTER, fontSize=13, leading=18)),
           P("Historia y Tendencias del Diseño II", CENTER),
           Spacer(1, 0.6 * cm), P(cuerpo, CENTER), Spacer(1, 2.2 * cm),
           Paragraph(f"<b>{TITULO}</b>", ParagraphStyle("c1", parent=CENTER, fontSize=18, leading=24)),
           P(SUB1, CENTER), P(SUB2, CENTER)]
    if extra:
        out += [Spacer(1, 1 * cm), P(extra, ParagraphStyle("c2", parent=CENTER, fontSize=13))]
    out += [Spacer(1, 2.2 * cm),
            P(AUTOR, ParagraphStyle("c3", parent=CENTER, fontSize=14, leading=18)),
            P(f"Legajo {LEGAJO}", CENTER), Spacer(1, 1.4 * cm),
            P("Carrera: Licenciatura en Diseño Industrial", CENTER),
            P("Docente: Prof. Gastón Girod", CENTER),
            P("Momento 3", CENTER), P(f"Fecha de entrega: {FECHA}", CENTER),
            Spacer(1, 1.2 * cm), Image(os.path.join(IMG, "UP_logo.png"), 2.6 * cm, 2.6 * cm * 178 / 199),
            PageBreak()]
    return out


# ================================================================== CUERPO A
def cuerpo_a():
    sig = ParagraphStyle("sig", fontName="Serif-Italic", fontSize=24, leading=28)
    return [
        Paragraph("<b>Cuerpo A</b>", H1),
        Paragraph("<b>Declaración jurada de autoría</b>", H2),
        P(f"Yo, {AUTOR}, legajo {LEGAJO}, estudiante de la Licenciatura en Diseño Industrial de la "
          f"Universidad de Palermo, declaro bajo juramento que el presente trabajo, titulado "
          f"“{TITULO}. {SUB1}. {SUB2}”, presentado en el marco de la materia Historia y Tendencias "
          "del Diseño II, fue realizado por mí, es original y no constituye copia total ni parcial "
          "de otro trabajo, ni ha sido presentado con anterioridad en otra instancia académica."),
        Spacer(1, 2.5 * cm),
        Paragraph("Skvor Kevin", sig),
        Table([[""]], colWidths=[6 * cm], rowHeights=[2], hAlign="LEFT",
              style=[("LINEABOVE", (0, 0), (-1, -1), 0.6, colors.black)]),
        P("Firma"), Spacer(1, 0.3 * cm),
        P(f"Aclaración: {AUTOR}"), P(f"Legajo: {LEGAJO}"), P(f"Fecha: {FECHA}"),
        PageBreak(),
    ]


# ================================================================== CUERPO B
RESUMEN = (
    "Este ensayo analiza la trayectoria de Ordóñez Industrial Design -OID-, estudio de diseño "
    "industrial fundado en Buenos Aires en 2001, para indagar cómo su práctica articula las "
    "tensiones entre modernidad -racionalidad funcional, buena forma, producción en serie- y "
    "posmodernidad -dimensión comunicativa, marca, diseño como servicio estratégico- en el diseño "
    "industrial argentino contemporáneo. Parte de una revisión del par dialéctico a partir de la "
    "historia del diseño de posguerra y de la condición periférica del diseño latinoamericano, "
    "describe la metodología que el estudio declara y la contrasta con sus fuentes institucionales "
    "y con una fuente externa. Luego analiza tres productos de distintos momentos, el reel de pesca "
    "Puma, el Mate Nelo y los instrumentos antropométricos Holway, mediante una matriz comparativa. "
    "Se sostiene que OID no pasa de un paradigma al otro, sino que los distribuye en niveles: sus "
    "objetos conservan una racionalidad moderna, mientras que lo posmoderno se manifiesta en la "
    "comunicación, la marca y la gestión global de la producción.")

INTRO = [
    "Este trabajo profundiza el proyecto integrador desarrollado en los momentos anteriores de la "
    "materia, en los que se delimitó a Ordóñez Industrial Design -OID, también presentada como Oid- "
    "como objeto de estudio y se plantearon el marco teórico y la metodología del estudio. En esta "
    "instancia se revisan esos capítulos a partir de las devoluciones recibidas y, como aspecto nuevo, "
    "se analizan tres productos concretos. OID es una empresa de diseño industrial y desarrollo de "
    "productos fundada en 2001 por Ignacio Ordóñez, con sede en Vicente López, provincia de Buenos "
    "Aires, y oficinas en Boise, Estados Unidos, y Hong Kong (Oid, 2024; 2026). El recorte temporal "
    "abarca desde su fundación hasta 2026; el campo es el diseño industrial argentino contemporáneo, "
    "y los conceptos que organizan el análisis son modernidad, posmodernidad, dimensión comunicativa, "
    "periferia y gestión de diseño.",

    "La historia del diseño industrial de posguerra suele narrarse a partir de la racionalidad "
    "proyectual de la Bauhaus y de la Escuela Superior de Diseño de Ulm, y de la crisis del "
    "funcionalismo que, desde los años sesenta, dio lugar a la crítica ética del diseño y a la "
    "atención por su dimensión comunicativa (Bürdek, 1994; Maldonado, 1993; Papanek, 1971/1977). "
    "Esa narrativa se construyó en los países centrales y plantea un problema para quienes proyectan "
    "desde la periferia: Bonsiepe (1985) advirtió que el diseño en América Latina está condicionado "
    "por la dependencia tecnológica y productiva respecto de esos centros. OID se funda en 2001, el "
    "año de la crisis económica más profunda de la Argentina reciente, y llega a 2026 con clientes en "
    "varios países y producción gestionada en Asia. Su recorrido permite observar cómo un estudio local "
    "negocia esa condición periférica en un mercado global.",

    "El tema es relevante porque OID reúne reconocimientos de tres escalas: nacionales, como el premio "
    "INNOVAR de 2007 y el Sello de Buen Diseño de 2016; regionales, como su selección para representar "
    "a la Argentina en el libro *ABC del Diseño Industrial Latinoamericano* en 2019; e internacionales, "
    "como el Red Dot Award de 2023 (Oid, 2024; Red Dot, 2023). Estudiarlo contribuye a una "
    "historiografía del diseño argentino que no se limite a los casos fundacionales del siglo XX, y "
    "resulta pertinente hoy porque permite discutir una idea frecuente: que toda práctica actual, por "
    "incorporar tecnologías digitales o un discurso estratégico, es necesariamente posmoderna.",

    "Respecto del estado del arte, existen obras generales sobre la historia del diseño industrial "
    "desde la posguerra (Bürdek, 1994; Maldonado, 1993; Sparke, 2010) y trabajos que revisan "
    "críticamente esa historia y sus relatos de éxito, como el volumen coordinado por Bernatene (2015), "
    "que incluye capítulos sobre el diseño posmoderno y sobre la distancia entre el discurso "
    "sustentable y su práctica (Beducci, 2015; Battista, 2015). Para el contexto regional, la obra "
    "coordinada por Fernández y Bonsiepe (2008) reconstruye la relación entre diseño, industrialización "
    "y autonomía en América Latina, y Blanco (2012) reúne la producción de diseñadores industriales "
    "argentinos. Sobre OID, en cambio, el material disponible es casi exclusivamente institucional: el "
    "sitio web, los folletos del estudio y la ficha del premio Red Dot. En la búsqueda realizada no se "
    "identificaron trabajos académicos dedicados al estudio ni análisis que contrasten su relato "
    "institucional con lo que sus productos permiten observar. Esa es la brecha en la que se inscribe "
    "este ensayo.",

    "La pregunta que guía el trabajo es: ¿de qué manera la evolución metodológica y proyectual de "
    "Ordóñez Industrial Design articula las tensiones entre modernidad -racionalidad funcional, "
    "producción eficiente, diseño en serie- y posmodernidad -dimensión comunicativa, marca, diseño "
    "como servicio estratégico- en el diseño industrial argentino contemporáneo (2001-2026)? El "
    "objetivo general es analizar la trayectoria de OID para comprender cómo su práctica dialoga con "
    "esa tensión. Los objetivos específicos, que corresponden a los tres capítulos, son: "
    "contextualizar el par modernidad/posmodernidad en el diseño industrial y situar en él la "
    "fundación y el posicionamiento de OID; analizar la metodología proyectual que el estudio declara "
    "y la evolución de sus herramientas y de su modelo de producción; y evaluar de manera comparativa "
    "tres productos de distintos momentos para verificar en qué medida confirman o tensionan lo que el "
    "estudio afirma de sí mismo.",

    "El enfoque es cualitativo y combina la revisión de la bibliografía teórica de la cátedra con el "
    "relevamiento de fuentes institucionales y externas. Como la mayor parte de ese material tiene "
    "carácter promocional, las afirmaciones del estudio se leen de manera crítica y se distinguen de "
    "los datos verificables y de la interpretación propia. El análisis de los productos se apoya en una "
    "matriz comparativa y en un relevamiento de fuentes incluido en el Cuerpo C. Un límite debe "
    "señalarse desde el comienzo: no se realizaron entrevistas ni observación directa de los productos, "
    "por lo que las conclusiones sobre los objetos se apoyan en imágenes publicadas y son provisionales.",

    "El trabajo se organiza en tres capítulos. El primero establece el marco conceptual y sitúa a OID "
    "dentro de él. El segundo analiza la metodología del estudio y su modelo de producción. El tercero "
    "pone a prueba la hipótesis en tres productos y compara los resultados. Por último, las "
    "conclusiones responden la pregunta guía y señalan los límites del análisis.",
]

CAP1 = [
    ("h2", "1.1 Modernidad y posmodernidad como par dialéctico"),
    "En este ensayo, modernidad y posmodernidad se usan como un par dialéctico, es decir, como dos "
    "términos que se definen por contraste y que pueden coexistir en una misma práctica, y no como "
    "etapas sucesivas. En el diseño industrial, la modernidad remite a la confianza en la razón "
    "proyectual, a la forma derivada de la función, a la estandarización y a la producción en serie. "
    "Su expresión más acabada es la tradición que va de la Bauhaus a la Escuela de Ulm y a la idea de "
    "buena forma, que Maldonado (1993) analiza como el intento de subordinar el proyecto a criterios "
    "racionales y verificables. Bürdek (1994) describe esa tradición a partir de la función práctica "
    "del producto, es decir, de su capacidad de resolver una necesidad de uso.",

    "La crítica a ese consenso comienza en los años sesenta por dos vías. La primera es ética: Papanek "
    "(1971/1977) cuestiona la desvinculación del diseñador respecto de la realidad social y ambiental, "
    "pero lo hace desde dentro del proyecto moderno, ya que reclama un diseño más responsable y no "
    "renuncia a la razón proyectual. La segunda es la que define al posmodernismo propiamente dicho, y "
    "tiene su origen en la arquitectura. Venturi (1966/1978) defiende la complejidad y la contradicción "
    "frente a la pureza moderna, y Jencks (1977/1980) caracteriza la arquitectura posmoderna por su "
    "doble codificación, es decir, por su capacidad de hablar a la vez al especialista y al público "
    "general. En el diseño de objetos, esa crítica toma forma en el *Radical Design* -diseño radical- "
    "italiano de los años sesenta y setenta y, sobre todo, en el grupo Memphis, reunido por Ettore "
    "Sottsass en 1981, que reivindicó el ornamento, el color, la ironía y la cita como respuesta a la "
    "buena forma (Sparke, 2010).",

    "En el plano teórico, Bürdek (1994) ubica este giro en la creciente importancia de la función "
    "comunicativa del producto, línea que la semántica del producto formalizó como el estudio de las "
    "cualidades simbólicas de la forma (Krippendorff y Butter, 1984). Lyotard (1979/1987) aporta una "
    "lectura filosófica del contexto: en la condición posmoderna, los grandes relatos que legitimaban "
    "el saber, como el progreso o la emancipación, ceden ante una legitimación por la eficacia o "
    "performatividad. Ese desplazamiento será útil para leer el discurso de OID, que justifica el "
    "diseño por sus resultados comerciales.",

    "Una precisión resulta necesaria. En las etapas anteriores de este trabajo se asociaron a la "
    "posmodernidad rasgos como la manufactura aditiva, la experiencia de usuario o la sustentabilidad. "
    "Esa asociación resulta discutible: se trata de rasgos contemporáneos que no son posmodernos en sí "
    "mismos y que pueden ponerse al servicio de objetivos plenamente modernos, como la precisión, la "
    "eficiencia o la optimización productiva. Beducci (2015) muestra que la miniaturización y la "
    "inmaterialidad de los objetos tienen un origen tecnológico antes que estético, y Battista (2015) "
    "advierte sobre la distancia entre el discurso de la sustentabilidad y su práctica efectiva. En "
    "este trabajo, por lo tanto, se reserva el término posmoderno para la dimensión comunicativa, "
    "simbólica o identitaria del producto, y se trata la tecnología como un tercer eje cuyo sentido "
    "depende de cómo se la utilice.",

    ("h2", "1.2 El diseño industrial argentino y la condición periférica"),
    "Las corrientes que organizan la historia del diseño fueron construidas en gran parte desde Europa "
    "y Estados Unidos. Bonsiepe (1985) problematiza esa asimetría al plantear la noción de diseño de la "
    "periferia: en los países latinoamericanos, el diseño depende de tecnologías, capitales y modelos "
    "de consumo generados en los centros industriales, y su desafío es construir una práctica propia "
    "en esas condiciones. La historiografía regional posterior retomó esa preocupación por la relación "
    "entre diseño, industrialización y autonomía (Fernández y Bonsiepe, 2008), y la revisión crítica de "
    "los relatos sobre la historia del diseño industrial, como la que propone el volumen coordinado por "
    "Bernatene (2015), invita a desconfiar de las narraciones lineales y exitosas.",

    "Desde esta perspectiva, la fundación de un estudio de diseño industrial en Buenos Aires en 2001 no "
    "es un dato neutral. La crisis de ese año redujo drásticamente la actividad industrial y obligó a "
    "quienes proyectaban a buscar clientes y formas de producción por fuera del circuito tradicional. "
    "Del marco anterior se derivan los tres ejes que ordenan el análisis: función y comunicación, que "
    "contrapone la función práctica a la dimensión simbólica del producto (Bürdek, 1994); objeto y "
    "discurso, que distingue lo que los productos muestran de lo que la empresa dice de ellos; y local y "
    "global, que remite a la condición periférica señalada por Bonsiepe (1985). Estos ejes no son "
    "compartimentos estancos: un mismo producto puede ser moderno en uno y posmoderno en otro.",

    ("h2", "1.3 Fundación y posicionamiento de OID"),
    "Según su sitio web, OID fue fundada en 2001 por Ignacio Ordóñez y se presenta como una empresa "
    "internacionalmente premiada de diseño industrial e innovación, capaz de desarrollar nuevos "
    "productos y ponerlos en producción (Oid, 2026). Su folleto institucional enumera servicios que "
    "exceden el diseño de producto: gestión estratégica, talleres de innovación, *design thinking* "
    "-pensamiento de diseño- y diseño de experiencia de usuario, modelado 3D, documentación técnica, "
    "prototipado y ensayos, puesta en producción y *outsourcing* -tercerización- de la fabricación en "
    "China y Asia (Oid, 2024). La lista de clientes incluye empresas argentinas como Longvie, Lumilagro "
    "o el Banco de la Nación Argentina, y clientes de otros países (Oid, 2026).",

    "La línea de tiempo de premios que publica el estudio permite ordenar su trayectoria en tres "
    "momentos. Entre 2000 y 2004 figuran distinciones y exhibiciones vinculadas a la formación de su "
    "fundador, como la exhibición de un triciclo recreativo en París en 2000 y de un baño químico en "
    "Milán en 2002, ambas en representación de la Universidad de Buenos Aires -UBA-. Entre 2007 y 2016 "
    "aparecen productos de consumo: un cepillo dental descartable y un reel de pesca con mosca premiados "
    "en INNOVAR en 2007, una botella para la marca Gota distinguida en 2010 y los mates Nelo y Mito, que "
    "recibieron el Sello de Buen Diseño en 2016. Desde 2019 se suman la selección para el libro *ABC del "
    "Diseño Industrial Latinoamericano* y el Red Dot de 2023 por los instrumentos antropométricos Holway "
    "(Oid, 2024).",

    "Esta cronología debe leerse con distancia crítica. Por un lado, muestra un desplazamiento claro "
    "desde el concurso académico hacia el encargo empresarial y, luego, hacia el reconocimiento "
    "internacional. Por otro, es una construcción del propio estudio: incorpora trabajos anteriores a "
    "su fundación y, de todos los premios enumerados, solo el Red Dot pudo contrastarse con una fuente "
    "externa, que además registra una colaboración con el estudio Rapids, de Hong Kong, no mencionada "
    "en el folleto (Red Dot, 2023). El Anexo 2 del Cuerpo C resume el estado de verificación de cada "
    "dato. Con esas salvedades, OID puede considerarse un caso emblemático por la continuidad de su "
    "trayectoria desde la crisis de 2001, por la variedad de escalas de su reconocimiento y porque su "
    "recorrido condensa el paso del diseño de productos al diseño como servicio global.",
]

CAP2 = [
    ("h2", "2.1 El enfoque declarado: el diseño como herramienta estratégica"),
    "OID describe su enfoque como una síntesis entre conocimiento del mercado y experiencia "
    "proyectual, y presenta al diseño industrial como una herramienta estratégica para crear y mejorar "
    "productos y conectarlos con el usuario (Oid, 2024). La frase atribuida a su fundador en el folleto "
    "institucional resume esa posición:",
    ("quote", "Ideamos y desarrollamos productos contemplando, en cada caso, los conceptos, la imagen, "
              "las tecnologías, los procesos, los materiales y los costos que mejor se adecúan a la "
              "realidad competitiva de cada proyecto, pero por sobre todo abordando los objetivos de la "
              "empresa y su responsabilidad con los consumidores. (Oid, 2024, s. p.)"),
    "La cita reúne los dos polos del par dialéctico. La atención a los procesos, los materiales y los "
    "costos pertenece al repertorio moderno del diseño industrial; la imagen, la realidad competitiva y "
    "los objetivos de la empresa remiten a una concepción del diseño como instrumento de mercado. La "
    "responsabilidad con los consumidores, finalmente, evoca la crítica ética de Papanek (1971/1977), "
    "aunque formulada en términos comerciales y no sociales.",

    ("h2", "2.2 Las cinco fases de la metodología OID"),
    "El estudio presenta su metodología como un ciclo completo, al que denomina *full circle* -círculo "
    "completo-, organizado en cinco fases (Figura 1). La primera, concepto, comprende el abordaje y la "
    "planificación, la inmersión en el problema, la evaluación y el *sprint* -ciclo breve de trabajo "
    "intensivo-. La segunda, diseño, abarca la forma, la función, la usabilidad, la estética y la "
    "experiencia de uso. La tercera, prototipado, incluye maquetas, ensayos y validación de los diseños. "
    "La cuarta, desarrollo, reúne el diseño para manufactura, la documentación técnica, la selección de "
    "procesos y la ingeniería inversa. La quinta, producción, consiste en la puesta en marcha, la "
    "selección de procesos productivos y la gestión de la producción local y en China (Oid, 2024; 2026).",
    ("fig", "Oid_metodologia_full_circle.png", 14.5,
     "Figura 1. Metodología de cinco fases que el estudio denomina full circle. Fuente: Oid (2024)."),
    "La estructura es reconocible: se trata de una versión actualizada del método proyectual moderno, "
    "que avanza del análisis del problema a la definición formal, la verificación y la producción. "
    "Bürdek (1994) muestra que la búsqueda de métodos racionales y secuenciales fue uno de los aportes "
    "centrales de la Escuela de Ulm, y la metodología de OID conserva esa lógica. Las novedades están "
    "en el vocabulario y en los extremos del ciclo: el *sprint* y los talleres de innovación provienen "
    "de la gestión empresarial, y la última fase no termina en la fábrica propia sino en la gestión de "
    "una producción tercerizada.",

    ("h2", "2.3 Evolución de las herramientas y de los campos de trabajo"),
    "Las fuentes institucionales no permiten fechar con precisión la incorporación de cada herramienta, "
    "por lo que la periodización propuesta en la primera etapa de este trabajo debe tomarse con cautela. "
    "Lo que sí puede observarse es un cambio en los campos de trabajo. Los primeros productos premiados "
    "pertenecen al consumo masivo y al equipamiento doméstico: un cepillo dental, un reel de pesca, una "
    "botella, mates y una cocina para la marca Moretti. Los proyectos más recientes que el estudio "
    "destaca pertenecen a la tecnología aplicada: un monitor de siembra de precisión para la empresa "
    "D&E, un sensor inalámbrico de vibraciones para Idear, un topógrafo corneal portátil y un "
    "dispositivo de selección de esperma para técnicas de reproducción asistida (Oid, 2024; 2026).",
    "Este desplazamiento hacia la electrónica, la conectividad y los dispositivos médicos explica la "
    "presencia de herramientas como el modelado 3D, la impresión 3D, el mecanizado por control numérico "
    "computarizado -CNC- y el diseño de carcasas para dispositivos de Internet de las cosas -IoT- en la "
    "oferta del estudio (Oid, 2026). En los términos del capítulo anterior, se trata de rasgos "
    "contemporáneos y no posmodernos: en los casos descritos, estas tecnologías sirven a objetivos de "
    "precisión, resistencia, estanqueidad y fabricación eficiente, es decir, a una racionalidad moderna.",

    ("h2", "2.4 Producción local y global"),
    "El cambio más significativo de la metodología de OID se encuentra en la última fase. El estudio "
    "declara oficinas en tres ciudades -Vicente López, Boise y Hong Kong-, ofrece gestión de producción "
    "local e internacional y se presenta bajo los modelos ODM -*Original Design Manufacturer*, "
    "fabricante de diseño original- y OBM -*Original Brand Manufacturer*, fabricante de marca propia- "
    "(Oid, 2024; 2026). El sitio web, sin embargo, no informa sobre el equipo de trabajo más allá de su "
    "fundador ni menciona un taller o planta propia: la producción aparece siempre como un servicio "
    "gestionado. Esta configuración es central para la pregunta de este trabajo. El taller, entendido "
    "como el espacio donde el diseñador controla la materialización del objeto, no desaparece, pero se "
    "desplaza hacia el prototipado y se transforma, en la escala productiva, en la coordinación de una "
    "red de proveedores. El capítulo siguiente analiza cómo se manifiesta esta tensión en tres productos "
    "concretos.",
]

CAP3 = [
    "Este capítulo responde al tercer objetivo específico: evaluar de manera comparativa un corpus de "
    "tres productos de OID para observar cómo se articula en ellos la tensión entre modernidad y "
    "posmodernidad. El foco se desplaza del discurso a los objetos, que son la evidencia más concreta de "
    "la metodología y, a la vez, la forma de tomar distancia del relato institucional de la empresa.",

    ("h2", "3.1 Criterios, fuentes y método de análisis"),
    "El corpus quedó integrado por el reel de pesca con mosca Puma, el Mate Nelo y el set de "
    "instrumentos antropométricos Holway. Los tres pertenecen a categorías diferentes -deporte, consumo "
    "masivo y equipamiento de medición para la salud- y a momentos distintos de la trayectoria: el reel "
    "fue distinguido en 2007, el mate en 2016 y los instrumentos en 2023 (Oid, 2024). Esta selección "
    "reemplaza al triciclo recreativo previsto en la primera etapa, ya que la revisión de fuentes mostró "
    "que se trata de un trabajo académico del año 2000, anterior a la fundación del estudio (Oid, 2024).",
    "Para evitar reproducir el discurso de la marca, se distinguieron tres tipos de fuentes. Las "
    "institucionales -el sitio web y los folletos- se usan para describir lo que OID dice de sí misma. "
    "Las de validación externa permiten contrastar algunos datos; el caso más sólido es la ficha del Red "
    "Dot Award (Red Dot, 2023). Por último, la observación de las imágenes publicadas se limita a lo "
    "visible. Siguiendo el criterio de la matriz de análisis visual propuesta por la cátedra, toda "
    "afirmación que exceda lo observable se respalda con una fuente o queda planteada como línea de "
    "investigación futura. Cada producto se lee a partir de seis variables -forma y composición, "
    "materiales y procesos, función y uso, dimensión comunicativa, producción y mercado, y validación- "
    "con tres lecturas posibles: moderna, cuando predomina la racionalidad funcional y productiva; "
    "posmoderna, cuando predomina la dimensión comunicativa o identitaria; y contemporánea, cuando el "
    "rasgo es tecnológico y su sentido depende de su uso. El Anexo 1 del Cuerpo C desarrolla la matriz "
    "completa.",

    ("h2", "3.2 Caso 1: el reel Puma, la técnica como imagen"),
    "El reel Puma es un producto deportivo para pesca con mosca desarrollado para la empresa Correntoso. "
    "El folleto del estudio lo presenta como un reel de pesca con mosca de innovación premiada (Oid, "
    "2020) y registra para un reel de pesca con mosca el primer premio INNOVAR 2007 en la Categoría "
    "Diseño Industrial (Oid, 2024). Más allá de esas menciones, las fuentes institucionales no describen "
    "el proyecto en detalle, por lo que el análisis se apoya en la observación de las imágenes "
    "publicadas, que muestran una pieza de aluminio con acabado de mecanizado, propio de los procesos "
    "CNC (Figura 2).",
    ("fig", "Oid_reel_Puma.png", 11,
     "Figura 2. Reel de pesca con mosca Puma, cliente Correntoso. Fuente: Oid (2024)."),
    "En la forma y en los procesos, el reel responde a una lógica moderna. Su geometría es simétrica y "
    "ordenada, las nervaduras radiales responden a la resistencia estructural con el menor material "
    "posible y el acabado mecanizado remite a la precisión y la durabilidad. Sin embargo, el rasgo "
    "dominante del objeto es el gran orificio central, que deja a la vista el mecanismo y se aparta de "
    "la imagen más cerrada de un carrete convencional. Ese gesto desplaza el sentido del vaciado: deja "
    "de ser solo una decisión técnica para convertirse en un signo. En términos de Jencks (1977/1980), "
    "el objeto opera con doble codificación, ya que el pescador experto lee en él un mecanismo y el "
    "público general, un objeto de imagen fuerte y novedosa. El Puma ocupa así el punto medio del par "
    "dialéctico: no hay en él ornamento, ironía ni cita, pero la técnica se exhibe con una intención "
    "comunicativa evidente, en la línea de la ampliación de la función práctica hacia la función "
    "comunicativa que describe Bürdek (1994).",

    ("h2", "3.3 Caso 2: el Mate Nelo, la tradición como estilo de vida"),
    "El Mate Nelo fue desarrollado para la marca Nelo, cuyo director, Ignacio Muñoz de Toro, aparece "
    "entre los testimonios del sitio del estudio (Oid, 2026). El folleto lo describe como un diseño de "
    "mates de concepto joven e innovador y registra que recibió el Sello de Buen Diseño en 2016 (Oid, "
    "2024). La fecha de diseño no pudo verificarse, por lo que se toma como referencia el año de la "
    "distinción.",
    ("fig", "Oid_mates_Nelo_serie.png", 10,
     "Figura 3. Serie de colores del Mate Nelo. Fuente: Oid (2024)."),
    "En las imágenes publicadas se distingue un volumen ovoide compuesto por dos partes: una carcasa de "
    "color y una boca blanca que recibe la bombilla (Figura 3). La silueta del mate tradicional se "
    "conserva, pero simplificada y limpia de las referencias artesanales que suele tener el objeto. Lo "
    "que caracteriza al producto es la serie: el mismo cuerpo se ofrece en una amplia gama de colores "
    "saturados. La forma y la producción son modernas, ya que se trata de un objeto seriado y "
    "estandarizado, pero el valor del producto reside principalmente en su significado. El Mate Nelo "
    "toma un ritual cotidiano argentino y lo reformula como objeto de identidad y de estilo de vida "
    "dirigido a un consumidor joven; el color no responde a una necesidad funcional, sino que construye "
    "pertenencia y elección personal. Es el caso con mayor carga posmoderna del corpus, aunque esa carga "
    "no proviene de una ruptura formal como la de Memphis, sino de la conversión de la tradición en "
    "marca.",

    ("h2", "3.4 Caso 3: los instrumentos Holway, la buena forma premiada"),
    "El set de instrumentos antropométricos Holway es el caso mejor documentado, porque cuenta con una "
    "fuente externa. La ficha del Red Dot Award: Product Design 2023 registra como fabricante a Holway, "
    "de Buenos Aires, y como diseño a Ordonez ID junto con Rapids, de Hong Kong (Red Dot, 2023). Este "
    "último dato no aparece en el folleto institucional, que presenta el proyecto como propio y atribuye "
    "el cliente a Estados Unidos (Oid, 2024). La diferencia muestra que el trabajo de OID se inserta en "
    "una red internacional de colaboración que el relato de la marca simplifica.",
    ("fig", "Oid_Holway_vista.png", 12,
     "Figura 4. Set de instrumentos antropométricos Holway, Red Dot Award 2023. Fuente: Oid (2024)."),
    "Según el sitio del estudio, el proyecto consistió en desarrollar una familia de instrumentos de "
    "alta precisión con nuevos materiales, mejor legibilidad, un lenguaje visual alineado a la marca a "
    "través del color, la forma y los materiales, y un estuche liviano (Oid, 2026). La ficha del Red Dot "
    "agrega que las piezas son de aluminio anodizado, de perfil muy delgado, y que el punto cero de cada "
    "instrumento puede calibrarse con tornillos especiales (Red Dot, 2023). Es el caso más cercano a la "
    "tradición moderna: la forma deriva de la función de medir, la legibilidad es prioritaria y el "
    "conjunto responde a una lógica de familia coherente (Figura 4). Conviene señalar que la primera "
    "etapa de esta investigación atribuyó a estos instrumentos la integración de sensores e IoT, un dato "
    "que no se confirma en ninguna de las fuentes consultadas: se trata de instrumentos mecánicos. La "
    "dimensión posmoderna es moderada y se limita a la alineación del lenguaje visual con la identidad "
    "de la marca. El premio valida, en definitiva, una buena forma en el sentido más clásico del término.",

    ("h2", "3.5 Análisis comparativo"),
    "La Tabla 1 sintetiza la lectura de los tres casos. El resultado más claro es que ninguno de los "
    "productos es posmoderno en el sentido histórico del término: en ninguno aparecen el ornamento, la "
    "ironía, la cita o el eclecticismo que definieron al *Radical Design* y a Memphis (Sparke, 2010). En "
    "los tres, en cambio, la forma, los materiales y la función responden a una racionalidad moderna, "
    "cercana a la idea de buena forma que Maldonado (1993) asocia a la herencia de Ulm.",
    ("table",),
    "Lo posmoderno aparece en otro nivel: en la dimensión comunicativa de los objetos y, sobre todo, en "
    "su inserción en el mercado. El Puma convierte la técnica en imagen, el Mate Nelo convierte la "
    "tradición en marca y los instrumentos Holway alinean su lenguaje con la identidad del cliente. A la "
    "vez, los tres circulan en redes que exceden el taller local: un cliente de nicho, una marca de "
    "consumo y una colaboración con un estudio de Hong Kong. El análisis permite también tomar distancia "
    "del discurso institucional. El folleto resume la propuesta del estudio en la frase “buenos diseños, "
    "buenos negocios” (Oid, 2024, s. p.), una retórica que coincide con la legitimación por la "
    "performatividad que Lyotard (1979/1987) asocia a la condición posmoderna: el diseño ya no se "
    "justifica por un proyecto social, como en el funcionalismo o en la crítica de Papanek (1971/1977), "
    "sino por su rendimiento económico. La posmodernidad de OID, entonces, está menos en sus objetos que "
    "en el modo en que el estudio se describe y se ofrece al mercado.",
]

CONCL = [
    "Esta investigación se preguntó de qué manera la evolución metodológica y proyectual de Ordóñez "
    "Industrial Design articula la tensión entre modernidad y posmodernidad en el diseño industrial "
    "argentino contemporáneo. La respuesta que surge del recorrido es que OID no transita de un "
    "paradigma al otro, como se planteó en la hipótesis inicial, sino que los distribuye en niveles "
    "diferentes. En el nivel del objeto, el estudio se mantiene fiel a una racionalidad moderna: forma "
    "derivada de la función, precisión, orden y buena factura. En el nivel de la comunicación y de la "
    "gestión, adopta lógicas posmodernas: el producto como signo, la tradición como marca, el diseño "
    "como servicio estratégico y la legitimación por el resultado comercial.",

    "El título de este trabajo, *Entre el taller y la estrategia*, adquiere así un sentido más preciso. "
    "El taller no desaparece: sigue presente en el prototipado, el ensayo y la atención a los procesos "
    "que la propia metodología del estudio declara en sus cinco fases. Pero su lugar cambia. A medida "
    "que el estudio suma sedes en Boise y Hong Kong y ofrece gestión de producción local y en China, el "
    "taller deja de ser un espacio propio de fabricación para convertirse en la gestión de una red de "
    "talleres ajenos. La estrategia no reemplaza al oficio: lo administra.",

    "En relación con el contexto regional, el caso permite releer la noción de diseño de la periferia "
    "propuesta por Bonsiepe (1985). OID representa una variante contemporánea de esa condición: un "
    "estudio argentino que exporta conocimiento proyectual a clientes de otros países, mientras la "
    "fabricación se desplaza hacia donde resulta más eficiente. La periferia ya no solo importa diseño; "
    "también lo produce y lo vende, aunque la manufactura siga ocurriendo en otra parte. Esta lectura se "
    "vincula con la historiografía latinoamericana que analiza la relación entre diseño, "
    "industrialización y autonomía (Fernández y Bonsiepe, 2008).",

    "Este trabajo presenta limitaciones que conviene explicitar. La mayor parte de la información "
    "proviene de fuentes institucionales del propio estudio, y solo el premio Red Dot pudo contrastarse "
    "con una fuente independiente. Los premios INNOVAR, el Sello de Buen Diseño y la selección para el "
    "libro de 2019 deberían verificarse en los registros de cada institución, y no se contó con fuentes "
    "primarias, como entrevistas a su fundador, a su equipo o a sus clientes. Estas ausencias abren "
    "líneas futuras de investigación: una entrevista en profundidad con Ignacio Ordóñez, el análisis de "
    "los procesos de producción tercerizados y la comparación de OID con otros estudios argentinos "
    "surgidos después de 2001.",

    "Como reflexión final, el caso muestra que el par modernidad/posmodernidad sigue siendo una "
    "herramienta útil para pensar el diseño industrial actual, siempre que se lo utilice con precisión "
    "histórica. No todo lo nuevo es posmoderno: muchas de las tecnologías y discursos contemporáneos "
    "prolongan, en realidad, el proyecto moderno de eficiencia y control. Para quien se forma en diseño, "
    "la principal enseñanza de este recorrido es metodológica: distinguir entre lo que una empresa dice "
    "de sí misma y lo que sus objetos efectivamente muestran, y respaldar cada afirmación con una fuente. "
    "Esa distancia crítica es la que permite que la historia del diseño deje de ser una colección de "
    "casos exitosos y se convierta en una herramienta para comprender la práctica profesional.",
]

REFS = [
    "Battista, E. (2015). Diseño sustentable: del discurso a la práctica. En M. R. Bernatene (Coord.), *La historia del diseño industrial reconsiderada* (pp. 117-135). Facultad de Bellas Artes, Universidad Nacional de La Plata.",
    "Beducci, L. (2015). La materia oscura del diseño. Miniaturización e inmaterialidad en el escenario del diseño posmoderno. En M. R. Bernatene (Coord.), *La historia del diseño industrial reconsiderada* (pp. 77-98). Facultad de Bellas Artes, Universidad Nacional de La Plata.",
    "Bernatene, M. R. (Coord.). (2015). *La historia del diseño industrial reconsiderada*. Facultad de Bellas Artes, Universidad Nacional de La Plata.",
    "Blanco, R. (2012). *Diseño industrial argentino*. Ediciones Franz Viegener.",
    "Bonsiepe, G. (1985). *El diseño de la periferia. Debates y experiencias*. Gustavo Gili.",
    "Bürdek, B. E. (1994). *Diseño. Historia, teoría y práctica del diseño industrial*. Gustavo Gili.",
    "Fernández, S. y Bonsiepe, G. (Coords.). (2008). *Historia del diseño en América Latina y el Caribe. Industrialización y comunicación visual para la autonomía*. Blucher.",
    "Jencks, C. (1980). *El lenguaje de la arquitectura posmoderna*. Gustavo Gili. (Trabajo original publicado en 1977)",
    "Krippendorff, K. y Butter, R. (1984). Product semantics: Exploring the symbolic qualities of form. *Innovation*, 3(2), 4-9.",
    "Lyotard, J.-F. (1987). *La condición postmoderna. Informe sobre el saber*. Cátedra. (Trabajo original publicado en 1979)",
    "Maldonado, T. (1993). *El diseño industrial reconsiderado*. Gustavo Gili.",
    "Oid -Ordóñez Industrial Design-. (2020). *Brochure* [Folleto institucional en inglés]. https://www.ordonezid.com/_files/ugd/88c01e_417623f0e4524e74b5d388d8c8f62554.pdf",
    "Oid -Ordóñez Industrial Design-. (2024). *Folleto institucional*. https://www.ordonezid.com/_files/ugd/88c01e_11efe85fc5584fa2b0f5dde7584deba5.pdf",
    "Oid -Ordóñez Industrial Design-. (2026). *Oid. Diseño industrial y producción desde 2001* [Sitio web]. https://www.ordonezid.com",
    "Papanek, V. (1977). *Diseñar para el mundo real. Ecología humana y cambio social*. H. Blume. (Trabajo original publicado en 1971)",
    "Red Dot. (2023). *Anthropometric Instruments Set. Red Dot Award: Product Design 2023*. https://www.red-dot.org/project/anthropometric-instruments-set-64026",
    "Sparke, P. (2010). *Diseño y cultura. Una introducción. Desde 1900 hasta la actualidad*. Gustavo Gili.",
    "Venturi, R. (1978). *Complejidad y contradicción en la arquitectura* (2.ª ed.). Gustavo Gili. (Trabajo original publicado en 1966)",
]
# Bibliografía: obras consultadas (incluye las citadas, como en el modelo de la cátedra)
BIBLIO_EXTRA = [
    "Oid -Ordóñez Industrial Design-. (2026). *Casos de éxito* [Sitio web]. https://www.ordonezid.com/success",
    "Oid -Ordóñez Industrial Design-. (2026). *Sobre nosotros* [Sitio web]. https://www.ordonezid.com/sobre-nosotros",
]

MATRIX = [
    ["Variable", "Reel Puma (INNOVAR 2007)", "Mate Nelo (Sello de Buen Diseño 2016)", "Instrumentos Holway (Red Dot 2023)"],
    ["Forma y composición", "Disco simétrico con gran vaciado central y nervaduras radiales. (M)", "Volumen ovoide de dos partes; silueta tradicional simplificada. (M / P)", "Familia de piezas planas y geométricas; escalas legibles. (M)"],
    ["Materiales y procesos", "Aluminio con acabado mecanizado, visible en las imágenes. (C al servicio de M)", "Producción seriada en variantes de color; materiales no detallados en las fuentes. (M)", "Aluminio anodizado; calibración del punto cero. (C al servicio de M)"],
    ["Función y uso", "El mecanismo organiza la pieza; el centro queda a la vista. (M)", "Conserva el ritual de uso sin alterarlo. (M)", "Precisión, legibilidad y calibración; estuche liviano. (M)"],
    ["Dimensión comunicativa", "El vaciado se vuelve rasgo de identidad: la técnica como imagen. (P)", "Color como identidad, “concepto joven”: la tradición como estilo de vida. (P)", "Lenguaje visual alineado a la marca. (P moderada)"],
    ["Producción y mercado", "Cliente Correntoso; nicho deportivo. (P: segmentación)", "Consumo masivo; marca Nelo. (P: marca)", "Fabricante Holway; co-diseño con Rapids (Hong Kong). (P: red global)"],
    ["Validación", "Primer premio INNOVAR (según Oid, 2024).", "Sello de Buen Diseño (según Oid, 2024).", "Red Dot 2023 (verificado en Red Dot, 2023)."],
    ["Lectura en el par", "Moderno en la forma, posmoderno en la comunicación.", "Mayor carga posmoderna: el valor está en el significado.", "Predominio moderno: la buena forma como valor."],
]

FUENTES = [
    ["Dato", "Fuente", "Estado"],
    ["Fundación en 2001 por Ignacio Ordóñez", "Oid (2026)", "Institucional, sin fuente externa"],
    ["Oficinas en Vicente López, Boise y Hong Kong", "Oid (2024; 2026)", "Institucional, sin fuente externa"],
    ["Triciclo recreativo, París, 2000 (UBA)", "Oid (2024)", "Institucional; anterior a la fundación"],
    ["Baño químico, Milán, 2002 (UBA)", "Oid (2024)", "Institucional; trabajo académico"],
    ["Primer premio INNOVAR 2007, reel de pesca con mosca", "Oid (2024)", "Institucional, a verificar en INNOVAR"],
    ["Sello de Buen Diseño 2016, Mate Nelo y Mate Mito", "Oid (2024)", "Institucional, a verificar en el programa"],
    ["Selección para *ABC del Diseño Industrial Latinoamericano*, 2019", "Oid (2024)", "Institucional, a verificar en el libro"],
    ["Red Dot Award 2023, instrumentos Holway", "Red Dot (2023)", "Verificado; agrega co-diseño con Rapids"],
    ["Cliente de Holway en Estados Unidos", "Oid (2024)", "Contradice a Red Dot (2023), que indica Buenos Aires"],
    ["Sensores e IoT en los instrumentos Holway", "Etapa 1 de este trabajo", "No confirmado; descartado"],
]


def grid(data, widths, header=True):
    rows = [[Paragraph(md(c), CELL) for c in r] for r in data]
    t = Table(rows, colWidths=widths, repeatRows=1)
    st = [("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#888888")),
          ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]
    if header:
        st.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8E8E8")))
    t.setStyle(TableStyle(st))
    return t


def render(items):
    out = []
    for it in items:
        if isinstance(it, str):
            out.append(P(it))
        elif it[0] == "h2":
            out.append(Heading(it[1], H2, toc=False))
        elif it[0] == "quote":
            out.append(P(it[1], QUOTE))
        elif it[0] == "fig":
            out.append(fig(it[1], it[2], it[3]))
        elif it[0] == "table":
            W = A4[0] - 5 * cm
            out.append(KeepTogether([
                Caption("Tabla 1. Síntesis de la matriz de análisis comparativo. M: lectura moderna; "
                        "P: lectura posmoderna; C: rasgo contemporáneo o tecnológico.", "TabEntry"),
                grid(MATRIX, [W * 0.19, W * 0.27, W * 0.27, W * 0.27]),
                P("Fuente: Elaboración propia a partir de Oid (2020; 2024; 2026) y Red Dot (2023).", CAP)]))
    return out


def cuerpo_b():
    s = cover("Cuerpo B")
    s += [Heading("Resumen"), P(RESUMEN),
          P("Palabras clave: diseño industrial argentino; modernidad; posmodernidad; Ordóñez Industrial "
            "Design; diseño de la periferia"),
          PageBreak(),
          Paragraph("<b>Índice</b>", H1), toc(), PageBreak(),
          Heading("Introducción")]
    s += [P(t) for t in INTRO] + [PageBreak()]
    s += [Heading("Capítulo 1. Modernidad y posmodernidad como par de lectura. Fundación y "
                  "posicionamiento de OID")] + render(CAP1) + [PageBreak()]
    s += [Heading("Capítulo 2. Metodología proyectual: del taller a la gestión")] + render(CAP2) + [PageBreak()]
    s += [Heading("Capítulo 3. Tres productos frente a la hipótesis: Puma, Mate Nelo y Holway")] + render(CAP3) + [PageBreak()]
    s += [Heading("Conclusiones")] + [P(t) for t in CONCL] + [PageBreak()]
    s += [Heading("Referencias bibliográficas")] + [P(r, REF) for r in REFS] + [PageBreak()]
    s += [Heading("Bibliografía")] + [P(r, REF) for r in sorted(REFS + BIBLIO_EXTRA)] + [PageBreak()]
    s += [Heading("Lista de figuras"),
          P("Figura 1. Metodología de cinco fases que el estudio denomina *full circle*. Fuente: Oid (2024).", REF),
          P("Figura 2. Reel de pesca con mosca Puma, cliente Correntoso. Fuente: Oid (2024).", REF),
          P("Figura 3. Serie de colores del Mate Nelo. Fuente: Oid (2024).", REF),
          P("Figura 4. Set de instrumentos antropométricos Holway, Red Dot Award 2023. Fuente: Oid (2024).", REF),
          P("Figura 5. Monitor de siembra de precisión para D&E. Fuente: Oid (2024).", REF),
          P("Figura 6. Sensor de vibraciones para Idear. Fuente: Oid (2024).", REF),
          P("Figura 7. Topógrafo corneal portátil. Fuente: Oid (2024).", REF),
          P("Figura 8. Botella de agua mineral para Gota. Fuente: Oid (2024).", REF),
          PageBreak()]
    return s


# ================================================================== CUERPO C
def cuerpo_c():
    W = A4[0] - 5 * cm
    s = cover("Cuerpo C", extra="Anexos")
    s += [Paragraph("<b>Índice de tablas y figuras</b>", H1),
          Paragraph("<b>Índice de tablas</b>", H2), toc("TabEntry"),
          Paragraph("<b>Índice de figuras</b>", H2), toc("FigEntry"), PageBreak()]
    s += [Heading("Cuerpo C. Anexo 1. Matriz de análisis comparativo", H1),
          P("La matriz desarrolla la lectura de los tres productos analizados en el Capítulo 3. Cada "
            "celda distingue el dato observable o documentado de su lectura en el par dialéctico. Los "
            "datos provienen de fuentes institucionales, de la ficha del Red Dot y de la observación de "
            "imágenes publicadas, sin observación directa de los productos."),
          Caption("Tabla 2. Matriz de análisis comparativo del corpus.", "TabEntry"),
          grid(MATRIX, [W * 0.19, W * 0.27, W * 0.27, W * 0.27]),
          P("Fuente: Elaboración propia a partir de Oid (2020; 2024; 2026) y Red Dot (2023).", CAP),
          PageBreak(),
          Heading("Anexo 2. Relevamiento y verificación de fuentes sobre OID", H1),
          P("El cuadro registra los principales datos sobre OID utilizados en el ensayo, su fuente y el "
            "estado de verificación. Responde a la necesidad de distinguir el relato institucional de "
            "los datos contrastados."),
          Caption("Tabla 3. Relevamiento y verificación de fuentes.", "TabEntry"),
          grid(FUENTES, [W * 0.46, W * 0.2, W * 0.34]),
          P("Fuente: Elaboración propia a partir de Oid (2024; 2026) y Red Dot (2023).", CAP),
          PageBreak(),
          Heading("Anexo 3. Figuras complementarias: otros proyectos de OID", H1),
          P("Las figuras muestran proyectos recientes del estudio vinculados a la tecnología aplicada, "
            "mencionados en el Capítulo 2. Se incluyen en este anexo porque superan el límite de cinco "
            "figuras en el cuerpo del texto.")]
    for f, c in [("Oid_portfolio_p-000.png", "Figura 5. Monitor de siembra de precisión para D&E. Fuente: Oid (2024)."),
                 ("Oid_portfolio_p-011.png", "Figura 6. Sensor de vibraciones para Idear. Fuente: Oid (2024)."),
                 ("Oid_portfolio_p-009.png", "Figura 7. Topógrafo corneal portátil. Fuente: Oid (2024)."),
                 ("Oid_portfolio_p-004.png", "Figura 8. Botella de agua mineral para Gota. Fuente: Oid (2024).")]:
        s.append(fig(f, 9.5, c))
    return s


def build():
    doc = Doc(OUT, pagesize=A4, leftMargin=2.5 * cm, rightMargin=2.5 * cm, topMargin=2.5 * cm,
              bottomMargin=2.5 * cm, title=f"{TITULO} — Proyecto Integrador", author=AUTOR)
    story = cuerpo_a() + cuerpo_b() + cuerpo_c()
    doc.multiBuild(story, onFirstPage=footer, onLaterPages=footer)
    print("OK ->", OUT)


if __name__ == "__main__":
    build()
