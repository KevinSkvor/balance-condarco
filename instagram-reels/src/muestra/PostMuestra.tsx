import React from 'react';
import {C, DISPLAY, SANS} from '../lib';
import {Burbuja, Foto, Marco} from '../granja/PostGranja';

/**
 * Carrusel de feed 3:4 (1080×1440): Muestra 2026 del Nivel Primario,
 * en el campo de deportes del colegio, con las familias.
 */

const VOLANTA = 'PRIMARIA · MUESTRA 2026';

const Texto: React.FC<{titulo: React.ReactNode; bajada: string; style: React.CSSProperties}> = ({titulo, bajada, style}) => (
	<div style={{position: 'absolute', display: 'flex', flexDirection: 'column', gap: 14, ...style}}>
		<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, lineHeight: 1.06, color: C.azul}}>{titulo}</div>
		<div style={{fontFamily: SANS, fontSize: 31, lineHeight: 1.35, color: C.tintaSuave}}>{bajada}</div>
	</div>
);

/** 1 · Portada. */
export const PostMuestra: React.FC = () => (
	<Marco desliza volanta={VOLANTA} titulo={<>Muestra <span style={{color: C.celeste}}>2026</span></>}>
		<Foto src="img/muestra/arbol.jpg" pos="50% 70%" style={{left: 56, top: 290, width: 968, height: 720}} />
		<Burbuja text="¡Nivel Primario!" color={C.celeste} ink={C.papel} style={{left: 84, top: 318}} />
		<Texto
			titulo={<>Un día para compartir lo que <span style={{color: C.bordo}}>aprendimos</span></>}
			bajada="En nuestro campo de deportes, junto a las familias."
			style={{left: 56, right: 56, top: 1050}}
		/>
	</Marco>
);

/** 2 · Arte en equipo. */
export const PostMuestra2: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Manos a la <span style={{color: C.celeste}}>obra</span></>}>
		<Foto src="img/muestra/mesas.jpg" pos="50% 60%" style={{left: 56, top: 290, width: 474, height: 1026}} />
		<Foto src="img/muestra/collage.jpg" pos="50% 45%" style={{left: 550, top: 290, width: 474, height: 1026}} />
		<Burbuja text="¡A crear!" color={C.sol} ink={C.tinta} style={{left: 80, top: 320}} />
	</Marco>
);

/** 3 · Juegos y desafíos. */
export const PostMuestra3: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Juegos y <span style={{color: C.celeste}}>desafíos</span></>}>
		<Foto src="img/muestra/campo.jpg" pos="50% 55%" style={{left: 56, top: 290, width: 968, height: 520}} />
		<Foto src="img/muestra/banderines.jpg" pos="50% 55%" style={{left: 56, top: 836, width: 474, height: 480}} />
		<Foto src="img/muestra/circuito.jpg" pos="40% 60%" style={{left: 550, top: 836, width: 474, height: 480}} />
		<Burbuja text="¡Preparados, listos…!" color={C.bordo} ink={C.papel} style={{left: 80, top: 318}} />
	</Marco>
);

/** 4 · Con las familias. */
export const PostMuestra4: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Con las <span style={{color: C.celeste}}>familias</span></>}>
		<Foto src="img/muestra/ronda-familias.jpg" pos="50% 45%" style={{left: 56, top: 290, width: 560, height: 1026}} />
		<Foto src="img/muestra/seno.jpg" pos="50% 40%" style={{left: 636, top: 290, width: 388, height: 560}} />
		<Texto
			titulo={<>Aprender <span style={{color: C.bordo}}>juntos</span></>}
			bajada="Chicos, familias y docentes compartiendo cada propuesta."
			style={{left: 640, right: 50, top: 880}}
		/>
	</Marco>
);

/** 5 · Música y cierre. */
export const PostMuestra5: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡Gracias, <span style={{color: C.celeste}}>familias</span>!</>}>
		<Foto src="img/muestra/teclado.jpg" pos="50% 55%" style={{left: 56, top: 290, width: 560, height: 1026}} />
		<Foto src="img/muestra/encuentro.jpg" pos="50% 40%" style={{left: 636, top: 290, width: 388, height: 560}} />
		<Burbuja text="¡A puro ritmo!" color={C.sol} ink={C.tinta} style={{left: 80, top: 320}} />
		<Texto
			titulo={<>¡Qué lindo <span style={{color: C.bordo}}>día</span>!</>}
			bajada="Gracias por acompañarnos en la Muestra 2026."
			style={{left: 640, right: 50, top: 880}}
		/>
	</Marco>
);
