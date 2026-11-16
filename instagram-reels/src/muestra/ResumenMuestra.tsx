import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Historia en video (1080×1920, ~16 s) que resume la Muestra 2026 de Primaria, corta y clara:
 * video del circuito → 3 fotos → video de la gran ronda → 2 fotos → placa final.
 * Cada foto dura tres tiempos de la música (112 BPM); la grilla coincide con
 * audio/make_audio_resumen_muestra.py.
 */
const BEAT_S = 60 / 112;
export const enTiempo = (n: number) => Math.round((2 * BEAT_S + n * BEAT_S) * 30);

type Foto = [src: string, pos: string, caption: string, bg: string, ink: string];
const FOTOS_A: Foto[] = [
	['img/muestra/corren-familias.jpg', '50% 55%', '¡A jugar!', C.sol, C.tinta],
	['img/muestra/mesas.jpg', '50% 60%', '¡A crear!', C.bordo, C.papel],
	['img/muestra/banda-ronda.jpg', '55% 50%', '¡A cantar!', C.celeste, C.papel],
];
const FOTOS_B: Foto[] = [
	['img/muestra/mantas.jpg', '45% 60%', 'En familia', C.sol, C.tinta],
	['img/muestra/arbol.jpg', '50% 70%', '¡Todos juntos!', C.bordo, C.papel],
];

