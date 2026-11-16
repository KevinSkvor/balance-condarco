import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Reel "Las aves" de Sala de 5 (Ositos), Nivel Inicial, sin voz.
 * banderines → dado de preguntas → libro de aves (un ave cada 4 tiempos) → página con los nombres → escudo.
 * La grilla (112 BPM) coincide con audio/make_audio_aves.py.
 */
const BEAT_S = 60 / 112;
export const enTiempo = (n: number) => Math.round(n * BEAT_S * 30);

// [inicio en el video del libro (s), nombre del ave, color de etiqueta, tinta]
const AVES: [number, string, string, string][] = [
	[8.8, 'Benteveo', C.sol, C.tinta],
	[16.2, 'Hornero', C.bordo, C.papel],
	[19.2, 'Pingüino', C.celeste, C.papel],
	[28.6, 'Cóndor andino', C.sol, C.tinta],
	[33.6, 'Loro barranquero', C.bordo, C.papel],
	[48.4, 'Flamenco austral', C.celeste, C.papel],
];
// preguntas del dado: [segundo del video en que aparece la cara, texto]
const PREGUNTAS: [number, string][] = [
	[0, '¿Cómo se mueven?'],
	[1.2, 'Dato curioso'],
	[2.4, '¿Cuánto miden?'],
	[4.6, '¿Cómo construyen su nido?'],
	[7.0, '¿Cómo ponen sus huevos?'],
];

const T_DADO = 10;
const T_LIBRO = 28;
const PASO = 4;
const T_NOMBRES = T_LIBRO + PASO * AVES.length;
const T_FINAL = T_NOMBRES + 4;
export const AVES_FRAMES = enTiempo(T_FINAL + 4);

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

/** Pajarito dibujado que aletea. */
const Pajarito: React.FC<{size: number; color?: string}> = ({size, color = C.sol}) => {
	const f = useCurrentFrame();
	const ala = Math.sin(f / 2.2) * 28;
	return (
		<svg width={size} height={size} viewBox="-60 -60 120 120" style={{overflow: 'visible'}}>
			<path d="M-10 -4 L-34 -20 L-26 2 Z" fill={C.bordo} transform={`rotate(${ala} -10 -4)`} />
			<ellipse cx={0} cy={6} rx={34} ry={26} fill={color} />
			<circle cx={28} cy={-14} r={18} fill={color} />
			<path d="M44 -16 L58 -12 L44 -8 Z" fill={C.bordo} />
			<circle cx={33} cy={-18} r={4} fill={C.tinta} />
			<path d="M-30 4 L-54 -6 L-50 14 Z" fill={color} />
			<path d="M-6 0 Q 10 -40 22 -6" fill={C.celeste} transform={`rotate(${-ala} 8 0)`} />
		</svg>
	);
};

