import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SANS} from '../lib';
import {Chip, Encabezado, Foto, Tricolor} from './HistoriaMuestra';

/** Historias 1080×1920 con la segunda tanda de fotos de la Muestra 2026 (sin repetir el carrusel). */

/** 3 · Música y familias: tres fotos apaisadas apiladas, a todo el ancho. */
export const HistoriaMuestra3: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<Encabezado>
			¡A puro <span style={{color: C.celeste}}>ritmo</span>!
		</Encabezado>
		<Foto src="img/muestra/banda-ronda.jpg" pos="55% 50%" rot={-1.2} style={{left: 40, right: 40, top: 470, height: 400}} />
		<Foto src="img/muestra/guitarra.jpg" pos="50% 50%" rot={1.2} style={{left: 40, right: 40, top: 900, height: 400}} />
		<Foto src="img/muestra/mantas.jpg" pos="45% 60%" rot={-1} style={{left: 40, right: 40, top: 1330, height: 380}} />
		<Chip text="Música en ronda" bg={C.sol} ink={C.tinta} style={{left: 70, top: 440, transform: 'rotate(-3deg)'}} />
		<Chip text="En familia" bg={C.bordo} ink={C.papel} style={{right: 70, top: 1300, transform: 'rotate(3deg)'}} />
		<Tricolor />
	</AbsoluteFill>
);

/** 4 · Juegos con las familias + llamado al posteo. */
export const HistoriaMuestra4: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<Encabezado>
			¡A jugar <span style={{color: C.celeste}}>todos</span>!
		</Encabezado>
		<Foto src="img/muestra/corren-familias.jpg" pos="50% 60%" rot={1.2} style={{left: 40, right: 40, top: 470, height: 620}} />
		<Chip text="¡Chicos y familias!" bg={C.celeste} ink={C.papel} style={{left: 70, top: 440, transform: 'rotate(-3deg)'}} />
		<Foto src="img/muestra/circuito2.jpg" pos="35% 60%" rot={-2} style={{left: 40, width: 490, top: 1120, height: 500}} />
		<Foto src="img/muestra/sol.jpg" pos="50% 55%" rot={2} style={{right: 40, width: 490, top: 1120, height: 500}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 1660, display: 'flex', justifyContent: 'center'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 34px 16px', borderRadius: 999, background: C.azul, color: C.papel, fontFamily: SANS, fontWeight: 700, fontSize: 34}}>
				Mirá todas las fotos en nuestro perfil
				<svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={C.papel} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
					<path d="M5 12h14M13 6l6 6-6 6" />
				</svg>
			</div>
		</div>
		<Tricolor />
	</AbsoluteFill>
);
