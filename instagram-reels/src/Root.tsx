import React from 'react';
import {Composition} from 'remotion';
import {Inscripciones} from './Inscripciones';
import {T} from './lib';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="Inscripciones2027"
		component={Inscripciones}
		durationInFrames={T.durationInFrames}
		fps={T.fps}
		width={T.width}
		height={T.height}
	/>
);
