import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, NIVELES, SANS, T, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';

/** 5–10 s · "Para Jardín, Primaria y Secundaria. Tres niveles, un mismo colegio." */
export const Niveles: React.FC = () => {
	const f = useCurrentFrame();
	const [start, end] = T.scenes.niveles;

	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 250, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 20}}>
				<Volanta at={start + 4}>PARA TODOS LOS NIVELES</Volanta>
				<Titulo at={start + 8} parts={['Tres niveles, un mismo ', 'colegio']} size={96} stagger={3} />
			</div>

			<div style={{position: 'absolute', top: 560, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 28}}>
				{NIVELES.map((n, i) => {
					const at = T.cards[i];
					const s = sp(f, at, {damping: 17, stiffness: 120});
					const reveal = interpolate(f, [at, at + 16], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
					const tag = sp(f, at + 8, {damping: 11, stiffness: 180});
					const dir = i % 2 ? 1 : -1;
					const out = interpolate(f, [end - 22 + i * 3, end - 8 + i * 3], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
					return (
						<div
							key={n.name}
							style={{
								position: 'relative',
								height: 290,
								borderRadius: 28,
								overflow: 'hidden',
								transform: `translateX(${(1 - s) * dir * 160 + out * -dir * 1100}px)`,
								opacity: Math.min(1, s * 2),
								clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round 28px)`,
							}}
						>
							<Img
								src={staticFile(n.img)}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									objectPosition: n.pos,
									transform: `scale(${1.15 - 0.1 * interpolate(f, [at, end], [0, 1], clamp)})`,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 28,
									bottom: 28,
									padding: '14px 34px',
									borderRadius: 999,
									background: n.color,
									color: n.ink,
									fontFamily: SANS,
									fontSize: 44,
									fontWeight: 700,
									transform: `scale(${tag})`,
									transformOrigin: 'left bottom',
								}}
							>
								{n.name}
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
