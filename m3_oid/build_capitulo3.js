// Genera Capitulo3_y_Conclusiones_OID.docx según las pautas de la cátedra:
// Calibri 11, interlineado 1,5, títulos en negrita a margen izquierdo, párrafos
// sin sangría, epígrafes de figuras en tamaño 9 centrados, normas APA.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, ShadingType, BorderStyle, ImageRun, PageBreak, Footer,
  PageNumber, HeadingLevel,
} = require("docx");

const FONT = "Calibri";
const LINE = 360; // 1,5

const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { line: LINE, after: 160 },
    alignment: AlignmentType.JUSTIFIED,
    children: runs(text, opts),
  });

// *texto* = itálica (solo títulos de obras y términos extranjeros)
function runs(text, opts = {}) {
  return text.split(/(\*[^*]+\*)/).filter(Boolean).map((t) =>
    t.startsWith("*")
      ? new TextRun({ text: t.slice(1, -1), italics: true, font: FONT, size: opts.size || 22 })
      : new TextRun({ text: t, font: FONT, size: opts.size || 22 }));
}

const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, font: FONT, size: 26 })] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, font: FONT, size: 22 })] });

const caption = (text) =>
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: runs(text, { size: 18 }) });

const ref = (text) =>
  new Paragraph({ spacing: { line: LINE, after: 120 }, indent: { left: 720, hanging: 720 }, children: runs(text) });

function figure(file, w, h) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(__dirname, "images", file)), transformation: { width: w, height: h } })],
  });
}

// ---------------------------------------------------------------- matriz
const border = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const COLS = [1700, 2442, 2442, 2442]; // total 9026 (A4 con márgenes de 2,5 cm)
function cell(text, i, head = false) {
  return new TableCell({
    width: { size: COLS[i], type: WidthType.DXA },
    borders,
    shading: head ? { type: ShadingType.CLEAR, fill: "E8E8E8", color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({ children: runs(text, { size: 18 }) })],
  });
}
const MATRIX = [
  ["Variable", "Reel Puma (premio INNOVAR 2007)", "Mate Nelo (Sello de Buen Diseño 2016)", "Instrumentos Holway (Red Dot 2023)"],
  ["Forma y composición", "Disco simétrico con gran vaciado central y nervaduras radiales. Geometría ordenada por el mecanismo. (M)", "Volumen ovoide de dos partes: carcasa de color y boca blanca. Silueta reconocible del mate tradicional, simplificada. (M / P)", "Familia de piezas planas, delgadas y geométricas; escalas legibles. Orden y coherencia de sistema. (M)"],
  ["Materiales y procesos", "Aluminio mecanizado por CNC, tecnología de alta precisión. (C al servicio de M)", "Producción seriada en variantes de color; los materiales no se detallan en las fuentes consultadas. (M)", "Aluminio anodizado; tornillos de calibración del punto cero. (C al servicio de M)"],
  ["Función y uso", "Sistema de freno potente como foco del proyecto. (M)", "Conserva el ritual de uso sin alterarlo; mejora la manipulación cotidiana. (M)", "Precisión, legibilidad y calibración; estuche liviano para el profesional. (M)"],
  ["Dimensión comunicativa", "El vaciado exhibe el concepto mecánico y rompe parámetros estéticos del rubro: la técnica se vuelve imagen. (P)", "Color como identidad, \"concepto joven\"; la tradición se ofrece como estilo de vida. (P)", "Lenguaje visual alineado a la marca mediante color, forma y material. (P moderada)"],
  ["Producción y mercado", "Cliente Correntoso; nicho deportivo internacional. (P: segmentación)", "Consumo masivo local y regional; marca Nelo. (P: marca)", "Fabricante Holway (Buenos Aires); co-diseño con Rapids (Hong Kong). (P: red global)"],
  ["Validación", "Primer premio INNOVAR, Categoría Diseño Industrial (según Oid, 2024).", "Sello de Buen Diseño, Argentina (según Oid, 2024).", "Red Dot Award: Product Design 2023 (Red Dot, 2023)."],
  ["Lectura en el par", "Moderno en la forma, posmoderno en la comunicación. Punto medio.", "Mayor carga posmoderna: el valor está en el significado.", "Predominio moderno: la buena forma como valor."],
];
const matrix = new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: COLS,
  rows: MATRIX.map((r, ri) => new TableRow({ tableHeader: ri === 0, children: r.map((t, i) => cell(t, i, ri === 0 || i === 0)) })),
});