const Chip: React.FC<{text: string; bg: string; ink: string; at: number; side?: 'left' | 'right'; top: number; size?: number}> = ({text, bg, ink, at, side = 'left', top, size = 56}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 11, stiffness: 190});
	if (f < at - 1) return null;
	const rot = side === 'left' ? -3 : 3;
	return (
		<div style={{position: 'absolute', [side]: 56, top, padding: '12px 34px 18px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: `${side} center`, opacity: Math.min(1, s * 2)}}>
			{text}
		</div>
	);
};

const Velo: React.FC = () => (
	<>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 720, background: 'linear-gradient(180deg, rgba(11,20,64,0.85) 0%, rgba(11,20,64,0.45) 60%, rgba(11,20,64,0) 100%)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 640, background: 'linear-gradient(0deg, rgba(11,20,64,0.75) 0%, rgba(11,20,64,0) 100%)'}} />
	</>
);

const Titulo: React.FC<{volanta: string; children: React.ReactNode; at: number}> = ({volanta, children, at}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 13, stiffness: 150});
	return (
		<div style={{position: 'absolute', top: 240, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 10, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 50}px)`}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
				<Img src={staticFile('img/escudo.png')} style={{height: 56}} />
				<div style={{fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>{volanta}</div>
			</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.papel}}>{children}</div>
		</div>
	);
};

const Video: React.FC<{src: string; desde?: number}> = ({src, desde = 0}) => (
	<OffthreadVideo src={staticFile(src)} startFrom={Math.round(desde * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
);

const Destello: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	return <AbsoluteFill style={{background: C.papel, opacity: 0.55 * (1 - ease(f, at, at + 6)), pointerEvents: 'none'}} />;
};

export const AvesSala5: React.FC = () => {
	const f = useCurrentFrame();
	const d0 = enTiempo(T_DADO);
	const l0 = enTiempo(T_LIBRO);
	const n0 = enTiempo(T_NOMBRES);
	const fin = enTiempo(T_FINAL);
	const vuelo = ease(f, 0, 50);
	const disco = ease(f, fin, fin + 20);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<Audio src={staticFile('aves/soundtrack.wav')} />

			{/* 1 · banderines del aula */}
			<Sequence from={0} durationInFrames={d0 + 2} layout="none">
				<AbsoluteFill style={{transform: `scale(${1.05 + 0.06 * ease(f, 0, d0)})`}}>
					<Video src="video/aves/banderines.mp4" />
				</AbsoluteFill>
				<Velo />
				<Titulo volanta="JARDÍN · SALA DE 5" at={4}>
					Aprendimos sobre las <span style={{color: C.sol}}>aves</span>
				</Titulo>
				<div style={{position: 'absolute', left: -200 + 900 * vuelo, top: 720 - 140 * Math.sin(vuelo * Math.PI), transform: `rotate(${-8 + 16 * vuelo}deg)`}}>
					<Pajarito size={230} />
				</div>
				<Chip text="Nuestros banderines" bg={C.sol} ink={C.tinta} at={40} top={1480} />
			</Sequence>

			{/* 2 · el dado de las preguntas */}
			<Sequence from={d0} durationInFrames={l0 - d0 + 2} layout="none">
				<AbsoluteFill>
					<Video src="video/aves/dado.mp4" />
				</AbsoluteFill>
				<Velo />
				<Titulo volanta="INVESTIGAMOS" at={2}>
					El dado de las <span style={{color: C.sol}}>preguntas</span>
				</Titulo>
				{PREGUNTAS.map(([t, txt], i) => {
					const at = Math.round(t * 30) + 3;
					const hasta = i < PREGUNTAS.length - 1 ? Math.round(PREGUNTAS[i + 1][0] * 30) + 3 : l0 - d0;
					return (
						<Sequence key={txt} from={at} durationInFrames={hasta - at} layout="none">
							<Chip text={txt} bg={[C.sol, C.celeste, C.bordo][i % 3]} ink={i % 3 === 0 ? C.tinta : C.papel} at={0} side={i % 2 ? 'right' : 'left'} top={1460} size={54} />
						</Sequence>
					);
				})}
			</Sequence>
			<Destello at={d0} />

			{/* 3 · el libro de aves, un ave cada 4 tiempos */}
			{AVES.map(([desde, nombre, bg, ink], k) => {
				const a = enTiempo(T_LIBRO + PASO * k);
				const b = enTiempo(T_LIBRO + PASO * (k + 1));
				return (
					<Sequence key={nombre} from={a} durationInFrames={b - a + 1} layout="none">
						<AbsoluteFill>
							<Video src="video/aves/libro.mp4" desde={desde} />
						</AbsoluteFill>
						<Velo />
						<Titulo volanta="NUESTRO LIBRO DE AVES" at={k === 0 ? 2 : -30}>
							Aves <span style={{color: C.sol}}>argentinas</span>
						</Titulo>
						<Chip text={nombre} bg={bg} ink={ink} at={3} side={k % 2 ? 'right' : 'left'} top={1460} size={64} />
						<Destello at={0} />
					</Sequence>
				);
			})}

			{/* 4 · la página con los nombres de los chicos */}
			<Sequence from={n0} durationInFrames={fin - n0 + 8} layout="none">
				<AbsoluteFill>
					<Video src="video/aves/libro.mp4" desde={51.2} />
				</AbsoluteFill>
				<Velo />
				<Titulo volanta="SALA DE 5 · OSITOS" at={-30}>
					¡Hecho por <span style={{color: C.sol}}>nosotros</span>!
				</Titulo>
				<Destello at={0} />
			</Sequence>

			{/* 5 · cierre */}
			<AbsoluteFill style={{background: C.crema, opacity: ease(f, fin - 4, fin + 10), alignItems: 'center'}}>
				<div style={{position: 'absolute', top: 560, width: 440, height: 440, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 280}} />
				</div>
				<div style={{position: 'absolute', top: 420, left: 640, transform: `scale(${disco})`}}>
					<Pajarito size={130} />
				</div>
				<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 66, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
				<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave}}>Sala de 5 · Las aves</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
