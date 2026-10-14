import React from 'react';
import {Composition, Still} from 'remotion';
import {Inscripciones} from './Inscripciones';
import {T} from './lib';
import {Portada} from './Portada';
import {SaludAdolescencia} from './salud/Salud';
import TS from './salud/timeline.json';
import {PortadaSalud} from './salud/PortadaSalud';
import {HistoriaEncuesta, HistoriaPreguntas} from './historias/Historias';
import {NombreCondarco} from './condarco/Condarco';
import TC from './condarco/timeline.json';
import {PortadaCondarco} from './condarco/PortadaCondarco';

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
		<Composition
			id="NombreCondarco"
			component={NombreCondarco}
			durationInFrames={TC.durationInFrames}
			fps={TC.fps}
			width={TC.width}
			height={TC.height}
		/>
		<Still id="Portada2027" component={Portada} width={T.width} height={T.height} />
		<Still id="PortadaSalud" component={PortadaSalud} width={TS.width} height={TS.height} />
		<Still id="HistoriaPreguntas" component={HistoriaPreguntas} width={1080} height={1920} />
		<Composition id="PortadaCondarco" component={PortadaCondarco} durationInFrames={TC.durationInFrames} fps={TC.fps} width={1080} height={1920} />
		<Still id="HistoriaEncuesta" component={HistoriaEncuesta} width={1080} height={1920} />
	</>
);
