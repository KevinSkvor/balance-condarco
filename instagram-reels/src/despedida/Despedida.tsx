import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Invitación a la despedida de fin de año 2026 del Instituto Álvarez Condarco.
 * Fondo azul noche con guirnaldas, confeti y destellos dorados. Dos formatos:
 * historia (1080×1920) y feed (1080×1440); en historia el contenido evita las franjas de la interfaz.
 */

const DATOS = {
	dia: 'Viernes 18 de diciembre',
	hora: 'A partir de las 20 h',
	lugar: 'El Galpón de Tacuara',
	direccion: 'Av. Ángel T. de Alvear 2470, Don Torcuato',
};

// confeti fijo (posición determinística para que el render sea siempre igual)
const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898) * 43758.5453;
	return x - Math.floor(x);
};
const COLORES = [C.sol, C.dorado, C.celeste, C.bordo, C.papel];

/** Confeti sólo en los bordes, para que no pase por encima de los textos. */
const Confeti: React.FC<{alto: number}> = ({alto}) => (
	<svg width={1080} height={alto} style={{position: 'absolute', inset: 0}}>
		{Array.from({length: 140}, (_, i) => {
			const x = rnd(i) * 1080;
			const y = rnd(i + 100) * alto;
			if (x > 90 && x < 990 && y > 140 && y < alto - 60) return null;
			const r = rnd(i + 200) * 360;
			const c = COLORES[i % COLORES.length];
			const t = i % 3;
			return t === 0 ? (
				<rect key={i} x={x} y={y} width={14} height={26} rx={3} fill={c} opacity={0.75} transform={`rotate(${r} ${x} ${y})`} />
			) : t === 1 ? (
				<circle key={i} cx={x} cy={y} r={6} fill={c} opacity={0.7} />
			) : (
				<path key={i} d={`M${x} ${y} q 10 -14 20 0 t 20 0`} stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} transform={`rotate(${r} ${x} ${y})`} />
			);
		})}
	</svg>
);

/** Guirnalda de banderines en los colores del cole. */
const Guirnalda: React.FC<{top: number}> = ({top}) => {
	const n = 13;
	return (
		<svg width={1080} height={160} style={{position: 'absolute', left: 0, top}}>
			<path d="M -20 20 Q 540 120 1100 20" stroke={C.dorado} strokeWidth={4} fill="none" />
			{Array.from({length: n}, (_, i) => {
				const t = (i + 0.5) / n;
				const x = -20 + 1120 * t;
				const y = 20 + 2 * (1 - t) * t * 100 * 2 * 0.5 * 2;
				return <path key={i} d={`M ${x - 30} ${y} L ${x + 30} ${y} L ${x} ${y + 70} Z`} fill={[C.sol, C.celeste, C.bordo][i % 3]} />;
			})}
		</svg>
	);
};

const Destello: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<svg width={80 * s} height={80 * s} viewBox="-40 -40 80 80" style={{position: 'absolute', left: x, top: y}}>
		<path d="M0 -38 L8 -8 L38 0 L8 8 L0 38 L-8 8 L-38 0 L-8 -8 Z" fill={C.sol} />
	</svg>
);

const Fila: React.FC<{icono: string[]; children: React.ReactNode; sub?: string}> = ({icono, children, sub}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 26}}>
		<div style={{width: 92, height: 92, borderRadius: '50%', background: C.sol, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
			<svg width={52} height={52} viewBox="0 0 24 24" fill="none" stroke={C.noche} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
				{icono.map((d, i) => (
					<path key={i} d={d} />
				))}
			</svg>
		</div>
		<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.05, color: C.papel}}>{children}</div>
			{sub && <div style={{fontFamily: SANS, fontSize: 34, color: C.doradoClaro}}>{sub}</div>}
		</div>
	</div>
);

const CAL = ['M3 5h18v16H3z', 'M3 10h18', 'M8 3v4', 'M16 3v4'];
const RELOJ = ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M12 7v5l3 3'];
const PIN = ['M12 22s7-7.2 7-12.5A7 7 0 0 0 5 9.5C5 14.8 12 22 12 22z', 'M12 6.5a3 3 0 1 0 0 6a3 3 0 1 0 0-6'];

const Invitacion: React.FC<{alto: number; top: number; compacto?: boolean}> = ({alto, top, compacto}) => (
	<AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, #1d2c75 0%, ${C.noche} 70%)`, fontFamily: SANS}}>
		<Confeti alto={alto} />
		<Guirnalda top={compacto ? -30 : top - 120} />
		<Destello x={110} y={top + 60} s={0.8} />
		<Destello x={900} y={top + 130} s={0.6} />
		<Destello x={940} y={top + 560} s={0.9} />
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			<div style={{width: compacto ? 180 : 210, height: compacto ? 180 : 210, borderRadius: '50%', background: C.papel, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 8px ${C.dorado}, 0 20px 50px rgba(0,0,0,0.4)`}}>
				<Img src={staticFile('img/escudo.png')} style={{width: compacto ? 128 : 150}} />
			</div>
			<div style={{marginTop: 40, fontSize: 32, fontWeight: 700, letterSpacing: '0.22em', color: C.sol}}>TE INVITAMOS A LA</div>
			<div style={{marginTop: 12, fontFamily: DISPLAY, fontWeight: 700, fontSize: compacto ? 104 : 118, lineHeight: 0.98, letterSpacing: '-0.02em', color: C.papel, textAlign: 'center'}}>
				Despedida
				<br />
				<span style={{color: C.sol}}>de fin de año</span>
			</div>
			<div style={{marginTop: 16, padding: '10px 34px 14px', borderRadius: 999, background: C.bordo, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44}}>2026</div>
		</div>
		<div style={{position: 'absolute', top: top + (compacto ? 640 : 700), left: 110, right: 90, display: 'flex', flexDirection: 'column', gap: compacto ? 24 : 34}}>
			<Fila icono={CAL}>{DATOS.dia}</Fila>
			<Fila icono={RELOJ}>{DATOS.hora}</Fila>
			<Fila icono={PIN} sub={DATOS.direccion}>
				{DATOS.lugar}
			</Fila>
		</div>
		<div style={{position: 'absolute', top: alto - (compacto ? 175 : 470), left: 0, right: 0, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.papel}}>
			¡Te esperamos!
			<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.doradoClaro, marginTop: 8}}>Instituto Álvarez Condarco</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);

export const DespedidaHistoria: React.FC = () => <Invitacion alto={1920} top={330} />;
export const DespedidaFeed: React.FC = () => <Invitacion alto={1440} top={110} compacto />;
