import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background, Grain, Vignette} from './Fx';
import {C, FONT, T, beatPulse, clamp, shake} from './lib';
import {Bounce} from './scenes/Bounce';
import {Finale} from './scenes/Finale';
import {Logo} from './scenes/Logo';
import {Skills} from './scenes/Skills';
import {Spark} from './scenes/Spark';

const flash = (frame: number, at: number, peak: number) =>
	frame >= at ? interpolate(frame, [at, at + 6], [peak, 0], {...clamp, easing: Easing.out(Easing.quad)}) : 0;

export const Showreel: React.FC = () => {
	const frame = useCurrentFrame();
	const {x, y} = shake(frame);
	const zoom = 1 + 0.008 * beatPulse(frame);

	return (
		<AbsoluteFill style={{backgroundColor: C.bg, fontFamily: FONT}}>
			<Audio src={staticFile('soundtrack.wav')} />
			<AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${zoom})`}}>
				<Background />
				<Sequence name="Chispa" from={0} durationInFrames={75}>
					<Spark />
				</Sequence>
				<Sequence name="Logo" from={T.logoIn} durationInFrames={T.skillsIn + 8 - T.logoIn}>
					<Logo />
				</Sequence>
				<Sequence name="Habilidades" from={T.skillsIn} durationInFrames={T.bounceIn + 7 - T.skillsIn}>
					<Skills />
				</Sequence>
				<Sequence name="Rebote" from={T.bounceIn} durationInFrames={T.ballToCenter + 2 - T.bounceIn}>
					<Bounce />
				</Sequence>
				<Sequence name="Final" from={T.finaleIn}>
					<Finale />
				</Sequence>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#FFF4EA', opacity: Math.max(flash(frame, T.burst, 0.5), flash(frame, T.pop, 0.55)), pointerEvents: 'none'}} />
			<Vignette />
			<Grain />
			<AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [T.end - 6, T.end - 1], [0, 1], clamp)}} />
		</AbsoluteFill>
	);
};
