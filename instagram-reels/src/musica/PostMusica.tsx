import React from 'react';
import {C, DISPLAY, SANS} from '../lib';
import {Burbuja, Foto, Marco} from '../granja/PostGranja';

/**
 * Carrusel de feed 3:4 (1080×1440): las dos bandas de Secundaria, subcampeonas
 * en las Olimpíadas de Música de Malvinas Argentinas.
 */

const VOLANTA = 'SECUNDARIA · OLIMPÍADAS DE MÚSICA';

/** Medalla de plata dibujada, con cinta en los colores del cole. */
export const Medalla: React.FC<{size: number; rot?: number}> = ({size, rot = 0}) => (
	<svg width={size} height={size * 1.35} viewBox="-100 -170 200 270" style={{transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 14px 22px rgba(19,32,90,0.3))'}}>
		<path d="M-60 -170 L-10 -40 L-40 -40 L-90 -170 Z" fill={C.celeste} />
		<path d="M60 -170 L10 -40 L40 -40 L90 -170 Z" fill={C.bordo} />
		<path d="M-15 -170 L15 -170 L15 -60 L-15 -60 Z" fill={C.sol} />
		<defs>
			<linearGradient id="plata" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#f4f6fa" />
				<stop offset="0.45" stopColor="#c3c9d4" />
				<stop offset="1" stopColor="#8d95a5" />
			</linearGradient>
		</defs>
		<circle cx={0} cy={10} r={86} fill="url(#plata)" stroke="#7d8597" strokeWidth={6} />
		<circle cx={0} cy={10} r={66} fill="none" stroke="#9aa2b2" strokeWidth={4} strokeDasharray="6 8" />
		<text x={0} y={42} textAnchor="middle" style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, fill: '#5d6577'}}>2</text>
	</svg>
);

/** 1 · Portada. */
export const PostMusica: React.FC = () => (
	<Marco desliza volanta={VOLANTA} titulo={<>¡Subcampe<span style={{color: C.bordo}}>ones</span>!</>}>
		<Foto src="img/musica/banda-cerca.jpg" pos="50% 60%" style={{left: 56, top: 290, width: 968, height: 726}} />
		<div style={{position: 'absolute', right: 40, top: 860}}>
			<Medalla size={230} rot={8} />
		</div>
		<div style={{position: 'absolute', left: 56, right: 330, top: 1050, display: 'flex', flexDirection: 'column', gap: 12}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1.05, color: C.azul}}>
				Dos bandas, dos medallas de <span style={{color: C.bordo}}>plata</span>
			</div>
			<div style={{fontFamily: SANS, fontSize: 30, lineHeight: 1.35, color: C.tintaSuave}}>Olimpíadas de Música de Malvinas Argentinas</div>
		</div>
	</Marco>
);

/** 2 · En el escenario de la Municipalidad. */
export const PostMusica2: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>A todo <span style={{color: C.bordo}}>ritmo</span></>}>
		<Foto src="img/musica/muni.jpg" pos="50% 40%" style={{left: 56, top: 290, width: 968, height: 560}} />
		<Foto src="img/musica/banda.jpg" pos="50% 50%" style={{left: 56, top: 876, width: 968, height: 440}} />
		<Burbuja text="¡En vivo!" color={C.bordo} ink={C.papel} style={{left: 80, top: 760}} />
	</Marco>
);

/** 3 · Antes de salir: ensayo en la plaza. */
export const PostMusica3: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Último <span style={{color: C.bordo}}>ensayo</span></>}>
		<Foto src="img/musica/ensayo.jpg" pos="50% 45%" style={{left: 56, top: 290, width: 474, height: 1026}} />
		<Foto src="img/musica/banderas.jpg" pos="50% 60%" style={{left: 550, top: 290, width: 474, height: 1026}} />
		<Burbuja text="¡Afinando!" color={C.sol} ink={C.tinta} style={{left: 80, top: 320}} />
	</Marco>
);

/** 4 · El momento del premio. */
export const PostMusica4: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡Medalla de <span style={{color: C.bordo}}>plata</span>!</>}>
		<Foto src="img/musica/escenario.jpg" pos="50% 62%" style={{left: 56, top: 290, width: 560, height: 1026}} />
		<div style={{position: 'absolute', left: 670, top: 330}}>
			<Medalla size={300} rot={-6} />
		</div>
		<div style={{position: 'absolute', left: 646, right: 40, top: 820, display: 'flex', flexDirection: 'column', gap: 16}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.05, color: C.azul}}>
				Las dos bandas, <span style={{color: C.bordo}}>subcampeonas</span>
			</div>
			<div style={{fontFamily: SANS, fontSize: 30, lineHeight: 1.35, color: C.tintaSuave}}>Recibiendo el reconocimiento en la Municipalidad.</div>
		</div>
	</Marco>
);

/** 5 · Cierre con el grupo. */
export const PostMusica5: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡Orgullosos de <span style={{color: C.bordo}}>ustedes</span>!</>}>
		<Foto src="img/musica/grupo.jpg" pos="50% 50%" style={{left: 56, top: 290, width: 968, height: 870}} />
		<Burbuja text="¡Gracias, chicos!" color={C.celeste} ink={C.papel} style={{left: 84, top: 318}} />
		<div style={{position: 'absolute', left: 56, right: 56, top: 1190, fontFamily: SANS, fontSize: 34, lineHeight: 1.35, color: C.tintaSuave}}>
			Gracias también a los profes que los acompañan en cada ensayo.
		</div>
	</Marco>
);
