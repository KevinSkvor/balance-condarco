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

type Placa = {src: string; src2?: string; w: number; h: number; pos?: string; chip?: string; texto?: React.ReactNode; chico?: boolean};

const PLACAS: Placa[] = [
	{src: '07-acto-natacion.jpg', w: 1200, h: 1600, pos: '50% 50%', chip: 'Video institucional', texto: <>Repasamos el <B>año</B> juntos</>},
	{src: '10-publico-familias.jpg', w: 1600, h: 1200, chip: '¡Bienvenidos!', texto: <>Una sala llena de <B>familias</B></>},
	{src: '03-pasillo-globos.jpg', w: 900, h: 1600, pos: '50% 40%', chip: 'Book Day', texto: <>Pasillos llenos de <B>cuentos</B></>},
	{src: '05-you-belong.jpg', w: 900, h: 1600, pos: '50% 45%', texto: <>Acá, todos <B>pertenecemos</B></>},
	{src: '17-paises2.jpg', w: 1200, h: 1600, pos: '50% 55%', texto: <>Conociendo la <B>cultura</B> de cada país</>},
	{src: '08-publico-alumnos.jpg', w: 1200, h: 1600, pos: '50% 62%', chip: 'Juntos'},
	{src: '13-lectura.jpg', w: 900, h: 1600, pos: '50% 35%', chip: '¡Medalla de oro!', chico: true, texto: <>Poesía ganadora de la <B>medalla de oro</B> en las Olimpíadas Malvinenses</>},
	{src: '09-teatro.jpg', w: 1200, h: 1600, pos: '50% 62%', chip: '6.º año', texto: <>Muestra del <B>concert</B> con los alumnos de{'\u00a0'}6.º{'\u00a0'}año</>, chico: true},
	{src: '14-orquesta.jpg', w: 1600, h: 1200, chip: 'Música', texto: <>Música en <B>vivo</B></>},
	{src: '15-cierre-celulares.jpg', src2: '18-celular2.jpg', w: 1600, h: 900, chip: 'Cuadro musical', texto: <>Reflexión sobre el uso responsable del <B>celular</B></>},
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
		<div style={{position: 'absolute', top: 96, right: 40, padding: '12px 32px 16px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, boxShadow: '0 10px 24px rgba(19,32,90,0.25)', transform: 'rotate(4deg)'}}>
			Parte 1
		</div>
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
	const doble = Boolean(p.src2);
	const altoDoble = 470;
	const textoTop = doble ? TOP + 2 * altoDoble + 40 + 36 : TOP + alto + (p.chico ? 34 : 44);
	return (
		<Base n={`${i + 2}/${PLACAS.length + 2}`}>
			{doble ? (
				<>
					<Foto src={p.src} ancho={1000} alto={altoDoble} pos={p.pos} top={TOP} rot={-0.8} />
					<Foto src={p.src2!} ancho={1000} alto={altoDoble} pos="50% 55%" top={TOP + altoDoble + 30} rot={0.8} />
				</>
			) : (
				<Foto src={p.src} ancho={ancho} alto={alto} pos={p.pos} top={TOP} rot={rot} />
			)}
			{p.chip && <div style={{position: 'absolute', top: TOP - 22, [i % 2 ? 'right' : 'left']: vertical ? (1080 - ancho) / 2 - 30 : 40, padding: '10px 28px 14px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, boxShadow: '0 10px 24px rgba(19,32,90,0.25)', transform: `rotate(${-rot * 3}deg)`, whiteSpace: 'nowrap'}}>
				{p.chip}
			</div>}
			<div style={{position: 'absolute', left: 56, right: 56, top: Math.min(textoTop, 1240), textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: p.chico ? 46 : 56, lineHeight: 1.12, color: C.azul}}>
				{p.texto}
			</div>
		</Base>
	);
};

export const PLACAS_MUESTRA_SEC = PLACAS.length;
export const PostMuestraSecFoto: React.FC<{i: number}> = ({i}) => <PlacaFoto i={i} />;

/** Cierre: escudo y la frase del folleto de la muestra. */
export const PostMuestraSecFin: React.FC = () => (
	<Base n={`${PLACAS.length + 2}/${PLACAS.length + 2}`}>
		<div style={{position: 'absolute', left: 540 - 230, top: 150, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('img/escudo.png')} style={{width: 290}} />
		</div>
		<div style={{position: 'absolute', left: 70, right: 70, top: 680, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: C.azul}}>
			Cada proyecto, cada experiencia y cada aprendizaje reflejan el <span style={{color: C.bordo}}>compromiso</span>, la <span style={{color: C.bordo}}>creatividad</span> y el <span style={{color: C.bordo}}>esfuerzo compartido</span> de quienes formamos parte de esta institución.
		</div>
		<div style={{position: 'absolute', left: 70, right: 70, top: 1150, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: C.bordo}}>
			Sigamos formando comunidad y creciendo juntos.
		</div>
	</Base>
);
