import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, CenterSvg, Converge, Shockwave} from '../Fx';
import {C, T, clamp} from '../lib';

/** 0–2 s: una chispa absorbe energía, se contrae (anticipación) y explota. */
export const Spark: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const B = T.burst;

	const born = spring({frame: f - 2, fps, config: {damping: 9}});
	const charge = interpolate(f, [0, B - 6], [8, 30], clamp) + Math.sin(f * 0.9) * 3;
	const squeeze = interpolate(f, [B - 6, B - 1], [1, 0.45], clamp);
	const r = f < B ? born * charge * squeeze : 0;

	return (
		<AbsoluteFill>
			<CenterSvg>
				<defs>
					<radialGradient id="core">
						<stop offset="0%" stopColor="#FFF6EE" />
						<stop offset="45%" stopColor={C.sand} />
						<stop offset="100%" stopColor={C.orange} stopOpacity={0} />
					</radialGradient>
				</defs>
				<Converge frame={f} start={0} end={B - 2} count={46} seed="intro" r={[450, 1100]} />
				{r > 0 && (
					<>
						<circle r={r * 4} fill="url(#core)" opacity={0.35} />
						<circle r={r} fill="url(#core)" />
					</>
				)}
				<Shockwave t={f - B} maxR={1150} />
				<Burst t={f - B} count={120} seed="spark" speed={[12, 48]} life={36} />
			</CenterSvg>
		</AbsoluteFill>
	);
};
