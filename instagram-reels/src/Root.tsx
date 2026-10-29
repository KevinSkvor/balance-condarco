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
import {GranjaSala3} from './granja/Granja';
import TG from './granja/timeline.json';
import {PostGranja, PostGranja2, PostGranja3, PostGranja4} from './granja/PostGranja';
import {Simulacro} from './simulacro/Simulacro';
import TSim from './simulacro/timeline.json';
import {AvisoSpam} from './historias/AvisoSpam';
import {RecorridoCole} from './recorrido/Recorrido';
import TR from './recorrido/timeline.json';
import {PortadaRecorrido} from './recorrido/PortadaRecorrido';
import {ViajeAtlantis} from './viaje/Viaje';
import TV from './viaje/timeline.json';
import {PortadaViaje} from './viaje/PortadaViaje';
import {PostOsitos, PostOsitos2, PostOsitos3} from './ositos/PostOsitos';
import {MuseoCiencias} from './museo/Museo';
import TM from './museo/timeline.json';
import {PortadaMuseo} from './museo/PortadaMuseo';
import {HistoriaMuseo} from './museo/HistoriaMuseo';
import {HistoriaInscripciones} from './historias/HistoriaInscripciones';

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
		<Composition id="GranjaSala3" component={GranjaSala3} durationInFrames={TG.durationInFrames} fps={TG.fps} width={TG.width} height={TG.height} />
		<Composition id="Simulacro" component={Simulacro} durationInFrames={TSim.durationInFrames} fps={TSim.fps} width={TSim.width} height={TSim.height} />
		<Composition id="RecorridoCole" component={RecorridoCole} durationInFrames={TR.durationInFrames} fps={TR.fps} width={TR.width} height={TR.height} />
		<Still id="PortadaRecorrido" component={PortadaRecorrido} width={1080} height={1920} />
		<Composition id="ViajeAtlantis" component={ViajeAtlantis} durationInFrames={TV.durationInFrames} fps={TV.fps} width={TV.width} height={TV.height} />
		<Still id="PortadaViaje" component={PortadaViaje} width={1080} height={1920} />
		<Still id="PostOsitos" component={PostOsitos} width={1080} height={1440} />
		<Still id="PostOsitos2" component={PostOsitos2} width={1080} height={1440} />
		<Still id="PostOsitos3" component={PostOsitos3} width={1080} height={1440} />
		<Composition id="MuseoCiencias" component={MuseoCiencias} durationInFrames={TM.durationInFrames} fps={TM.fps} width={TM.width} height={TM.height} />
		<Still id="PortadaMuseo" component={PortadaMuseo} width={1080} height={1920} />
		<Still id="HistoriaMuseo" component={HistoriaMuseo} width={1080} height={1920} />
		<Still id="PostGranja" component={PostGranja} width={1080} height={1440} />
		<Still id="PostGranja2" component={PostGranja2} width={1080} height={1440} />
		<Still id="PostGranja3" component={PostGranja3} width={1080} height={1440} />
		<Still id="PostGranja4" component={PostGranja4} width={1080} height={1440} />
		<Still id="Portada2027" component={Portada} width={T.width} height={T.height} />
		<Still id="PortadaSalud" component={PortadaSalud} width={TS.width} height={TS.height} />
		<Still id="HistoriaPreguntas" component={HistoriaPreguntas} width={1080} height={1920} />
		<Composition id="PortadaCondarco" component={PortadaCondarco} durationInFrames={TC.durationInFrames} fps={TC.fps} width={1080} height={1920} />
		<Still id="HistoriaInscripciones" component={HistoriaInscripciones} width={1080} height={1920} />
		<Still id="AvisoSpam" component={AvisoSpam} width={1080} height={1920} />
		<Still id="HistoriaEncuesta" component={HistoriaEncuesta} width={1080} height={1920} />
	</>
);
