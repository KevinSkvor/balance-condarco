import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {C, PALETTE, beatPulse, clamp} from './lib';

/** SVG a pantalla completa con el origen (0,0) en el centro. */
export const CenterSvg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<svg width={1920} height={1080} viewBox="-960 -540 1920 1080" style={{position: 'absolute', overflow: 'visible', ...style}}>
		{children}
	</svg>
);

/** Explosión de partículas con arrastre (física: v·e^(-kt)). */
export const Burst: React.FC<{
	t: number;
	count: number;
	seed: string;
	speed: [number, number];
	life: number;
	drag?: number;
}> = ({t, count, seed, speed, life, drag = 0.085}) => {
	if (t < 0) return null;
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const a = random(`${seed}a${i}`) * Math.PI * 2;
				const sp = speed[0] + random(`${seed}s${i}`) * (speed[1] - speed[0]);
				const d = (sp * (1 - Math.exp(-drag * t))) / drag;
				const v = sp * Math.exp(-drag * t);
				const tail = Math.max(0, d - v * 2.4);
				const o = interpolate(t, [0, life * (0.55 + 0.45 * random(`${seed}l${i}`))], [1, 0], clamp);
				if (o <= 0) return null;
				const w = (2 + random(`${seed}w${i}`) * 6) * (0.35 + 0.65 * o);
				const col = PALETTE[Math.floor(random(`${seed}c${i}`) * PALETTE.length)];
				return (
					<line
						key={i}
						x1={Math.cos(a) * tail}
						y1={Math.sin(a) * tail}
						x2={Math.cos(a) * d}
						y2={Math.sin(a) * d}
						stroke={col}
						strokeWidth={w}
						strokeLinecap="round"
						opacity={o}
					/>
				);
			})}
		</>
	);
};

/** Partículas que son "absorbidas" hacia el centro (anticipación). */
export const Converge: React.FC<{
	frame: number;
	start: number;
	end: number;
	count: number;
	seed: string;
	r: [number, number];
}> = ({frame, start, end, count, seed, r}) => {
	const ease = Easing.in(Easing.cubic);
	return (
		<>
			{Array.from({length: count}, (_, i) => {
				const a = random(`${seed}a${i}`) * Math.PI * 2;
				const rr = r[0] + random(`${seed}r${i}`) * (r[1] - r[0]);
				const s = start + random(`${seed}s${i}`) * (end - start) * 0.55;
				const t = interpolate(frame, [s, end], [0, 1], clamp);
				if (t <= 0 || t >= 1) return null;
				const head = rr * (1 - ease(t));
				const tail = rr * (1 - ease(Math.max(0, t - 0.09)));
				const col = PALETTE[Math.floor(random(`${seed}c${i}`) * PALETTE.length)];
				return (
					<line
						key={i}
						x1={Math.cos(a) * tail}
						y1={Math.sin(a) * tail}
						x2={Math.cos(a) * head}
						y2={Math.sin(a) * head}
						stroke={col}
						strokeWidth={2 + random(`${seed}w${i}`) * 3}
						strokeLinecap="round"
						opacity={Math.min(1, t * 4)}
					/>
				);
			})}
		</>
	);
};

export const Shockwave: React.FC<{t: number; maxR: number; dur?: number}> = ({t, maxR, dur = 22}) => {
	if (t < 0 || t > dur) return null;
	const r = interpolate(t, [0, dur], [0, maxR], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<circle
			r={r}
			fill="none"
			stroke={C.cream}
			strokeWidth={interpolate(t, [0, dur], [42, 1], clamp)}
			opacity={interpolate(t, [0, dur], [0.85, 0], clamp)}
		/>
	);
};

const RAYS = Array.from({length: 12}, (_, i) => ({
	angle: i * 30 + (random(`ray-a${i}`) - 0.5) * 12,
	len: 0.7 + random(`ray-l${i}`) * 0.3,
	width: 0.12 + random(`ray-w${i}`) * 0.06,
}));

/** El "asterisco" de Claude: 12 rayos irregulares que se dibujan uno a uno. */
export const Starburst: React.FC<{
	size: number;
	progress: (i: number) => number;
	rotation?: number;
	glow?: number;
}> = ({size, progress, rotation = 0, glow = 1}) => {
	const R = size / 2;
	return (
		<svg
			width={size}
			height={size}
			viewBox={`${-R} ${-R} ${size} ${size}`}
			style={{overflow: 'visible', filter: `drop-shadow(0 0 ${40 * glow}px rgba(217,119,87,${0.55 * glow}))`}}
		>
			<g transform={`rotate(${rotation})`}>
				{RAYS.map((r, i) => {
					const p = progress(i);
					if (p <= 0.001) return null;
					const a = (r.angle * Math.PI) / 180;
					const inner = R * 0.06;
					const outer = inner + (R * r.len - inner) * p;
					return (
						<line
							key={i}
							x1={Math.cos(a) * inner}
							y1={Math.sin(a) * inner}
							x2={Math.cos(a) * outer}
							y2={Math.sin(a) * outer}
							stroke={C.orange}
							strokeWidth={R * r.width}
							strokeLinecap="round"
						/>
					);
				})}
			</g>
		</svg>
	);
};

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const p = beatPulse(frame);
	const intro = interpolate(frame, [0, 30, 42], [0, 0.12, 1], clamp);
	const blobs = [
		{c: C.orange, x: 28 + 10 * Math.sin(frame / 40), y: 32 + 8 * Math.cos(frame / 53), s: 1100, o: 0.2},
		{c: C.blue, x: 76 + 8 * Math.cos(frame / 47), y: 66 + 10 * Math.sin(frame / 38), s: 1200, o: 0.13},
		{c: C.purple, x: 56 + 12 * Math.sin(frame / 61 + 2), y: 18 + 6 * Math.sin(frame / 33), s: 900, o: 0.11},
	];
	const mask = 'radial-gradient(ellipse at center, black 25%, transparent 72%)';
	return (
		<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${C.bg2} 0%, ${C.bg} 70%)`}}>
			<AbsoluteFill style={{opacity: intro}}>
				{blobs.map((b, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${b.x}%`,
							top: `${b.y}%`,
							width: b.s,
							height: b.s,
							marginLeft: -b.s / 2,
							marginTop: -b.s / 2,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${b.c} 0%, transparent 62%)`,
							opacity: b.o * (1 + 0.9 * p),
						}}
					/>
				))}
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: intro * (0.7 + 0.5 * p),
					backgroundImage:
						'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
					backgroundSize: '80px 80px',
					backgroundPosition: `${-frame * 0.7}px ${-frame * 0.5}px`,
					maskImage: mask,
					WebkitMaskImage: mask,
				}}
			/>
		</AbsoluteFill>
	);
};

export const Grain: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{mixBlendMode: 'overlay', opacity: 0.14, pointerEvents: 'none'}}>
			<svg width="100%" height="100%">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC = () => (
	<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none'}} />
);
