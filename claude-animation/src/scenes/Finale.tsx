import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, CenterSvg, Converge, Shockwave, Starburst} from '../Fx';
import {C, T, clamp} from '../lib';

const HEADLINE = 'Animado 100% con código';
const ACCENT_FROM = HEADLINE.indexOf('código');

export const Finale: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const g = f + T.finaleIn;
	const P = T.pop;

	const core = g >= T.ballToCenter && g < P ? interpolate(g, [T.ballToCenter, P - 2, P], [14, 26, 8], clamp) : 0;
	const pop = spring({frame: g - P, fps, config: {damping: 9, stiffness: 190}});
	const rot = interpolate(spring({frame: g - P, fps, config: {damping: 16, stiffness: 70}}), [0, 1], [-90, 0]) + (g - P) * 0.5;
	const sub = spring({frame: g - (P + 9), fps, config: {damping: 14}});
	const sign = spring({frame: g - (P + 13), fps, config: {damping: 12}});

	return (
		<AbsoluteFill>
			<CenterSvg>
				<Converge frame={g} start={T.finaleIn} end={P} count={70} seed="fin" r={[650, 1150]} />
				{core > 0 && <circle r={core} fill={C.cream} style={{filter: 'drop-shadow(0 0 30px #D97757)'}} />}
				<Shockwave t={g - P} maxR={1250} dur={24} />
				<Burst t={g - P} count={90} seed="fin" speed={[10, 40]} life={40} drag={0.07} />
			</CenterSvg>

			{g >= P && (
				<div style={{position: 'absolute', left: 960 - 160, top: 360 - 160, transform: `scale(${pop})`}}>
					<Starburst size={320} progress={() => 1} rotation={rot} glow={1.4} />
				</div>
			)}

			<div
				style={{
					position: 'absolute',
					top: 600,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					fontSize: 104,
					fontWeight: 800,
					letterSpacing: -3,
				}}
			>
				{HEADLINE.split('').map((ch, i) => {
					const s = spring({frame: g - (P + 2) - i * 0.35, fps, config: {damping: 11, stiffness: 230}});
					return (
						<span
							key={i}
							style={{
								display: 'inline-block',
								whiteSpace: 'pre',
								color: i >= ACCENT_FROM ? C.orange : C.cream,
								opacity: Math.min(1, s * 1.6),
								transform: `translateY(${(1 - s) * 70}px) scale(${0.5 + 0.5 * s})`,
							}}
						>
							{ch}
						</span>
					);
				})}
			</div>
			<div
				style={{
					position: 'absolute',
					top: 760,
					width: '100%',
					textAlign: 'center',
					fontSize: 34,
					fontWeight: 600,
					letterSpacing: interpolate(sub, [0, 1], [24, 8]),
					color: C.sand,
					opacity: sub * 0.85,
					textTransform: 'uppercase',
				}}
			>
				Remotion · React · TypeScript · Python
			</div>
			<div
				style={{
					position: 'absolute',
					top: 850,
					width: '100%',
					textAlign: 'center',
					fontSize: 32,
					fontWeight: 400,
					fontStyle: 'italic',
					color: C.orange,
					opacity: sign,
					transform: `translateY(${(1 - sign) * 20}px)`,
				}}
			>
				— Claude
			</div>
		</AbsoluteFill>
	);
};
