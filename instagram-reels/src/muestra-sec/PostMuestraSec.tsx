import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Carrusel de feed 3:4 (1080×1440): Muestra Anual 2026 del Nivel Secundario.
 * Una foto por placa, lo más grande posible (se recorta lo mínimo según su proporción),
 * con una frase corta y alegre debajo y una etiqueta de color.
 */

/** Palabra destacada en bordó. */
const B: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.bordo, fontWeight: 700}}>{children}</span>;

type Placa = {src: string; w: number; h: number; pos?: string; chip: string; texto: React.ReactNode};

const PLACAS: Placa[] = [
	{src: '10-publico-familias.jpg', w: 1600, h: 1200, chip: '¡Bienvenidos!', texto: <>Una sala llena de <B>familias</B></>},
	{src: '03-pasillo-globos.jpg', w: 900, h: 1600, pos: '50% 40%', chip: 'Color', texto: <>Pasillos llenos de <B>color</B></>},
	{src: '05-you-belong.jpg', w: 900, h: 1600, pos: '50% 45%', chip: 'In English', texto: <>Acá, todos <B>pertenecemos</B></>},
	{src: '06-bookflix.jpg', w: 1600, h: 900, chip: 'Lectura', texto: <><B>Bookflix</B> y <B>Bookstagram</B>: recomendamos libros</>},
	{src: '04-mesa-ciencias.jpg', w: 1600, h: 900, chip: 'Ciencia', texto: <>Experimentos y un <B>sistema solar</B> hecho a mano</>},
	{src: '12-paises.jpg', w: 1600, h: 1200, chip: 'El mundo', texto: <>Un viaje por el <B>mundo</B>: banderas, sabores y trajes</>},
	{src: '07-acto-natacion.jpg', w: 1200, h: 1600, pos: '50% 50%', chip: 'Nuestro año', texto: <>Repasamos el <B>año</B> juntos</>},
	{src: '08-publico-alumnos.jpg', w: 1200, h: 1600, pos: '50% 62%', chip: 'Juntos', texto: <>Todo el Secundario, <B>juntos</B></>},
	{src: '13-lectura.jpg', w: 900, h: 1600, pos: '50% 35%', chip: 'Voz propia', texto: <>Palabras propias, en <B>voz alta</B></>},
	{src: '09-teatro.jpg', w: 1200, h: 1600, pos: '50% 62%', chip: 'Teatro', texto: <>¡Arriba el <B>telón</B>!</>},
	{src: '11-baile.jpg', w: 1600, h: 900, chip: 'Baile', texto: <>¡A <B>bailar</B>!</>},
	{src: '14-orquesta.jpg', w: 1600, h: 1200, chip: 'Música', texto: <>Música en <B>vivo</B>, frente a todos</>},
	{src: '16-banda.jpg', w: 1200, h: 1600, pos: '50% 62%', chip: 'Banda', texto: <>Guitarra, bombo, teclado… ¡y <B>voces</B>!</>},
	{src: '15-cierre-celulares.jpg', w: 1600, h: 900, chip: '¡Final!', texto: <>Un cierre a pura <B>emoción</B></>},
];

const CHIPS: [string, string][] = [
	[C.bordo, C.papel],
	[C.sol, C.tinta],
	[C.celeste, C.papel],
];

const ALTO_MAX = 1010;
const ANCHO_MAX = 1024;
const TOP = 132;

/** Tamaño del marco: llena el ancho en las apaisadas y el alto en las verticales, recortando lo mínimo. */
const marco = (w: number, h: number) => {
	const a = w / h;
	if (a < 0.8) {
		const alto = ALTO_MAX;
		return {ancho: Math.round(alto * Math.max(a, 0.7)), alto};
	}
	const ancho = ANCHO_MAX;
	return {ancho, alto: Math.min(ALTO_MAX, Math.round(ancho / Math.min(a, 1.22)))};
};

