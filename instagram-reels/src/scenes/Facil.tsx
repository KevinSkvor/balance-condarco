import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, T, clamp} from '../lib';
import {Titulo, Volanta} from '../ui';

/** 10–13 s · "Inscribirte es muy fácil." Banda azul-noche que sube y se va. */
export const Facil: React.FC = () => {
	const f = useCurrentFrame();
	const [start, end] = T.scenes.facil;
	const inP = interpolate(f, [start - 8, start + 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const outP = interpolate(f, [end - 14, end], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const filete = interpolate(f, [T.vo[2].at + 40, T.vo[2].at + 54], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

	return (
		<AbsoluteFill style={{background: C.noche, clipPath: `inset(${(1 - inP) * 100}% 0 ${outP * 100}% 0)`}}>
			<div style={{position: 'absolute', top: 700, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 30}}>
				<Volanta at={start + 4} color={C.doradoClaro} size={34}>
					CÓMO INSCRIBIRTE
				</Volanta>
				<div style={{position: 'relative'}}>
					<Titulo at={T.vo[2].at - 2} parts={['Inscribirte es muy ', 'fácil']} size={150} color={C.papel} accent={C.doradoClaro} stagger={13} />
					<svg width={330} height={40} style={{position: 'absolute', left: 332, bottom: -30}} viewBox="0 0 420 40" preserveAspectRatio="none">
						<path
							d="M6 26 C 120 8, 260 8, 414 22"
							fill="none"
							stroke={C.dorado}
							strokeWidth={9}
							strokeLinecap="round"
							pathLength={1}
							strokeDasharray={1}
							strokeDashoffset={1 - filete}
						/>
					</svg>
				</div>
				<div style={{display: 'flex', gap: 18, marginTop: 70}}>
					{[1, 2, 3].map((n, i) => {
						const s = interpolate(f, [T.vo[2].at + 50 + i * 5, T.vo[2].at + 62 + i * 5], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
						return (
							<div
								key={n}
								style={{
									width: 84,
									height: 84,
									borderRadius: 99,
									border: `3px solid ${C.dorado}`,
									color: C.doradoClaro,
									fontSize: 40,
									fontWeight: 700,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									transform: `scale(${s})`,
								}}
							>
								{n}
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};
