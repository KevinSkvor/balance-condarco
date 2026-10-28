import React from 'react';
import {C, DISPLAY, SANS} from '../lib';
import {Burbuja, Foto, Marco} from '../granja/PostGranja';

/**
 * Carrusel de feed 3:4 (1080×1440): presentación de las remeras de egresaditos 2026,
 * Nivel Inicial, sala Ositos (turno mañana y turno tarde).
 * Fotos de espaldas; los nombres de las remeras están desenfocados en el archivo.
 */

const VOLANTA = 'NIVEL INICIAL · EGRESADITOS';

const Chip: React.FC<{text: string; bg: string; ink: string; style?: React.CSSProperties}> = ({text, bg, ink, style}) => (
	<div style={{padding: '10px 28px 12px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, ...style}}>{text}</div>
);

/** Remera dibujada con un osito, para la placa de cierre. */
const Remera: React.FC = () => (
	<svg width={760} height={700} viewBox="0 0 380 350">
		<path
			d="M120 20 Q190 52 260 20 L340 60 L372 132 L318 156 L300 130 L300 330 Q190 344 80 330 L80 130 L62 156 L8 132 L40 60 Z"
			fill={C.papel}
			stroke={C.azul}
			strokeWidth={5}
			strokeLinejoin="round"
		/>
		<path d="M120 20 Q190 66 260 20" fill="none" stroke={C.azul} strokeWidth={5} />
		{/* osito */}
		<g transform="translate(190 128)">
			<circle cx={-30} cy={-30} r={16} fill={C.dorado} />
			<circle cx={30} cy={-30} r={16} fill={C.dorado} />
			<circle cx={-30} cy={-30} r={7} fill={C.doradoClaro} />
			<circle cx={30} cy={-30} r={7} fill={C.doradoClaro} />
			<circle r={42} fill={C.dorado} />
			<ellipse cx={0} cy={14} rx={18} ry={13} fill={C.doradoClaro} />
			<circle cx={-14} cy={-6} r={5} fill={C.tinta} />
			<circle cx={14} cy={-6} r={5} fill={C.tinta} />
			<ellipse cx={0} cy={8} rx={6} ry={4.5} fill={C.tinta} />
			<path d="M-7 18 Q0 25 7 18" fill="none" stroke={C.tinta} strokeWidth={3} strokeLinecap="round" />
		</g>
		<text x={190} y={232} textAnchor="middle" style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, fill: C.tinta}}>OSITOS</text>
		<text x={190} y={278} textAnchor="middle" style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, fill: C.tinta}}>2026</text>
		{/* letras de colores, como pintadas a mano */}
		{['#e94b8a', C.sol, '#4cc38a', C.celeste].map((c, i) => (
			<path key={c} d={`M${132 + i * 34} 306 q 10 -14 20 0`} fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" />
		))}
	</svg>
);

/** 1 · Portada: las remeras de espaldas, sobre el escenario. */
export const PostOsitos: React.FC = () => (
	<Marco desliza volanta={VOLANTA} titulo={<>Ositos <span style={{color: C.bordo}}>2026</span></>}>
		<Foto src="img/ositos/remeras-escenario.jpg" pos="50% 40%" style={{left: 56, top: 290, width: 968, height: 760}} />
		<Burbuja text="¡Egresaditos!" color={C.sol} ink={C.tinta} style={{left: 84, top: 322}} />
		<div style={{position: 'absolute', left: 56, right: 56, top: 1090, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, lineHeight: 1.15, color: C.azul}}>
			Presentamos las remeras de <span style={{color: C.bordo}}>egresaditos</span>
		</div>
		<div style={{position: 'absolute', left: 56, top: 1236, fontFamily: SANS, fontSize: 34, fontWeight: 600, color: C.tintaSuave}}>Sala Ositos · turno mañana y turno tarde</div>
	</Marco>
);

/** 2 · Turno mañana y turno tarde, abrazados en el escenario. */
export const PostOsitos2: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Estrenamos <span style={{color: C.bordo}}>remeras</span></>}>
		<Foto src="img/ositos/abrazo-escenario.jpg" pos="50% 50%" style={{left: 56, top: 330, width: 968, height: 490}} />
		<Burbuja text="¡Un abrazo gigante!" color={C.bordo} ink={C.papel} style={{left: 470, top: 296, whiteSpace: 'nowrap'}} />
		<div style={{position: 'absolute', left: 56, top: 880, display: 'flex', gap: 16}}>
			<Chip text="Turno mañana" bg={C.sol} ink={C.tinta} />
			<Chip text="Turno tarde" bg={C.celeste} ink={C.papel} />
		</div>
		<div style={{position: 'absolute', left: 56, right: 56, top: 980, fontFamily: SANS, fontSize: 48, lineHeight: 1.35, color: C.tintaSuave}}>
			Las presentamos todos juntos, <b style={{color: C.tinta}}>abrazados arriba del escenario</b>.
		</div>
	</Marco>
);

/** 3 · Cierre ilustrado. */
export const PostOsitos3: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡Rumbo a <span style={{color: C.bordo}}>Primaria</span>!</>}>
		<div style={{position: 'absolute', left: 540 - 380, top: 330, width: 760, height: 760, borderRadius: '50%', background: C.doradoClaro}} />
		<div style={{position: 'absolute', top: 360, width: '100%', display: 'flex', justifyContent: 'center', transform: 'rotate(-4deg)'}}>
			<Remera />
		</div>
		<Burbuja text="¡Lo logramos!" color={C.celeste} ink={C.papel} style={{left: 640, top: 360}} />
		<div style={{position: 'absolute', top: 1130, left: 56, right: 56, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: C.azul}}>
			Estamos muy orgullosos de ustedes
		</div>
	</Marco>
);
