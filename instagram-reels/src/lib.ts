import {cancelRender, continueRender, delayRender, spring, staticFile} from 'remotion';
import timeline from './timeline.json';

export const T = timeline;

/** Tokens del sistema de diseño "Álvarez Condarco" (Claude Design). */
export const C = {
	azul: '#13205a', // azul-escudo
	noche: '#0b1440', // azul-noche
	bordo: '#8e2b1d',
	dorado: '#c9a54c',
	doradoClaro: '#f3e6c2',
	crema: '#fbf6ec',
	papel: '#ffffff',
	tinta: '#1b1f33',
	tintaSuave: '#5a5e70',
	linea: '#e5dccb',
	celeste: '#2f58a8',
	sol: '#f2b632',
};

export const DISPLAY = '"Bricolage Grotesque", system-ui, sans-serif';
export const SANS = '"Figtree", system-ui, sans-serif';
export const SHADOW = '0 2px 4px rgba(19,32,90,0.06), 0 20px 60px rgba(19,32,90,0.10)';

export const NIVELES = [
	{name: 'Jardín', color: C.sol, ink: C.tinta, img: 'img/patio-jardin.jpg', pos: '50% 60%'},
	{name: 'Primaria', color: C.celeste, ink: C.papel, img: 'img/patio-primaria.jpg', pos: '50% 55%'},
	{name: 'Secundaria', color: C.bordo, ink: C.papel, img: 'img/aula.jpg', pos: '50% 45%'},
];

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** spring con fps fijo: `sp(frame, at)` va de 0 a 1 a partir del frame `at`. */
export const sp = (frame: number, at: number, config: {damping?: number; stiffness?: number; mass?: number} = {}) =>
	spring({frame: frame - at, fps: T.fps, config: {damping: 15, stiffness: 120, ...config}});

const fonts: [string, string, number][] = [
	['Bricolage Grotesque', 'bricolage-grotesque-latin-600-normal.woff2', 600],
	['Bricolage Grotesque', 'bricolage-grotesque-latin-700-normal.woff2', 700],
	['Figtree', 'figtree-latin-400-normal.woff2', 400],
	['Figtree', 'figtree-latin-600-normal.woff2', 600],
	['Figtree', 'figtree-latin-700-normal.woff2', 700],
];
const handle = delayRender('Cargando tipografías de marca');
Promise.all(
	fonts.map(([family, file, weight]) =>
		new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight: String(weight)})
			.load()
			.then((f) => document.fonts.add(f)),
	),
)
	.then(() => continueRender(handle))
	.catch((err) => cancelRender(err));
