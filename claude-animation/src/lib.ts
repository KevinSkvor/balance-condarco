import {continueRender, cancelRender, delayRender, random, staticFile} from 'remotion';
import timeline from './timeline.json';

export const T = timeline;

export const C = {
	bg: '#0E0C0B',
	bg2: '#1F1714',
	orange: '#D97757',
	cream: '#F0EEE6',
	sand: '#E8C9A9',
	blue: '#6A9BCC',
	green: '#8DB580',
	purple: '#B08ED9',
};

export const PALETTE = [C.orange, C.orange, C.cream, C.sand, C.blue, C.purple];

export const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const BEAT_FRAMES = (60 / T.bpm) * T.fps;

/** 1 justo en cada negra, cae exponencialmente: sincroniza la imagen con el bombo. */
export const beatPulse = (frame: number) => {
	if (frame < T.beatStart || frame >= T.beatEnd) return 0;
	return Math.exp(-((frame - T.beatStart) % BEAT_FRAMES) / 3.5);
};

/** Sacudida de cámara amortiguada en los dos impactos. */
export const shake = (frame: number) => {
	let x = 0;
	let y = 0;
	for (const [at, amp] of [
		[T.burst, 20],
		[T.pop, 28],
	]) {
		const t = frame - at;
		if (t >= 0 && t < 20) {
			const a = amp * Math.exp(-t / 4);
			x += (random(`sx${frame}`) - 0.5) * 2 * a;
			y += (random(`sy${frame}`) - 0.5) * 2 * a;
		}
	}
	return {x, y};
};

// Inter empaquetada en /public para que el render sea idéntico en cualquier máquina.
const fontHandle = delayRender('Cargando Inter');
Promise.all(
	[400, 600, 800].map((w) =>
		new FontFace('Inter', `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2')`, {
			weight: String(w),
		})
			.load()
			.then((f) => document.fonts.add(f)),
	),
)
	.then(() => continueRender(fontHandle))
	.catch((err) => cancelRender(err));
