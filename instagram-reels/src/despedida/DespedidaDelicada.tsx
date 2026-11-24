import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Invitación delicada a la despedida de fin de año 2026: papel crema, doble marco fino dorado,
 * ramitas dibujadas en las esquinas, escudo pequeño y tipografía con mucho aire.
 * Dos formatos: historia (1080×1920) y feed (1080×1440).
 */

const DATOS = {
	dia: 'Viernes 18 de diciembre',
	hora: '20 hs.',
	lugar: 'El Galpón de Tacuara',
	direccion: 'Av. Ángel T. de Alvear 2470 · Don Torcuato',
};

/** Ramita fina de hojas, en trazo dorado. */
const Ramita: React.FC<{style: React.CSSProperties; flip?: boolean}> = ({style, flip}) => (
	<svg width={260} height={260} viewBox="0 0 260 260" style={{position: 'absolute', transform: flip ? 'scaleX(-1)' : undefined, ...style}}>
		<path d="M20 240 C 70 180, 120 120, 230 30" stroke={C.dorado} strokeWidth={2.4} fill="none" strokeLinecap="round" />
		{[0.18, 0.34, 0.5, 0.66, 0.82].map((t, i) => {
			const x = 20 + 210 * t;
			const y = 240 - 210 * t - Math.sin(t * Math.PI) * 30;
			const a = i % 2 ? 40 : -50;
			return (
				<g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
					<path d="M0 0 C 10 -18, 30 -18, 38 0 C 30 12, 10 12, 0 0 Z" fill="none" stroke={C.dorado} strokeWidth={2} />
					<path d="M0 0 L 34 0" stroke={C.dorado} strokeWidth={1.2} />
				</g>
			);
		})}
		<circle cx={232} cy={28} r={5} fill={C.bordo} />
		<circle cx={150} cy={96} r={3.5} fill={C.celeste} />
	</svg>
);

const Separador: React.FC = () => (
	<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
		<div style={{width: 120, height: 1.5, background: C.dorado}} />
		<svg width={22} height={22} viewBox="-11 -11 22 22">
			<path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill={C.dorado} />
		</svg>
		<div style={{width: 120, height: 1.5, background: C.dorado}} />
	</div>
);

const Dato: React.FC<{titulo: string; children: React.ReactNode}> = ({titulo, children}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
		<div style={{fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: '0.28em', color: C.bordo}}>{titulo}</div>
		<div style={{fontFamily: DISPLAY, fontSize: 46, fontWeight: 600, color: C.azul, lineHeight: 1.15}}>{children}</div>
	</div>
);

const Invitacion: React.FC<{alto: number; compacto?: boolean}> = ({alto, compacto}) => {
	const m = 44; // margen del marco
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
			{/* textura de papel muy suave */}
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, rgba(255,255,255,0) 70%)'}} />
			{/* doble marco dorado */}
			<div style={{position: 'absolute', inset: m, border: `2px solid ${C.dorado}`, borderRadius: 6}} />
			<div style={{position: 'absolute', inset: m + 14, border: `1px solid ${C.dorado}`, borderRadius: 4, opacity: 0.7}} />
			<Ramita style={{left: m + 6, top: m + 6, transform: 'rotate(90deg) scaleX(-1)'}} />
			<Ramita style={{right: m + 6, top: m + 6, transform: 'rotate(-90deg)'}} />
			<Ramita style={{left: m + 6, bottom: m + 6}} />
			<Ramita style={{right: m + 6, bottom: m + 6}} flip />
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compacto ? 30 : 46, paddingTop: compacto ? 0 : 20}}>
				<Img src={staticFile('img/escudo.png')} style={{width: compacto ? 120 : 150}} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
					<div style={{fontSize: 26, fontWeight: 600, letterSpacing: '0.34em', color: C.tintaSuave}}>INSTITUTO ÁLVAREZ CONDARCO</div>
					<div style={{fontSize: 30, fontStyle: 'italic', color: C.tintaSuave}}>tiene el agrado de invitarlos a la</div>
				</div>
				<div style={{textAlign: 'center', fontFamily: DISPLAY, fontWeight: 600, color: C.azul, lineHeight: 1.0}}>
					<div style={{fontSize: compacto ? 104 : 120, letterSpacing: '-0.01em'}}>Despedida</div>
					<div style={{fontSize: compacto ? 62 : 72, color: C.bordo, marginTop: 10}}>de fin de año</div>
				</div>
				<Separador />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compacto ? 26 : 40, textAlign: 'center'}}>
					<Dato titulo="CUÁNDO">
						{DATOS.dia}
						<div style={{fontSize: 36, fontWeight: 500, color: C.tintaSuave, marginTop: 6}}>a las {DATOS.hora}</div>
					</Dato>
					<Dato titulo="DÓNDE">
						{DATOS.lugar}
						<div style={{fontSize: 32, fontWeight: 500, color: C.tintaSuave, marginTop: 6}}>{DATOS.direccion}</div>
					</Dato>
				</div>
				<Separador />
				<div style={{fontFamily: DISPLAY, fontSize: 44, fontWeight: 600, fontStyle: 'italic', color: C.azul}}>¡Los esperamos!</div>
			</div>
			{/* cinta tricolor fina, abajo dentro del marco */}
			<div style={{position: 'absolute', left: m + 14, right: m + 14, bottom: m + 14, display: 'flex', height: 8}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};

export const DespedidaDelicadaHistoria: React.FC = () => <Invitacion alto={1920} />;
export const DespedidaDelicadaFeed: React.FC = () => <Invitacion alto={1440} compacto />;
