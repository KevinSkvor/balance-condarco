import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Historia en video (1080×1920, ~15 s): la gran ronda de chicos y familias en la Muestra 2026.
 * El video es apaisado: va grande al centro, con el mismo video desenfocado de fondo y su canción original.
 */
const VIDEO_FRAMES = 14 * 30;
export const HISTORIA_RONDA_FRAMES = VIDEO_FRAMES + 45;

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const volumen = (fr: number) => interpolate(fr, [0, 6, VIDEO_FRAMES - 24, VIDEO_FRAMES], [0, 1, 1, 0], clamp);

export const HistoriaRonda: React.FC = () => {
	const f = useCurrentFrame();
	const t1 = sp(f, 4, {damping: 13, stiffness: 150});
	const t2 = sp(f, 12, {damping: 13, stiffness: 150});
	const card = sp(f, 0, {damping: 16, stiffness: 120});
	const chip1 = sp(f, 45, {damping: 11, stiffness: 180});
	const chip2 = sp(f, 150, {damping: 11, stiffness: 180});
	const fin = ease(f, VIDEO_FRAMES - 8, VIDEO_FRAMES + 8);
	const disco = ease(f, VIDEO_FRAMES, VIDEO_FRAMES + 20);
	const zoom = 1.0 + 0.08 * ease(f, 0, VIDEO_FRAMES);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<OffthreadVideo src={staticFile('video/muestra/ronda.mp4')} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.55) saturate(1.2)', transform: 'scale(1.3)'}} />
			<div style={{position: 'absolute', left: 24, right: 24, top: 580, height: 800, padding: 14, background: C.papel, borderRadius: 32, boxShadow: '0 30px 70px rgba(0,0,0,0.5)', transform: `scale(${0.9 + 0.1 * card}) rotate(${(1 - card) * -4}deg)`, opacity: Math.min(1, card * 2)}}>
				<div style={{width: '100%', height: '100%', borderRadius: 22, overflow: 'hidden'}}>
					<OffthreadVideo src={staticFile('video/muestra/ronda.mp4')} volume={volumen} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', transform: `scale(${zoom})`}} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 250, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, t1 * 2)}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 58}} />
					<div style={{fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>PRIMARIA · MUESTRA 2026</div>
				</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em', color: C.papel, transform: `translateY(${(1 - t2) * 60}px)`, opacity: Math.min(1, t2 * 2)}}>
					La gran <span style={{color: C.sol}}>ronda</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 70, top: 1340, padding: '12px 30px 16px', borderRadius: 999, background: C.celeste, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, transform: `scale(${chip1}) rotate(-3deg)`, transformOrigin: 'left center', opacity: Math.min(1, chip1 * 2), boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
				Chicos y familias
			</div>
			<div style={{position: 'absolute', right: 70, top: 1440, padding: '12px 30px 16px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, transform: `scale(${chip2}) rotate(3deg)`, transformOrigin: 'right center', opacity: Math.min(1, chip2 * 2), boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
				¡todos de la mano!
			</div>
			<AbsoluteFill style={{background: C.crema, opacity: fin, alignItems: 'center'}}>
				<div style={{position: 'absolute', top: 560, width: 440, height: 440, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 280}} />
				</div>
				<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 64, fontWeight: 700, color: C.azul}}>¡Qué lindo día juntos!</div>
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
