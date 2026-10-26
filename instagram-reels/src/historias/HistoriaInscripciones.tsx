import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS, SHADOW} from '../lib';

/**
 * Historia 1080×1920: inscripciones 2027 siguen abiertas.
 * Abajo queda libre (y 1640–1800) para el sticker de enlace a Admisiones.
 */

const Foto: React.FC<{src: string; pos?: string; style: React.CSSProperties}> = ({src, pos = '50% 50%', style}) => (
	<div style={{position: 'absolute', borderRadius: 28, overflow: 'hidden', boxShadow: SHADOW, ...style}}>
		<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
	</div>
);

const Chip: React.FC<{text: string; bg: string; ink: string; style: React.CSSProperties}> = ({text, bg, ink, style}) => (
	<div style={{position: 'absolute', padding: '10px 26px 12px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, ...style}}>
		{text}
	</div>
);

export const HistoriaInscripciones: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<div style={{position: 'absolute', top: 260, left: 72, display: 'flex', alignItems: 'center', gap: 16}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 76}} />
			<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.azul}}>Álvarez Condarco</div>
		</div>

		<div style={{position: 'absolute', top: 400, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 20}}>
			<div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>INSCRIPCIONES 2027 ABIERTAS</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.azul}}>
				¿Ya sabés dónde va a estar tu hijo en <span style={{color: C.bordo}}>2027</span>?
			</h1>
		</div>

		<Foto src="img/edificio/fachada.jpg" pos="50% 60%" style={{left: 72, top: 820, width: 936, height: 430}} />
		<Foto src="img/edificio/patio-verde.jpg" pos="50% 70%" style={{left: 72, top: 1272, width: 457, height: 260}} />
		<Foto src="img/edificio/sum.jpg" pos="40% 60%" style={{left: 551, top: 1272, width: 457, height: 260}} />
		<Chip text="Jardín" bg={C.sol} ink={C.tinta} style={{left: 100, top: 1196, transform: 'rotate(-4deg)'}} />
		<Chip text="Primaria" bg={C.celeste} ink={C.papel} style={{left: 300, top: 1200, transform: 'rotate(2deg)'}} />
		<Chip text="Secundaria" bg={C.bordo} ink={C.papel} style={{left: 540, top: 1194, transform: 'rotate(-3deg)'}} />

		<div style={{position: 'absolute', top: 1566, left: 72, right: 72, fontSize: 40, lineHeight: 1.35, color: C.tintaSuave}}>
			<b style={{color: C.tinta}}>Todavía estás a tiempo.</b> Pedí tu entrevista en Admisiones.
		</div>

		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
