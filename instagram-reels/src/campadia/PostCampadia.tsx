import React from 'react';
import {C, DISPLAY, SANS} from '../lib';
import {Check} from '../ui';
import {Burbuja, Foto, Marco} from '../granja/PostGranja';

/**
 * Carrusel de feed 3:4 (1080×1440): Campadía de Sala de 5 (Ositos), turno mañana y tarde,
 * con las familias. Fotos sin caras reconocibles; el nombre de una remera está desenfocado.
 */

const VOLANTA = 'JARDÍN · SALA DE 5';

/** 1 · Portada. */
export const PostCampadia: React.FC = () => (
	<Marco desliza volanta={VOLANTA} titulo={<>¡Campa<span style={{color: C.bordo}}>día</span>!</>}>
		<Foto src="img/campadia/ronda-fuego.jpg" pos="50% 70%" style={{left: 56, top: 290, width: 968, height: 680}} />
		<Burbuja text="¡Una tarde de campamento!" color={C.sol} ink={C.tinta} style={{left: 84, top: 318, fontSize: 44}} />
		<Foto src="img/campadia/fogon-cerca.jpg" pos="50% 38%" style={{left: 56, top: 992, width: 474, height: 324}} />
		<div style={{position: 'absolute', left: 556, right: 56, top: 1000, display: 'flex', flexDirection: 'column', gap: 14}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.05, color: C.azul}}>
				Ositos y sus <span style={{color: C.bordo}}>familias</span>
			</div>
			<div style={{fontFamily: SANS, fontSize: 32, lineHeight: 1.35, color: C.tintaSuave}}>Turno mañana y turno tarde compartieron toda una tarde al aire libre.</div>
		</div>
	</Marco>
);

const LISTA = ['8 hojas diferentes', '5 piedras', '10 flores', '1 hormiga en un palito', '2 piñas', '20 palitos'];

/** 2 · La búsqueda del tesoro en la naturaleza. */
export const PostCampadia2: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>Misión: <span style={{color: C.bordo}}>explorar</span></>}>
		<Foto src="img/campadia/lista.jpg" pos="50% 45%" style={{left: 56, top: 290, width: 968, height: 640}} />
		<Burbuja text="¡Encontramos una piña!" color={C.celeste} ink={C.papel} style={{left: 440, top: 316, fontSize: 40, whiteSpace: 'nowrap'}} />
		<div style={{position: 'absolute', left: 76, right: 76, top: 900, padding: '30px 40px 34px', background: C.papel, borderRadius: 24, boxShadow: '0 18px 40px rgba(19,32,90,0.18)', transform: 'rotate(-1.5deg)'}}>
			<div style={{fontFamily: SANS, fontSize: 26, fontWeight: 700, letterSpacing: '0.12em', color: C.bordo, marginBottom: 16}}>NUESTRA LISTA</div>
			<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 24}}>
				{LISTA.map((t) => (
					<div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 32, fontWeight: 600, color: C.tinta}}>
						<div style={{width: 42, height: 42, borderRadius: 12, background: C.sol, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Check size={32} color={C.tinta} />
						</div>
						{t}
					</div>
				))}
			</div>
		</div>
	</Marco>
);

/** 3 · Juegos al aire libre. */
export const PostCampadia3: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡A correr y <span style={{color: C.bordo}}>jugar</span>!</>}>
		<Foto src="img/campadia/corren.jpg" pos="50% 60%" style={{left: 56, top: 290, width: 474, height: 1026}} />
		<Foto src="img/campadia/aros.jpg" pos="45% 62%" style={{left: 550, top: 290, width: 474, height: 500}} />
		<Foto src="img/campadia/pared.jpg" pos="50% 55%" style={{left: 550, top: 816, width: 474, height: 500}} />
		<Burbuja text="¡Vamos!" color={C.sol} ink={C.tinta} style={{left: 80, top: 320}} />
		<Burbuja text="¡Aros!" color={C.bordo} ink={C.papel} style={{left: 800, top: 316}} />
	</Marco>
);