// ---------------------------------------------------------------- texto
const body = [
  h1("Capítulo 3. Tres productos, una tensión: análisis del corpus de OID"),
  p("Este capítulo responde al tercer objetivo específico: evaluar de manera comparativa un corpus de tres productos de Ordóñez Industrial Design -OID, también presentada como Oid- para observar cómo se articula en ellos la tensión entre modernidad y posmodernidad. Los dos capítulos anteriores reconstruyeron el marco teórico y la metodología declarada del estudio; aquí el foco se desplaza a los objetos, que son la evidencia más concreta de esa metodología y, a la vez, la forma de tomar distancia del relato institucional de la propia empresa."),

  h2("3.1 Criterios, fuentes y método de análisis"),
  p("El corpus quedó integrado por el reel de pesca con mosca Puma, el Mate Nelo y el set de instrumentos antropométricos Holway. Los tres pertenecen a categorías diferentes (deporte, consumo masivo y equipamiento de medición para la salud) y a momentos distintos de la trayectoria: el reel fue distinguido en 2007, el mate en 2016 y los instrumentos en 2023 (Oid, 2024). Esta selección reemplaza al triciclo recreativo previsto en la primera etapa. La revisión de fuentes mostró que el triciclo figura en la línea de tiempo institucional con fecha 2000, es decir, antes de la fundación del estudio, y como pieza exhibida en París en representación de la Universidad de Buenos Aires (Oid, 2024). Se trata, por lo tanto, de un trabajo académico y no de un producto de OID. Su presencia en el folleto institucional es, de todos modos, un dato significativo: muestra cómo la empresa construye su historia integrando en ella la etapa formativa de su fundador."),
  p("Para evitar reproducir el discurso de la marca, se distinguieron tres tipos de fuentes. Las institucionales (el sitio web y el folleto de 2024) se usan para describir lo que OID dice de sí misma. Las de validación externa permiten contrastar algunos datos: el caso más sólido es la ficha del Red Dot Award, que confirma el premio de 2023 y agrega información que el folleto no menciona (Red Dot, 2023). Por último, la observación directa de las imágenes publicadas se limita a lo visible. Siguiendo el criterio de la matriz de análisis visual propuesta por la cátedra, toda afirmación que exceda lo observable se respalda con una fuente o queda planteada como línea de investigación futura."),
  p("La revisión del marco teórico obligó, además, a precisar qué se considera posmoderno. En el primer capítulo se asociaron a la posmodernidad rasgos como la manufactura aditiva, la experiencia de usuario o la sustentabilidad. Esa asociación resulta discutible. Históricamente, el posmodernismo en diseño se define por una crítica a la buena forma funcionalista que tiene su origen en la arquitectura: la defensa de la complejidad y la contradicción frente a la pureza moderna (Venturi, 1978) y la idea de un lenguaje de doble codificación, capaz de hablar a la vez al especialista y al público (Jencks, 1980). En el diseño de objetos, esa crítica toma forma en el Radical Design italiano de los años sesenta y setenta y, sobre todo, en el grupo Memphis, reunido por Ettore Sottsass en 1981, que reivindicó el ornamento, el color, la ironía y la cita (Sparke, 2010). En el plano teórico, Bürdek (1994) ubica este giro en la creciente importancia de la función comunicativa del producto, línea que la semántica del producto formalizó como estudio de las cualidades simbólicas de la forma (Krippendorff y Butter, 1984)."),
  p("Desde esta perspectiva, las tecnologías digitales, la impresión 3D o la sustentabilidad no son posmodernas en sí mismas. Son rasgos contemporáneos que pueden ponerse al servicio de objetivos plenamente modernos, como la precisión, la eficiencia o la optimización productiva. Beducci (2015) muestra que la miniaturización y la inmaterialidad tienen un origen tecnológico antes que estético, y Battista (2015) advierte sobre la distancia entre el discurso sustentable y su práctica efectiva. Para el análisis se utiliza, entonces, una matriz con tres lecturas posibles para cada variable: moderna (M), cuando predomina la racionalidad funcional y productiva heredera de la Bauhaus y de la escuela de Ulm (Maldonado, 1993); posmoderna (P), cuando predomina la dimensión comunicativa, simbólica o identitaria; y contemporánea (C), cuando el rasgo es tecnológico y su sentido depende de cómo se lo utilice. Las variables observadas son seis: forma y composición, materiales y procesos, función y uso, dimensión comunicativa, producción y mercado, y validación institucional."),

  h2("3.2 Caso 1: el reel Puma, la técnica como imagen"),
  p("El reel Puma es un producto deportivo para pesca con mosca desarrollado para la empresa Correntoso. El folleto institucional lo presenta como un reel de innovación premiada y registra para un reel de pesca con mosca el primer premio INNOVAR 2007 en la Categoría Diseño Industrial (Oid, 2024). La ficha del proyecto difundida por el estudio indica que el foco estuvo puesto en la innovación mecánica, cuyo resultado fue un sistema de freno potente, y que la pieza fue pensada para producirse en aluminio mecanizado por control numérico computarizado -CNC-, una tecnología de alta precisión (Oid, s. f.)."),
  p("En la forma y en los procesos, el reel responde a una lógica moderna. Su geometría es simétrica y ordenada, las nervaduras radiales son consecuencia de la resistencia estructural y la elección del mecanizado CNC privilegia la precisión y la durabilidad. Sin embargo, la misma ficha reconoce que el gran orificio central fue pensado para mostrar el concepto mecánico y, al mismo tiempo, romper con los parámetros estéticos conocidos del rubro (Oid, s. f.). Ese gesto desplaza el sentido del vaciado: deja de ser solo una decisión técnica para convertirse en un signo. En términos de Jencks (1980), el objeto opera con doble codificación, ya que el pescador experto lee en él un mecanismo y el público general lee un objeto de imagen fuerte y novedosa."),
  p("El Puma ocupa así el punto medio del par dialéctico. No hay en él ornamento, ironía ni cita, rasgos propios del posmodernismo histórico, pero la técnica se exhibe con una intención comunicativa explícita. Es, en este sentido, un ejemplo de lo que Bürdek (1994) describe como la ampliación de la función práctica hacia la función comunicativa del producto."),

  h2("3.3 Caso 2: el Mate Nelo, la tradición como estilo de vida"),
  p("El Mate Nelo fue desarrollado para la marca Nelo, cuyo director, Ignacio Muñoz de Toro, aparece entre los testimonios del sitio del estudio (Oid, 2026). El folleto lo describe como un diseño de mates de concepto joven e innovador y registra que recibió el Sello de Buen Diseño de Argentina en 2016, el mismo año en que fue distinguido el Mate Mito, otro producto del estudio (Oid, 2024). La fecha de diseño no pudo verificarse en las fuentes consultadas, por lo que se toma como referencia el año de la distinción."),
  p("En la observación de las imágenes publicadas se distingue un volumen ovoide compuesto por dos partes: una carcasa de color y una boca blanca que recibe la bombilla. La silueta del mate tradicional se conserva, pero simplificada y limpia de las referencias artesanales que suele tener el objeto. Lo que caracteriza al producto es la serie: el mismo cuerpo se ofrece en una amplia gama de colores saturados. Aquí la lectura se invierte respecto del caso anterior. La forma y la producción son modernas, ya que se trata de un objeto seriado, estandarizado y sin variaciones morfológicas, pero el valor del producto reside principalmente en su significado."),
  p("El Mate Nelo toma un ritual cotidiano argentino y lo reformula como objeto de identidad y de estilo de vida, dirigido a un consumidor joven. El color no organiza información ni responde a una necesidad funcional: construye pertenencia y elección personal. Es el caso con mayor carga posmoderna del corpus, aunque esa carga no proviene de una ruptura formal como la de Memphis, sino de la conversión de la tradición en marca. También es el caso que mejor permite observar la tensión entre lo local y lo global: un objeto profundamente territorial, reinterpretado con códigos del diseño de consumo internacional."),

  h2("3.4 Caso 3: los instrumentos Holway, la buena forma premiada"),
  p("El set de instrumentos antropométricos Holway es el caso mejor documentado del corpus, porque cuenta con una fuente externa. La ficha del Red Dot Award: Product Design 2023 registra como fabricante a Holway, de Buenos Aires, y como diseño a Ordonez ID junto con Rapids, de Hong Kong (Red Dot, 2023). Este último dato no aparece en el folleto institucional, que presenta el proyecto como propio y atribuye el cliente a Estados Unidos (Oid, 2024). La diferencia es relevante para la investigación: muestra que el trabajo de OID se inserta en una red internacional de colaboración y que el relato de la marca simplifica esa red."),
  p("Según el sitio del estudio, el proyecto consistió en desarrollar una familia de instrumentos de alta precisión para un referente en medicina del deporte, nutrición y antropometría, con nuevos materiales, mejor precisión y legibilidad, un lenguaje visual alineado a la marca a través del color, la forma y los materiales, y un estuche liviano y cómodo (Oid, 2026). La ficha del Red Dot agrega que las piezas son de aluminio anodizado, de perfil muy delgado y alta durabilidad, que el punto cero de cada instrumento puede calibrarse con tornillos especiales y que el jurado destacó su factura y su estilo geométrico (Red Dot, 2023)."),
  p("Es el caso más cercano a la tradición moderna. La forma deriva de la función de medir, la legibilidad de las escalas es prioritaria y el sistema de piezas responde a una lógica de familia coherente. Conviene señalar que la primera etapa de esta investigación atribuyó a estos instrumentos la integración de sensores y tecnología IoT -Internet de las cosas-, un dato que no se confirma en ninguna de las fuentes consultadas: se trata de instrumentos mecánicos. La dimensión posmoderna existe, pero es moderada y se limita a la alineación del lenguaje visual con la identidad de la marca. El premio, en definitiva, valida una buena forma en el sentido más clásico del término."),

  h2("3.5 Análisis comparativo transversal"),
  p("La Tabla 1 sintetiza la lectura de las seis variables en los tres casos. El resultado más claro es que ninguno de los productos es posmoderno en el sentido histórico del término. En ninguno aparecen el ornamento, la ironía, la cita o el eclecticismo que definieron al Radical Design y a Memphis (Sparke, 2010). En los tres, en cambio, la forma, los materiales y la función responden a una racionalidad moderna, cercana a la idea de buena forma que Maldonado (1993) asocia a la herencia de Ulm."),
  caption("Tabla 1. Matriz de análisis comparativo del corpus. M: lectura moderna; P: lectura posmoderna; C: rasgo contemporáneo o tecnológico."),
  matrix,
  caption("Fuente: Elaboración propia a partir de Oid (2024; 2026; s. f.) y Red Dot (2023)."),
  p("Lo posmoderno aparece en otro nivel: en la dimensión comunicativa de los objetos y, sobre todo, en su inserción en el mercado. El Puma convierte la técnica en imagen, el Mate Nelo convierte la tradición en marca y los instrumentos Holway alinean su lenguaje con la identidad del cliente. A la vez, los tres se producen y se comercializan dentro de redes que exceden el taller local: un cliente de nicho internacional, una marca de consumo y una colaboración con un estudio de Hong Kong. Los rasgos contemporáneos, como el mecanizado CNC o el aluminio anodizado, refuerzan objetivos modernos de precisión y durabilidad, lo que confirma que no conviene leerlos como posmodernos por sí mismos."),
  p("El análisis también permite tomar distancia del discurso institucional. El folleto de OID presenta al diseño como una herramienta estratégica y resume su propuesta en la frase buenos diseños, buenos negocios (Oid, 2024). Esa retórica coincide con lo que Lyotard (1987) describió como la legitimación por la eficacia o performatividad, característica de la condición posmoderna: el diseño ya no se justifica por un proyecto social, como en el funcionalismo moderno o en la crítica de Papanek (1977), sino por su rendimiento económico. La posmodernidad de OID, entonces, está menos en sus objetos que en el modo en que el estudio se describe y se ofrece al mercado."),
];

