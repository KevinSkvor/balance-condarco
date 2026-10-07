import React from 'react';
import {Composition, Still} from 'remotion';
import {Inscripciones} from './Inscripciones';
import {T} from './lib';
import {Portada} from './Portada';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="Inscripciones2027"
			component={Inscripciones}
			durationInFrames={T.durationInFrames}
			fps={T.fps}
			width={T.width}
			height={T.height}
		/>
		<Still id="Portada2027" component={Portada} width={T.width} height={T.height} />
	</>
);
