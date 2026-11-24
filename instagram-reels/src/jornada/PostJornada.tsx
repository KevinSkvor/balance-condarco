import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Carrusel de feed 3:4 (1080×1440): jornada docente del Nivel Secundario sobre el nuevo Régimen Académico.
 * Una foto por placa, lo más grande posible (se recorta lo mínimo según su proporción),
 * con una frase corta y alegre debajo y una etiqueta de color.
 */

/** Palabra destacada en bordó. */
const B: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: C.bordo, fontWeight: 700}}>{children}</span>;

type Placa = {src: string; src2?: string; w: number; h: number; pos?: string; chip?: string; texto?: React.ReactNode; chico?: boolean};

const PLACAS: Placa[] = [
	{src: 'fila.jpg', w: 1280, h: 960, chip: 'Nuevo Régimen Académico', texto: <>Analizamos juntos el <B>nuevo Régimen Académico</B></>},
	{src: 'grupo-charla.jpg', w: 1449, h: 2576, pos: '50% 58%', chip: 'En equipo', texto: <>Intercambio de <B>miradas y experiencias</B></>},
	{src: 'grupos.jpg', w: 1449, h: 2576, pos: '50% 50%', chip: 'Trabajo en grupos', texto: <>Pensando <B>propuestas</B> para nuestras aulas</>},
	{src: 'grupo-ventana.jpg', w: 1449, h: 2576, pos: '50% 50%', chip: 'Acuerdos', texto: <>Construyendo <B>acuerdos</B> institucionales</>},
	{src: 'presentacion-2.jpg', w: 1280, h: 960, chip: 'Formación', texto: <>Seguimos <B>aprendiendo</B> para acompañar mejor a nuestros alumnos</>, chico: true},
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
			<div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>SECUNDARIA · JORNADA DOCENTE</div>
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
			<Img src={staticFile(`img/jornada/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
		</div>
	</div>
);

/** Portada. */
export const PostJornada: React.FC = () => (
	<Base>
		<Foto src="presentacion.jpg" ancho={1000} alto={750} pos="50% 50%" top={130} />
		<div style={{position: 'absolute', left: 56, right: 56, top: 930, display: 'flex', flexDirection: 'column', gap: 12}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: '-0.02em', color: C.azul}}>
				Jornada <span style={{color: C.bordo}}>docente</span>
			</div>
			<div style={{fontSize: 34, lineHeight: 1.35, color: C.tintaSuave}}>Nuestros profes del Nivel Secundario trabajaron sobre el nuevo Régimen Académico.</div>
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

export const PLACAS_JORNADA = PLACAS.length;
export const PostJornadaFoto: React.FC<{i: number}> = ({i}) => <PlacaFoto i={i} />;

/** Cierre: escudo y la frase del folleto de la muestra. */
export const PostJornadaFin: React.FC = () => (
	<Base n={`${PLACAS.length + 2}/${PLACAS.length + 2}`}>
		<div style={{position: 'absolute', left: 540 - 230, top: 150, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('img/escudo.png')} style={{width: 290}} />
		</div>
		<div style={{position: 'absolute', left: 70, right: 70, top: 680, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: C.azul}}>
			Gracias a nuestro <span style={{color: C.bordo}}>equipo docente</span> por su <span style={{color: C.bordo}}>compromiso</span> y por seguir pensando la escuela que queremos para nuestros alumnos.
		</div>
		<div style={{position: 'absolute', left: 70, right: 70, top: 1150, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, lineHeight: 1.15, color: C.bordo}}>
			Juntos, construimos cada día.
		</div>
	</Base>
);