const conclusion = [
  new Paragraph({ children: [new PageBreak()] }),
  h1("Conclusiones"),
  p("Esta investigación se preguntó de qué manera la evolución metodológica y proyectual de Ordóñez Industrial Design articula la tensión entre modernidad y posmodernidad en el diseño industrial argentino contemporáneo. La respuesta que surge del recorrido es que OID no transita de un paradigma al otro, como se planteó en la hipótesis inicial, sino que los distribuye en niveles diferentes. En el nivel del objeto, el estudio se mantiene fiel a una racionalidad moderna: forma derivada de la función, precisión, orden y buena factura. En el nivel de la comunicación y de la gestión, adopta lógicas posmodernas: el producto como signo, la tradición como marca, el diseño como servicio estratégico y la legitimación por el resultado comercial."),
  p("El título de este trabajo, Entre el taller y la estrategia, adquiere así un sentido más preciso. El taller no desaparece: sigue presente en el prototipado, el ensayo y la atención a los procesos productivos que la propia metodología del estudio declara en sus cinco fases de concepto, diseño, prototipado, desarrollo y producción (Oid, 2026). Pero su lugar cambia. A medida que el estudio suma sedes en Boise y Hong Kong y ofrece gestión de producción local y en China (Oid, 2024), el taller deja de ser un espacio propio de fabricación para convertirse en la gestión de una red de talleres ajenos. La estrategia no reemplaza al oficio: lo administra."),
  p("En relación con el contexto regional, el caso de OID permite releer la noción de diseño de la periferia propuesta por Bonsiepe (1985). Para este autor, el diseño en los países periféricos estaba condicionado por la dependencia tecnológica y productiva respecto de los centros industriales. OID representa una variante contemporánea de esa condición: un estudio argentino que exporta conocimiento proyectual a clientes de Estados Unidos, Chile o Asia, mientras la fabricación se desplaza hacia donde resulta más eficiente. La periferia ya no solo importa diseño; también lo produce y lo vende, aunque la manufactura siga ocurriendo en otra parte. Esta lectura se vincula con la historiografía latinoamericana que analiza la relación entre diseño, industrialización y autonomía (Fernández y Bonsiepe, 2008)."),
  p("La investigación permite también explicar por qué OID es un caso emblemático, más allá de su propio relato. Su trayectoria comienza en 2001, el año de la crisis más profunda de la economía argentina reciente, y llega a 2026 con una práctica internacional. Además, reúne validaciones de tres escalas distintas: nacionales, como el premio INNOVAR y el Sello de Buen Diseño; regionales, como su selección para el libro ABC del Diseño Industrial Latinoamericano en 2019; e internacionales, como el Red Dot de 2023 (Oid, 2024). Al mismo tiempo, la revisión crítica mostró los límites de esa narrativa: la línea de tiempo institucional incorpora trabajos académicos anteriores a la fundación, el sitio no informa sobre el equipo de trabajo más allá de su fundador y una fuente externa revela colaboraciones que el folleto no menciona."),
  p("Este trabajo presenta limitaciones que conviene explicitar. La mayor parte de la información disponible proviene de fuentes institucionales del propio estudio, y solo el premio Red Dot pudo contrastarse con una fuente independiente. Los premios INNOVAR, el Sello de Buen Diseño y la selección para el libro de 2019 deberían verificarse en los registros de cada institución. Tampoco se contó con fuentes primarias, como entrevistas a su fundador, a su equipo o a sus clientes. Estas ausencias abren líneas futuras de investigación: una entrevista en profundidad con Ignacio Ordóñez, el análisis de los procesos de producción tercerizados y la comparación de OID con otros estudios argentinos surgidos después de 2001."),
  p("Como reflexión final, el caso de OID muestra que el par modernidad/posmodernidad sigue siendo una herramienta útil para pensar el diseño industrial actual, siempre que se lo utilice con precisión histórica. No todo lo nuevo es posmoderno: muchas de las tecnologías y discursos contemporáneos prolongan, en realidad, el proyecto moderno de eficiencia y control. Para quien se forma en diseño, la principal enseñanza de este recorrido es metodológica: distinguir entre lo que una empresa dice de sí misma y lo que sus objetos efectivamente muestran, y respaldar cada afirmación con una fuente. Esa distancia crítica es la que permite que la historia del diseño deje de ser una colección de casos exitosos y se convierta en una herramienta para comprender la práctica profesional."),
];