const Base: React.FC<{children: React.ReactNode; n?: string}> = ({children, n}) => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<div style={{position: 'absolute', top: 54, left: 56, right: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
			<div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>SECUNDARIA · MUESTRA ANUAL 2026</div>
			{n && <div style={{fontSize: 24, fontWeight: 700, color: C.tintaSuave}}>{n}</div>}
		</div>
		{children}
		<div style={{position: 'absolute', top: 1350, left: 56, display: 'flex', alignItems: 'center', gap: 14}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 54}} />
			<div style={{fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);

const Foto: React.FC<{src: string; ancho: number; alto: number; pos?: string; top: number; rot?: number}> = ({src, ancho, alto, pos = '50% 50%', top, rot = 0}) => (
	<div style={{position: 'absolute', top, left: (1080 - ancho) / 2 - 12, width: ancho, height: alto, padding: 12, background: C.papel, borderRadius: 28, boxShadow: '0 20px 50px rgba(19,32,90,0.18)', transform: `rotate(${rot}deg)`}}>
		<div style={{width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden'}}>
			<Img src={staticFile(`img/muestra-sec/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
		</div>
	</div>
);

/** Portada. */
export const PostMuestraSec: React.FC = () => (
	<Base>
		<Foto src="01-cartel.jpg" ancho={1000} alto={900} pos="50% 62%" top={120} />
		<div style={{position: 'absolute', left: 56, right: 56, top: 1060, display: 'flex', flexDirection: 'column', gap: 6}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: '-0.02em', color: C.azul}}>
				¡Muestra <span style={{color: C.bordo}}>2026</span>!
			</div>
			<div style={{fontSize: 34, lineHeight: 1.35, color: C.tintaSuave}}>Un año de trabajo, arte y música del Nivel Secundario.</div>
		</div>
		<div style={{position: 'absolute', top: 1352, right: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 26px', borderRadius: 999, background: C.bordo, color: C.papel, fontSize: 28, fontWeight: 700}}>
			Deslizá
			<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.papel} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</div>
	</Base>
);

const PlacaFoto: React.FC<{i: number}> = ({i}) => {
	const p = PLACAS[i];
	const {ancho, alto} = marco(p.w, p.h);
	const rot = i % 2 ? 1 : -1;
	const [bg, ink] = CHIPS[i % 3];
	const vertical = ancho < 900;
	const textoTop = TOP + alto + 44;
	return (
		<Base n={`${i + 2}/${PLACAS.length + 2}`}>
			<Foto src={p.src} ancho={ancho} alto={alto} pos={p.pos} top={TOP} rot={rot} />
			<div style={{position: 'absolute', top: TOP - 22, [i % 2 ? 'right' : 'left']: vertical ? (1080 - ancho) / 2 - 30 : 40, padding: '10px 28px 14px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, boxShadow: '0 10px 24px rgba(19,32,90,0.25)', transform: `rotate(${-rot * 3}deg)`, whiteSpace: 'nowrap'}}>
				{p.chip}
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, top: Math.min(textoTop, 1240), textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 56, lineHeight: 1.12, color: C.azul}}>
				{p.texto}
			</div>
		</Base>
	);
};

export const PLACAS_MUESTRA_SEC = PLACAS.length;
export const PostMuestraSecFoto: React.FC<{i: number}> = ({i}) => <PlacaFoto i={i} />;

/** Cierre. */
export const PostMuestraSecFin: React.FC = () => (
	<Base n={`${PLACAS.length + 2}/${PLACAS.length + 2}`}>
		<div style={{position: 'absolute', left: 540 - 300, top: 260, width: 600, height: 600, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('img/escudo.png')} style={{width: 360}} />
		</div>
		<div style={{position: 'absolute', left: 56, right: 56, top: 950, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 18}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.05, color: C.azul}}>
				¡Gracias, <span style={{color: C.bordo}}>familias</span>!
			</div>
			<div style={{fontSize: 36, lineHeight: 1.4, color: C.tintaSuave}}>Y felicitaciones, chicos, por todo lo que hicieron este año.</div>
		</div>
	</Base>
);
