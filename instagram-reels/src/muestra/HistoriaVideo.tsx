import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Historia en video (1080×1920, ~14.5 s): el circuito de la Muestra 2026, un resumen de fotos
 * que cambian cada dos tiempos de la música y una placa final con el escudo.
 * La grilla de tiempos coincide con audio/make_audio_historia_muestra.py (112 BPM, dos tiempos de entrada).
 */
const BEAT_S = 60 / 112;
const enTiempo = (n: number) => Math.round((2 * BEAT_S + n * BEAT_S) * 30);

const FOTOS: [string, string, string, string, string][] = [
	['img/muestra/corren-familias.jpg', '50% 55%', '¡A correr juntos!', C.celeste, C.papel],
	['img/muestra/banda-ronda.jpg', '55% 50%', 'Música en ronda', C.sol, C.tinta],
	['img/muestra/mesas.jpg', '50% 60%', '¡A crear!', C.bordo, C.papel],
	['img/muestra/colores.jpg', '45% 50%', 'Con las seños', C.celeste, C.papel],
	['img/muestra/guitarra.jpg', '50% 50%', '¡A puro ritmo!', C.sol, C.tinta],
	['img/muestra/campo.jpg', '50% 55%', 'Juegos y desafíos', C.bordo, C.papel],
];
const VIDEO_FIN = enTiempo(10);
const CORTES = FOTOS.map((_, k) => enTiempo(10 + 2 * k));
export const FINAL = enTiempo(10 + 2 * FOTOS.length);
export const HISTORIA_VIDEO_FRAMES = FINAL + 50;

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

/** Foto con marco blanco sobre su propia versión desenfocada, que entra girando en el corte. */
const FotoResumen: React.FC<{src: string; pos: string; caption: string; bg: string; ink: string; at: number; k: number}> = ({src, pos, caption, bg, ink, at, k}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 14, stiffness: 170});
	const chip = sp(f, at + 5, {damping: 11, stiffness: 190});
	const rot = k % 2 ? 2.5 : -2.5;
	return (
		<AbsoluteFill>
			<Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(36px) brightness(0.6)', transform: 'scale(1.25)'}} />
			<div style={{position: 'absolute', left: 40, right: 40, top: 560, height: 880, padding: 18, background: C.papel, borderRadius: 32, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', transform: `rotate(${rot * (2 - s)}deg) scale(${0.85 + 0.15 * s})`}}>
				<div style={{width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden'}}>
					<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${1.04 + 0.04 * ease(f, at, at + 34)})`}} />
				</div>
			</div>
			<div style={{position: 'absolute', left: k % 2 ? undefined : 70, right: k % 2 ? 70 : undefined, top: 1400, padding: '12px 32px 16px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, whiteSpace: 'nowrap', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `scale(${chip}) rotate(${-rot}deg)`, opacity: Math.min(1, chip * 2)}}>
				{caption}
			</div>
		</AbsoluteFill>
	);
};

export const HistoriaVideoMuestra: React.FC = () => {
	const f = useCurrentFrame();
	const t1 = sp(f, 6, {damping: 13, stiffness: 150});
	const t2 = sp(f, 16, {damping: 13, stiffness: 150});
	const chip = sp(f, 90, {damping: 11, stiffness: 180});
	const fin = ease(f, FINAL - 6, FINAL + 8);
	const disco = ease(f, FINAL, FINAL + 20);
	const actual = CORTES.filter((c) => f >= c).length - 1;
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<Audio src={staticFile('muestra/musica-historia.wav')} />
			{f < VIDEO_FIN + 2 && (
				<OffthreadVideo src={staticFile('video/muestra/circuito.mp4')} volume={(fr) => interpolate(fr, [0, 8, VIDEO_FIN - 12, VIDEO_FIN], [0, 0.3, 0.3, 0], clamp)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * ease(f, 0, VIDEO_FIN)})`}} />
			)}
			{f < VIDEO_FIN && (
				<div style={{position: 'absolute', left: 64, top: 1540, padding: '12px 30px 16px', borderRadius: 999, background: C.celeste, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, transform: `scale(${chip}) rotate(-3deg)`, transformOrigin: 'left center', opacity: Math.min(1, chip * 2), boxShadow: '0 10px 24px rgba(11,20,64,0.4)'}}>
					¡Todos al circuito!
				</div>
			)}
			{actual >= 0 && f < FINAL + 10 && (
				<FotoResumen key={actual} src={FOTOS[actual][0]} pos={FOTOS[actual][1]} caption={FOTOS[actual][2]} bg={FOTOS[actual][3]} ink={FOTOS[actual][4]} at={CORTES[actual]} k={actual} />
			)}
			{/* destello blanco en cada corte */}
			{actual >= 0 && <AbsoluteFill style={{background: C.papel, opacity: 0.5 * (1 - ease(f, CORTES[actual], CORTES[actual] + 6))}} />}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(11,20,64,0.82) 0%, rgba(11,20,64,0.45) 60%, rgba(11,20,64,0) 100%)'}} />
			<div style={{position: 'absolute', top: 250, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, t1 * 2)}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 58}} />
					<div style={{fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>PRIMARIA</div>
				</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em', color: C.papel, transform: `translateY(${(1 - t2) * 60}px)`, opacity: Math.min(1, t2 * 2)}}>
					Muestra <span style={{color: C.sol}}>2026</span>
				</div>
			</div>
			{/* placa final */}
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