/** 4 · La ronda con las familias alrededor del fuego. */
export const PostCampadia4: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>En ronda, con las <span style={{color: C.bordo}}>familias</span></>}>
		<Foto src="img/campadia/ronda.jpg" pos="50% 62%" style={{left: 56, top: 290, width: 968, height: 560}} />
		<Foto src="img/campadia/gorra.jpg" pos="50% 40%" style={{left: 56, top: 876, width: 474, height: 440}} />
		<div style={{position: 'absolute', left: 556, right: 56, top: 900, display: 'flex', flexDirection: 'column', gap: 18}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, lineHeight: 1.08, color: C.azul}}>
				Alrededor del <span style={{color: C.bordo}}>fuego</span>, todos juntos
			</div>
			<div style={{fontFamily: SANS, fontSize: 32, lineHeight: 1.35, color: C.tintaSuave}}>Chicos, familias y seños compartiendo la ronda del atardecer.</div>
		</div>
	</Marco>
);

/** Carpa, fogón y pinos dibujados, para el cierre. */
const Campamento: React.FC = () => (
	<svg width={900} height={640} viewBox="0 0 900 640">
		{/* pinos */}
		{[
			[110, 300, 1],
			[770, 280, 1.15],
			[200, 360, 0.75],
			[690, 360, 0.8],
		].map(([x, y, s], i) => (
			<g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
				<rect x={-12} y={150} width={24} height={60} rx={6} fill={C.tinta} opacity={0.7} />
				<path d="M0 -140 L95 40 L50 40 L115 160 L-115 160 L-50 40 L-95 40 Z" fill={C.azul} />
			</g>
		))}
		<rect x={40} y={560} width={820} height={18} rx={9} fill={C.dorado} opacity={0.5} />
		{/* carpa */}
		<g transform="translate(330 560)">
			<path d="M-190 0 L0 -300 L190 0 Z" fill={C.bordo} />
			<path d="M0 -300 L-60 0 L60 0 Z" fill={C.noche} opacity={0.85} />
			<path d="M0 -300 L-60 0" stroke={C.sol} strokeWidth={8} />
			<path d="M-210 0 L210 0" stroke={C.tinta} strokeWidth={10} strokeLinecap="round" />
		</g>
		{/* fogón */}
		<g transform="translate(640 560)">
			<path d="M-70 -6 L70 -30 M-70 -30 L70 -6" stroke="#7a4a2a" strokeWidth={20} strokeLinecap="round" />
			<path d="M0 -190 C 50 -120, 70 -80, 40 -30 C 30 -60, 15 -70, 10 -90 C -10 -60, -40 -60, -40 -30 C -70 -80, -40 -130, 0 -190 Z" fill={C.sol} />
			<path d="M4 -120 C 30 -80, 30 -50, 12 -34 C 4 -50, -4 -54, -8 -66 C -18 -50, -24 -44, -22 -34 C -36 -60, -20 -90, 4 -120 Z" fill={C.bordo} />
			{[
				[-60, -220],
				[40, -250],
				[80, -200],
			].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={7} fill={C.sol} opacity={0.8} />
			))}
		</g>
	</svg>
);

/** 5 · Cierre ilustrado. */
export const PostCampadia5: React.FC = () => (
	<Marco volanta={VOLANTA} titulo={<>¡Gracias, <span style={{color: C.bordo}}>familias</span>!</>}>
		<div style={{position: 'absolute', left: 540 - 400, top: 330, width: 800, height: 800, borderRadius: '50%', background: C.doradoClaro}} />
		<div style={{position: 'absolute', top: 400, width: '100%', display: 'flex', justifyContent: 'center'}}>
			<Campamento />
		</div>
		<Burbuja text="¡Qué lindo día!" color={C.celeste} ink={C.papel} style={{left: 560, top: 360, whiteSpace: 'nowrap'}} />
		<div style={{position: 'absolute', top: 1120, left: 56, right: 56, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: C.azul}}>
			Una tarde para guardar en el corazón
		</div>
	</Marco>
);
