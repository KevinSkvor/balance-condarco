import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, SANS, T} from './lib';
import {Cierre} from './scenes/Cierre';
import {Facil} from './scenes/Facil';
import {Hook} from './scenes/Hook';
import {Niveles} from './scenes/Niveles';
import {Pasos} from './scenes/Pasos';
import {Tricolor} from './ui';

/** Monta una escena sólo dentro de su rango; las escenas usan frames globales del timeline. */
const Scene: React.FC<{range: number[]; children: React.ReactNode}> = ({range, children}) => {
	const f = useCurrentFrame();
	return f >= range[0] && f < range[1] ? <>{children}</> : null;
};

export const Inscripciones: React.FC = () => {
	const S = T.scenes;
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
			<Audio src={staticFile('soundtrack.wav')} />
			<Scene range={S.hook}>
				<Hook />
			</Scene>
			<Scene range={S.niveles}>
				<Niveles />
			</Scene>
			<Scene range={S.pasos}>
				<Pasos />
			</Scene>
			<Scene range={[S.facil[0] - 10, S.facil[1]]}>
				<Facil />
			</Scene>
			<Scene range={S.cierre}>
				<Cierre />
			</Scene>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
				<Tricolor at={8} height={20} />
			</div>
		</AbsoluteFill>
	);
};
