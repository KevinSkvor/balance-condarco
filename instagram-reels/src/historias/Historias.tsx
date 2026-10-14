import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Signo} from '../salud/Salud';

/**
 * Historias de 1080×1920 con un hueco para pegar el sticker de Instagram
 * (caja de preguntas o encuesta). Zonas libres de la interfaz: arriba ~250 px, abajo ~340 px.
 */

const Marca: React.FC = () => (
	<div style={{position: 'absolute', top: 260, left: 72, display: 'flex', alignItems: 'center', gap: 16}}>
		<Img src={staticFile('img/escudo.png')} style={{height: 76}} />
		<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.azul}}>Álvarez Condarco</div>
	</div>
);

const Tricolor: React.FC = () => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
		{[C.sol, C.celeste, C.bordo].map((c) => (
			<div key={c} style={{flex: 1, background: c}} />
		))}
	</div>
);

/** Panel donde se apoya el sticker, con una indicación debajo. */
const Hueco: React.FC<{top: number; height: number; hint: string}> = ({top, height, hint}) => (
	<>
		<div style={{position: 'absolute', top, left: 72, right: 72, height, borderRadius: 28, background: C.doradoClaro}} />
		<div style={{position: 'absolute', top: top + height + 28, width: '100%', display: 'flex', justifyContent: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 32, fontWeight: 600, color: C.tintaSuave}}>
				<svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.bordo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
					<path d="M12 19V5M6 11l6-6 6 6" />
				</svg>
				{hint}
			</div>
		</div>
	</>
);

const titulo: React.CSSProperties = {margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.azul};
const volanta: React.CSSProperties = {fontFamily: SANS, fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo};
const bajada: React.CSSProperties = {fontFamily: SANS, fontSize: 40, lineHeight: 1.4, color: C.tintaSuave};

/** Historia 1 · Caja de preguntas. */
export const HistoriaPreguntas: React.FC = () => (
	<AbsoluteFill style={{background: C.crema}}>
		<Marca />
		<Signo x={940} y={960} size={100} color={C.sol} at={-100} seed={2} />
		<Signo x={830} y={990} size={60} color={C.celeste} at={-100} seed={1} />
		<div style={{position: 'absolute', top: 420, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 22}}>
			<div style={volanta}>QUEREMOS ESCUCHARTE</div>
			<h1 style={titulo}>
				¿Qué te gustaría
				<br />
				que <span style={{color: C.bordo}}>contemos</span>?
			</h1>
			<div style={bajada}>Proyectos, niveles, actividades, nuestra historia… Contanos qué temas te interesan.</div>
		</div>
		<Hueco top={1080} height={330} hint="Escribinos acá" />
		<Tricolor />
	</AbsoluteFill>
);

/** Historia 2 · Encuesta. */
export const HistoriaEncuesta: React.FC = () => (
	<AbsoluteFill style={{background: C.crema}}>
		<Marca />
		<Signo x={950} y={470} size={100} color={C.bordo} at={-100} seed={4} />
		<div style={{position: 'absolute', top: 420, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 22}}>
			<div style={volanta}>ENCUESTA</div>
			<h1 style={{...titulo, fontSize: 98, whiteSpace: 'nowrap'}}>
				¿Sobre qué
				<br />
				querés <span style={{color: C.bordo}}>saber más</span>?
			</h1>
			<div style={bajada}>Elegí una opción.</div>
		</div>
		<Hueco top={860} height={560} hint="Votá acá" />
		<Tricolor />
	</AbsoluteFill>
);
