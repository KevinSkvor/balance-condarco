import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, PALETTE, T, beatPulse, clamp} from '../lib';

type MiniProps = {t: number; g: number};

/** Masa colgando de un resorte: oscilador armónico amortiguado. */
const SpringMini: React.FC<MiniProps> = ({t}) => {
	const tt = Math.max(0, t) % 45;
	const y = 55 * Math.exp(-0.065 * tt) * Math.cos(0.42 * tt);
	const bottom = 120 + y;
	const coils = 12;
	const pts = Array.from({length: coils + 1}, (_, i) => {
		const py = 14 + ((bottom - 14) * i) / coils;
		const px = i === 0 || i === coils ? 158 : 158 + (i % 2 ? -26 : 26);
		return `${px},${py}`;
	}).join(' ');
	const squash = 1 + Math.max(0, -y) / 300;
	return (
		<svg width={316} height={240}>
			<rect x={108} y={6} width={100} height={8} rx={4} fill={C.sand} opacity={0.6} />
			<polyline points={pts} fill="none" stroke={C.sand} strokeWidth={5} strokeLinejoin="round" />
			<rect
				x={158 - 36 * squash}
				y={bottom}
				width={72 * squash}
				height={72 / squash}
				rx={14}
				fill={C.orange}
				style={{filter: 'drop-shadow(0 0 18px rgba(217,119,87,0.6))'}}
			/>
		</svg>
	);
};

/** Pequeña galaxia: órbitas a distintas velocidades (Kepler de mentira). */
const ParticlesMini: React.FC<MiniProps> = ({t}) => (
	<svg width={316} height={240} viewBox="-158 -120 316 240">
		<circle r={16} fill={C.cream} style={{filter: 'drop-shadow(0 0 14px #fff)'}} />
		{Array.from({length: 26}, (_, i) => {
			const rad = 30 + i * 3.6;
			const a = t * (0.16 - i * 0.004) + i * 2.4;
			return (
				<circle
					key={i}
					cx={Math.cos(a) * rad * 1.3}
					cy={Math.sin(a) * rad * 0.75}
					r={3 + random(`pm${i}`) * 5}
					fill={PALETTE[i % PALETTE.length]}
				/>
			);
		})}
	</svg>
);

/** Tipografía cinética: letras en ola. */
const TypeMini: React.FC<MiniProps> = ({t}) => (
	<div style={{display: 'flex', gap: 4, fontSize: 120, fontWeight: 800, height: 240, alignItems: 'center'}}>
		{'Aa!'.split('').map((ch, i) => {
			const w = Math.sin(t * 0.2 - i * 0.9);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						color: [C.cream, C.orange, C.blue][i],
						transform: `translateY(${w * 22}px) rotate(${w * 12}deg) scale(${1 + 0.12 * Math.cos(t * 0.2 - i * 0.9)})`,
					}}
				>
					{ch}
				</span>
			);
		})}
	</div>
);

/** Ecualizador sincronizado con el bombo del audio sintetizado en Python. */
const SoundMini: React.FC<MiniProps> = ({t, g}) => (
	<svg width={316} height={240}>
		{Array.from({length: 16}, (_, i) => {
			const p = beatPulse(g - Math.abs(i - 7.5) * 0.5);
			const h = 18 + 150 * p * (0.45 + 0.55 * random(`eq${i}`)) + 22 * Math.abs(Math.sin(t * 0.35 + i));
			return (
				<rect
					key={i}
					x={10 + i * 19.0}
					y={220 - h}
					width={12}
					height={h}
					rx={6}
					fill={i % 3 === 0 ? C.sand : C.orange}
				/>
			);
		})}
	</svg>
);

const CARDS = [
	{title: 'Física', sub: 'resortes y rebotes', Mini: SpringMini},
	{title: 'Partículas', sub: 'sistemas generativos', Mini: ParticlesMini},
	{title: 'Tipografía', sub: 'texto con vida', Mini: TypeMini},
	{title: 'Sonido', sub: 'sintetizado en Python', Mini: SoundMini},
];

const TITLE = 'Mis superpoderes';

export const Skills: React.FC = () => {
	const f = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const g = f + T.skillsIn;
	const titleExit = interpolate(f, [durationInFrames - 16, durationInFrames - 4], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});

	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div
				style={{
					position: 'absolute',
					top: 110,
					fontSize: 84,
					fontWeight: 800,
					letterSpacing: -2,
					color: C.cream,
					display: 'flex',
					opacity: 1 - titleExit,
					transform: `translateY(${-titleExit * 120}px)`,
				}}
			>
				{TITLE.split('').map((ch, i) => {
					const p = spring({frame: f - 2 - i * 0.8, fps, config: {damping: 9, stiffness: 160}});
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								whiteSpace: 'pre',
								opacity: Math.min(1, p * 2),
								transform: `translateY(${(1 - p) * -90}px) rotate(${(1 - p) * (i % 2 ? 25 : -25)}deg)`,
							}}
						>
							{ch}
						</span>
					);
				})}
			</div>

			<div style={{position: 'absolute', top: 300, display: 'flex', gap: 40}}>
				{CARDS.map(({title, sub, Mini}, i) => {
					const enter = T.cards[i] - T.skillsIn;
					const s = spring({frame: f - enter, fps, config: {damping: 12, stiffness: 115}});
					const ex = durationInFrames - 22 + i * 2;
					const e = interpolate(f, [ex, ex + 12], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
					const bob = Math.sin((g + i * 9) / 11) * 8;
					const hit = beatPulse(g) * (Math.floor((g - T.beatStart) / 15) % 4 === i ? 1 : 0);
					return (
						<div
							key={title}
							style={{
								width: 380,
								height: 450,
								borderRadius: 34,
								padding: 32,
								boxSizing: 'border-box',
								background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))',
								border: `1.5px solid rgba(240,238,230,${0.12 + hit * 0.5})`,
								boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 ${60 * hit}px rgba(217,119,87,${0.5 * hit})`,
								opacity: Math.min(1, s * 2) * (1 - e),
								transform: `translateY(${(1 - s) * 720 + bob - e * 900 - hit * 10}px) rotate(${(1 - s) * (i % 2 ? -18 : 18) + e * (i % 2 ? 10 : -10)}deg) scale(${0.85 + 0.15 * s})`,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
							}}
						>
							<div style={{height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Mini t={f - enter} g={g} />
							</div>
							<div style={{marginTop: 38, fontSize: 46, fontWeight: 800, color: C.cream}}>{title}</div>
							<div style={{marginTop: 8, fontSize: 26, fontWeight: 400, color: C.sand, opacity: 0.8}}>{sub}</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