const refs = [
  new Paragraph({ children: [new PageBreak()] }),
  h1("Referencias bibliográficas"),
  ref("Battista, E. (2015). Diseño sustentable: del discurso a la práctica. En M. R. Bernatene (Coord.), *La historia del diseño industrial reconsiderada* (pp. 117-135). Facultad de Bellas Artes, Universidad Nacional de La Plata."),
  ref("Beducci, L. (2015). La materia oscura del diseño. Miniaturización e inmaterialidad en el escenario del diseño posmoderno. En M. R. Bernatene (Coord.), *La historia del diseño industrial reconsiderada* (pp. 77-98). Facultad de Bellas Artes, Universidad Nacional de La Plata."),
  ref("Bonsiepe, G. (1985). *El diseño de la periferia. Debates y experiencias*. Gustavo Gili."),
  ref("Bürdek, B. E. (1994). *Diseño. Historia, teoría y práctica del diseño industrial*. Gustavo Gili."),
  ref("Fernández, S. y Bonsiepe, G. (Coords.). (2008). *Historia del diseño en América Latina y el Caribe. Industrialización y comunicación visual para la autonomía*. Blucher."),
  ref("Jencks, C. (1980). *El lenguaje de la arquitectura posmoderna*. Gustavo Gili."),
  ref("Krippendorff, K. y Butter, R. (1984). Product semantics: Exploring the symbolic qualities of form. *Innovation*, 3(2), 4-9."),
  ref("Lyotard, J.-F. (1987). *La condición postmoderna. Informe sobre el saber*. Cátedra."),
  ref("Maldonado, T. (1993). *El diseño industrial reconsiderado*. Gustavo Gili."),
  ref("Oid -Ordóñez Industrial Design-. (2024). *Brochure institucional* [Folleto]. https://www.ordonezid.com"),
  ref("Oid -Ordóñez Industrial Design-. (2026). *Oid. Diseño industrial y producción desde 2001* [Sitio web]. https://www.ordonezid.com"),
  ref("Oid -Ordóñez Industrial Design-. (s. f.). *Puma. Award-winning innovation fly fishing reel* [Ficha de proyecto]."),
  ref("Papanek, V. (1977). *Diseñar para el mundo real. Ecología humana y cambio social*. H. Blume."),
  ref("Red Dot. (2023). *Anthropometric Instruments Set. Red Dot Award: Product Design 2023*. https://www.red-dot.org/project/anthropometric-instruments-set-64026"),
  ref("Sparke, P. (2010). *Diseño y cultura. Una introducción. Desde 1900 hasta la actualidad*. Gustavo Gili."),
  ref("Venturi, R. (1978). *Complejidad y contradicción en la arquitectura* (2.ª ed.). Gustavo Gili."),
  h1("Bibliografía"),
  ref("Bernatene, M. R. (Coord.). (2015). *La historia del diseño industrial reconsiderada*. Facultad de Bellas Artes, Universidad Nacional de La Plata."),
  ref("Blanco, R. (2012). *Diseño industrial argentino*. Ediciones Franz Viegener."),
];