// grilla en tiempos (beats) de la música
const PASO = 3; // tiempos por foto
const T_CIRCUITO = 5; // el video del circuito ocupa los primeros tiempos
const T_FOTOS_A = T_CIRCUITO;
const T_RONDA = T_FOTOS_A + PASO * FOTOS_A.length;
const T_FOTOS_B = T_RONDA + 6;
const T_FINAL = T_FOTOS_B + PASO * FOTOS_B.length;
const FINAL = enTiempo(T_FINAL);
export const RESUMEN_FRAMES = FINAL + 45;

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const Chip: React.FC<{text: string; bg: string; ink: string; at: number; side: 'left' | 'right'; top: number}> = ({text, bg, ink, at, side, top}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 11, stiffness: 190});
	const rot = side === 'left' ? -3 : 3;
	return (
		<div style={{position: 'absolute', [side]: 64, top, padding: '12px 32px 16px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, whiteSpace: 'nowrap', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: `${side} center`, opacity: Math.min(1, s * 2)}}>
			{text}
		</div>
	);
};

/** Foto con marco blanco sobre su propia versión desenfocada; entra girando en el corte. */
const FotoResumen: React.FC<{foto: Foto; at: number; k: number}> = ({foto: [src, pos, caption, bg, ink], at, k}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 14, stiffness: 170});
	const rot = k % 2 ? 2.5 : -2.5;
	return (
		<AbsoluteFill>
			<Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(36px) brightness(0.6)', transform: 'scale(1.25)'}} />
			<div style={{position: 'absolute', left: 36, right: 36, top: 540, height: 920, padding: 18, background: C.papel, borderRadius: 32, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', transform: `rotate(${rot * (2 - s)}deg) scale(${0.85 + 0.15 * s})`}}>
				<div style={{width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden'}}>
					<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.04 + 0.04 * ease(f, at, at + 34)})`}} />
				</div>
			</div>
			<Chip text={caption} bg={bg} ink={ink} at={at + 5} side={k % 2 ? 'right' : 'left'} top={1420} />
		</AbsoluteFill>
	);
};

const Fotos: React.FC<{fotos: Foto[]; desde: number}> = ({fotos, desde}) => {
	const f = useCurrentFrame();
	const cortes = fotos.map((_, k) => enTiempo(desde + PASO * k));
	const k = cortes.filter((c) => f >= c).length - 1;
	if (k < 0) return null;
	return (
		<>
			<FotoResumen key={k} foto={fotos[k]} at={cortes[k]} k={k} />
			<AbsoluteFill style={{background: C.papel, opacity: 0.5 * (1 - ease(f, cortes[k], cortes[k] + 6))}} />
		</>
	);
};

export const ResumenMuestra: React.FC = () => {
	const f = useCurrentFrame();
	const a0 = enTiempo(T_FOTOS_A);
	const r0 = enTiempo(T_RONDA);
	const b0 = enTiempo(T_FOTOS_B);
	const t1 = sp(f, 4, {damping: 13, stiffness: 150});
	const t2 = sp(f, 12, {damping: 13, stiffness: 150});
	const card = sp(f, r0, {damping: 16, stiffness: 120});
	const fin = ease(f, FINAL - 6, FINAL + 8);
	const disco = ease(f, FINAL, FINAL + 20);
	const vol = (dur: number) => (fr: number) => interpolate(fr, [0, 6, dur - 10, dur], [0, 0.25, 0.25, 0], clamp);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<Audio src={staticFile('muestra/musica-resumen.wav')} />

			{/* 1 · circuito (video vertical) */}
			<Sequence from={0} durationInFrames={a0 + 2} layout="none">
				<AbsoluteFill>
					<OffthreadVideo src={staticFile('video/muestra/circuito.mp4')} volume={vol(a0)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * ease(f, 0, a0)})`}} />
					<Chip text="¡Al circuito!" bg={C.celeste} ink={C.papel} at={20} side="left" top={1520} />
				</AbsoluteFill>
			</Sequence>

			{/* 2 · primeras fotos */}
			{f >= a0 && f < r0 + 2 && <Fotos fotos={FOTOS_A} desde={T_FOTOS_A} />}

			{/* 3 · la gran ronda (video apaisado en tarjeta); dentro de la Sequence el cuadro de los Chip cuenta desde 0 */}
			<Sequence from={r0} durationInFrames={b0 - r0 + 2} layout="none">
				<AbsoluteFill>
					<OffthreadVideo src={staticFile('video/muestra/ronda.mp4')} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.55) saturate(1.2)', transform: 'scale(1.3)'}} />
					<div style={{position: 'absolute', left: 24, right: 24, top: 580, height: 800, padding: 14, background: C.papel, borderRadius: 32, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', transform: `scale(${0.9 + 0.1 * card}) rotate(${(1 - card) * -4}deg)`}}>
						<div style={{width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden'}}>
							<OffthreadVideo src={staticFile('video/muestra/ronda.mp4')} volume={vol(b0 - r0)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', transform: `scale(${1 + 0.06 * ease(f, r0, b0)})`}} />
						</div>
					</div>
					<Chip text="La gran ronda" bg={C.sol} ink={C.tinta} at={8} side="left" top={1420} />
				</AbsoluteFill>
			</Sequence>
			{f >= r0 && <AbsoluteFill style={{background: C.papel, opacity: 0.5 * (1 - ease(f, r0, r0 + 6))}} />}

			{/* 4 · más fotos */}
			{f >= b0 && f < FINAL + 10 && <Fotos fotos={FOTOS_B} desde={T_FOTOS_B} />}

			{/* título fijo arriba */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(11,20,64,0.82) 0%, rgba(11,20,64,0.45) 60%, rgba(11,20,64,0) 100%)'}} />
			<div style={{position: 'absolute', top: 250, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, t1 * 2)}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 58}} />
					<div style={{fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>NIVEL PRIMARIO</div>
				</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em', color: C.papel, transform: `translateY(${(1 - t2) * 60}px)`, opacity: Math.min(1, t2 * 2)}}>
					Muestra <span style={{color: C.sol}}>2026</span>
				</div>
			</div>

			{/* 5 · placa final */}
			<AbsoluteFill style={{background: C.crema, opacity: fin, alignItems: 'center'}}>
				<div style={{position: 'absolute', top: 560, width: 440, height: 440, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 280}} />
				</div>
				<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 64, fontWeight: 700, color: C.azul}}>¡Gracias, familias!</div>
				<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave}}>Muestra 2026 · Nivel Primario</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
