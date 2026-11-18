import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp} from '../lib';

/**
 * Reel del concert (Mamma Mia) de la Muestra Anual 2026 de Secundaria.
 * Cortes con los mejores momentos de los videos, con su sonido original: canciones, escenas habladas en inglés y bailes.
 * El video apaisado va grande al centro, sobre el mismo video desenfocado; sólo una etiqueta con el nombre de la obra.
 */

// [video, desde (s), duración (s)]: canción de la boda como gancho, escenas habladas en inglés y los bailes
const CORTES: [string, number, number][] = [
	['c3', 0, 8], // "I do, I do, I do"
	['c1', 29.3, 11], // "I have to tell you something…"
	['c1', 58.3, 5.5], // "You are my mother… I love you so much"
	['c2', 28.6, 6.6], // "…let's not get married." "What?"
	['c3', 20, 7.5],
	['c3', 52, 8],
	['c4', 0, 9],
	['c4', 26, 9],
];
const FPS = 30;
const XF = 8; // cuadros de fundido entre cortes
const inicios = CORTES.reduce<number[]>((acc, [, , d], i) => [...acc, i === 0 ? 0 : acc[i - 1] + Math.round(CORTES[i - 1][2] * FPS) - XF], []);
const FIN_VIDEO = inicios[inicios.length - 1] + Math.round(CORTES[CORTES.length - 1][2] * FPS);
export const CONCERT_FRAMES = FIN_VIDEO + 60;

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});

const Corte: React.FC<{src: string; desde: number; dur: number; primero: boolean; ultimo: boolean}> = ({src, desde, dur, primero, ultimo}) => {
	const f = useCurrentFrame();
	const n = Math.round(dur * FPS);
	const op = (primero ? 1 : ease(f, 0, XF)) * (ultimo ? 1 - ease(f, n - 20, n) : 1);
	const vol = (fr: number) => (primero ? 1 : interpolate(fr, [0, XF], [0, 1], clamp)) * (ultimo ? interpolate(fr, [n - 24, n], [1, 0], clamp) : interpolate(fr, [n - XF, n], [1, 0], clamp));
	const zoom = 1.0 + 0.05 * ease(f, 0, n);
	const v = staticFile(`video/concert/${src}.mp4`);
	return (
		<AbsoluteFill style={{opacity: op}}>
			<OffthreadVideo src={v} startFrom={Math.round(desde * FPS)} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.5) saturate(1.2)', transform: 'scale(1.3)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 480, height: 960, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
				<OffthreadVideo src={v} startFrom={Math.round(desde * FPS)} volume={vol} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}} />
			</div>
		</AbsoluteFill>
	);
};

export const ConcertSecundario: React.FC = () => {
	const f = useCurrentFrame();
	const chip = ease(f, 6, 24);
	const fin = ease(f, FIN_VIDEO - 10, FIN_VIDEO + 6);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			{CORTES.map(([src, desde, dur], i) => (
				<Sequence key={i} from={inicios[i]} durationInFrames={Math.round(dur * FPS)} layout="none">
					<Corte src={src} desde={desde} dur={dur} primero={i === 0} ultimo={i === CORTES.length - 1} />
				</Sequence>
			))}
			<div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: chip * (1 - fin), transform: `translateY(${(1 - chip) * 20}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 34px 16px', borderRadius: 999, background: C.bordo, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 54}} />
					Mamma Mia!
				</div>
			</div>
			<AbsoluteFill style={{background: C.crema, opacity: fin, alignItems: 'center', justifyContent: 'center'}}>
				<div style={{width: 440, height: 440, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * fin})`}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 280}} />
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