const annex = [
  new Paragraph({ children: [new PageBreak()] }),
  h1("Anexo C. Figuras del corpus"),
  p("Nota: la numeración de las figuras debe continuar la del cuerpo del ensayo. Si las figuras 1 a 5 ya están en el texto, las siguientes se ubican en este anexo."),
  figure("Oid_reel_Puma.png", 420, 244),
  caption("Figura 6. Reel de pesca con mosca Puma, cliente Correntoso. Fuente: Oid (2024)."),
  figure("Oid_mates_Nelo_serie.png", 420, 315),
  caption("Figura 7. Serie de colores del Mate Nelo. Fuente: Oid (2024)."),
  figure("Oid_Holway_set.png", 420, 315),
  caption("Figura 8. Set de instrumentos antropométricos Holway, Red Dot Award 2023. Fuente: Oid (2024)."),
  h1("Listado de figuras"),
  p("Figura 6. Reel de pesca con mosca Puma, cliente Correntoso. Fuente: Oid (2024)."),
  p("Figura 7. Serie de colores del Mate Nelo. Fuente: Oid (2024)."),
  p("Figura 8. Set de instrumentos antropométricos Holway, Red Dot Award 2023. Fuente: Oid (2024)."),
];

const doc = new Document({
  creator: "Kevin Skvor",
  title: "Capítulo 3 y Conclusiones — OID",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 26, bold: true }, paragraph: { spacing: { before: 480, after: 240, line: LINE }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 22, bold: true }, paragraph: { spacing: { before: 360, after: 240, line: LINE }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 })] })] }) },
    children: [...body, ...conclusion, ...refs, ...annex],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Capitulo3_y_Conclusiones_OID.docx");
  fs.writeFileSync(out, buf);
  console.log("OK ->", out);
});
