import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Historia en video (1080×1920, ~12 s): el circuito de la Muestra 2026 con el sonido real,
 * títulos que entran arriba y una placa final con el escudo.
 */
export const VIDEO_FRAMES = 314;
export const HISTORIA_VIDEO_FRAMES = VIDEO_FRAMES + 50;

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

export const HistoriaVideoMuestra: React.FC = () => {
	const f = useCurrentFrame();
	const t1 = sp(f, 6, {damping: 13, stiffness: 150});
	const t2 = sp(f, 16, {damping: 13, stiffness: 150});
	const chip = sp(f, 120, {damping: 11, stiffness: 180});
	const fin = ease(f, VIDEO_FRAMES - 10, VIDEO_FRAMES + 8);
	const disco = ease(f, VIDEO_FRAMES, VIDEO_FRAMES + 20);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<OffthreadVideo src={staticFile('video/muestra/circuito.mp4')} volume={(fr) => interpolate(fr, [0, 8, VIDEO_FRAMES - 14, VIDEO_FRAMES], [0, 1, 1, 0], clamp)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + 0.05 * ease(f, 0, VIDEO_FRAMES)})`}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, background: 'linear-gradient(180deg, rgba(11,20,64,0.82) 0%, rgba(11,20,64,0.45) 60%, rgba(11,20,64,0) 100%)'}} />
			<div style={{position: 'absolute', top: 250, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 12}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: Math.min(1, t1 * 2)}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 58}} />
					<div style={{fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>PRIMARIA</div>
				</div>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1, letterSpacing: '-0.02em', color: C.papel, transform: `translateY(${(1 - t2) * 60}px)`, opacity: Math.min(1, t2 * 2)}}>
					Muestra <span style={{color: C.sol}}>2026</span>
				</div>
			</div>
			<div style={{position: 'absolute', left: 64, top: 1540, padding: '12px 30px 16px', borderRadius: 999, background: C.celeste, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, transform: `scale(${chip}) rotate(-3deg)`, transformOrigin: 'left center', opacity: Math.min(1, chip * 2), boxShadow: '0 10px 24px rgba(11,20,64,0.4)'}}>
				¡Todos al circuito!
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
