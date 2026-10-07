import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, T, clamp} from '../lib';

const FLOOR = 860;
const R = 58;
const [C1, C2, C3] = T.contacts;
const S = T.bounceStart;
const END = T.ballToCenter;

/** Posición de la base de la pelota (x, y) en el frame global g: caída libre + parábolas. */
const ballAt = (g: number) => {
	const seg = (a: number, b: number) => interpolate(g, [a, b], [0, 1], clamp);
	if (g <= C1) {
		const u = seg(S, C1);
		return {x: interpolate(u, [0, 1], [240, 640]), y: -80 + (FLOOR + 80) * u * u};
	}
	if (g <= C2) {
		const u = seg(C1, C2);
		return {x: interpolate(u, [0, 1], [640, 990]), y: FLOOR - 4 * 300 * u * (1 - u)};
	}
	if (g <= C3) {
		const u = seg(C2, C3);
		return {x: interpolate(u, [0, 1], [990, 1270]), y: FLOOR - 4 * 180 * u * (1 - u)};
	}
	const u = seg(C3, END);
	return {
		x: interpolate(Easing.inOut(Easing.quad)(u), [0, 1], [1270, 960]),
		y: interpolate(Easing.out(Easing.quad)(u), [0, 1], [FLOOR, 540 + R]),
	};
};

const TAGS = ['Timing', 'Anticipación', 'Arcos'];

export const Bounce: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const g = f + T.bounceIn;

	const p = ballAt(g);
	const prev = ballAt(g - 1);
	const vx = p.x - prev.x;
	const vy = p.y - prev.y;
	const speed = Math.hypot(vx, vy);
	const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

	// Squash al tocar el suelo, stretch proporcional a la velocidad.
	const d = Math.min(...T.contacts.map((c) => Math.abs(g - c - 0.5)));
	const sq = g < END - 8 ? Math.exp(-(d * d) / 1.6) : 0;
	const sx = 1 + 0.55 * sq;
	const sy = 1 - 0.42 * sq;
	const stretch = 1 + Math.min(speed / 80, 0.45) * (1 - sq);
	const shrink = interpolate(g, [END - 6, END], [1, 0.25], clamp);
	const visible = g >= S && g < END;

	const sceneIn = interpolate(g, [T.bounceIn, T.bounceIn + 6], [0, 1], clamp);
	const sceneOut = interpolate(g, [C3 + 2, END - 2], [1, 0], clamp);

	const ball = (x: number, y: number, o: number, s = 1) => (
		<g transform={`translate(${x} ${y - R * sy * s})`} opacity={o}>
			<g transform={`scale(${sx} ${sy}) rotate(${angle}) scale(${stretch} ${1 / stretch}) scale(${s})`}>
				<circle r={R} fill={C.orange} />
				<ellipse cx={-R * 0.3} cy={-R * 0.35} rx={R * 0.32} ry={R * 0.2} fill="#fff" opacity={0.35} />
			</g>
		</g>
	);

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 120,
					width: '100%',
					textAlign: 'center',
					fontSize: 92,
					fontWeight: 800,
					letterSpacing: -2,
					color: C.cream,
					opacity: sceneIn * sceneOut,
					transform: `translateY(${(1 - sceneIn) * -40}px)`,
				}}
			>
				Squash <span style={{color: C.orange}}>&amp;</span> Stretch
			</div>
			<div style={{position: 'absolute', top: 260, width: '100%', display: 'flex', justifyContent: 'center', gap: 24, opacity: sceneOut}}>
				{TAGS.map((tag, i) => {
					const s = spring({frame: g - T.contacts[i], fps, config: {damping: 9, stiffness: 200}});
					return (
						<div
							key={tag}
							style={{
								padding: '14px 34px',
								borderRadius: 999,
								fontSize: 36,
								fontWeight: 600,
								color: C.bg,
								background: [C.sand, C.blue, C.purple][i],
								opacity: Math.min(1, s * 2),
								transform: `scale(${s}) translateY(${(1 - s) * 30}px)`,
							}}
						>
							{tag}
						</div>
					);
				})}
			</div>

			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				<defs>
					<linearGradient id="floor" x1="0" x2="1">
						<stop offset="0" stopColor={C.cream} stopOpacity={0} />
						<stop offset="0.5" stopColor={C.cream} stopOpacity={0.5} />
						<stop offset="1" stopColor={C.cream} stopOpacity={0} />
					</linearGradient>
				</defs>
				<rect x={120} y={FLOOR} width={1680 * sceneIn} height={3} fill="url(#floor)" opacity={sceneOut} />

				{visible && (
					<ellipse
						cx={p.x}
						cy={FLOOR + 8}
						rx={R * (1.4 - 0.8 * Math.min(1, (FLOOR - p.y) / 500)) * sx}
						ry={10}
						fill="#000"
						opacity={0.5 * (1 - Math.min(1, (FLOOR - p.y) / 600)) * sceneOut}
					/>
				)}

				{/* polvo de impacto */}
				{T.contacts.map((c, ci) => {
					const t = g - c;
					if (t < 0 || t > 18) return null;
					const cx = ballAt(c).x;
					return Array.from({length: 12}, (_, i) => {
						const dir = i % 2 ? 1 : -1;
						const dist = (14 + random(`dust${ci}${i}`) * 80) * (1 - Math.exp(-t / 4));
						const h = random(`dh${ci}${i}`) * 50 * Math.sin((t / 18) * Math.PI);
						return (
							<circle
								key={`${ci}-${i}`}
								cx={cx + dir * (R * 0.8 + dist)}
								cy={FLOOR - 4 - h}
								r={(3 + random(`dr${ci}${i}`) * 5) * (1 - t / 18)}
								fill={C.sand}
								opacity={1 - t / 18}
							/>
						);
					});
				})}

				{/* estela */}
				{visible &&
					[6, 5, 4, 3, 2, 1].map((k) => {
						const q = ballAt(g - k * 0.7);
						return <circle key={k} cx={q.x} cy={q.y - R} r={R * (1 - k * 0.07) * shrink} fill={C.orange} opacity={0.22 * (1 - k / 7)} />;
					})}

				{visible && ball(p.x, p.y, 1, shrink)}
			</svg>
		</AbsoluteFill>
	);
};
