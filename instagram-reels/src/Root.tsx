import React from 'react';
import {Composition, Still} from 'remotion';
import {Inscripciones} from './Inscripciones';
import {T} from './lib';
import {Portada} from './Portada';
import {SaludAdolescencia} from './salud/Salud';
import TS from './salud/timeline.json';

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
		<Composition
			id="SaludAdolescencia"
			component={SaludAdolescencia}
			durationInFrames={TS.durationInFrames}
			fps={TS.fps}
			width={TS.width}
			height={TS.height}
		/>
		<Still id="Portada2027" component={Portada} width={T.width} height={T.height} />
	</>
);
