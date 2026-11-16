import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Dos historias 1080×1920 que resumen la Muestra 2026 de Primaria.
 * Libres las zonas de la interfaz: arriba ~220 px y abajo ~300 px (para stickers).
 */

export const Foto: React.FC<{src: string; pos?: string; style: React.CSSProperties; rot?: number}> = ({src, pos = '50% 50%', style, rot = 0}) => (
	<div style={{position: 'absolute', padding: 14, background: C.papel, borderRadius: 30, boxShadow: '0 18px 44px rgba(19,32,90,0.22)', transform: `rotate(${rot}deg)`, ...style}}>
		<div style={{width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden'}}>
			<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
		</div>
	</div>
);

export const Encabezado: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', top: 230, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 10}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 58}} />
			<div style={{fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>PRIMARIA · MUESTRA 2026</div>
		</div>
		<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.azul}}>{children}</h1>
	</div>
);

export const Chip: React.FC<{text: string; bg: string; ink: string; style: React.CSSProperties}> = ({text, bg, ink, style}) => (
	<div style={{position: 'absolute', padding: '10px 28px 14px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, boxShadow: '0 10px 24px rgba(19,32,90,0.25)', whiteSpace: 'nowrap', ...style}}>
		{text}
	</div>
);

export const Tricolor: React.FC = () => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
		{[C.sol, C.celeste, C.bordo].map((c) => (
			<div key={c} style={{flex: 1, background: c}} />
		))}
	</div>
);

/** 1 · Qué fue la Muestra. */
export const HistoriaMuestra: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<Encabezado>
			¡Muestra <span style={{color: C.celeste}}>2026</span>!
		</Encabezado>
		<Foto src="img/muestra/arbol.jpg" pos="50% 72%" rot={-1.5} style={{left: 50, right: 50, top: 470, height: 620}} />
		<Chip text="En el campo de deportes" bg={C.celeste} ink={C.papel} style={{left: 80, top: 440, transform: 'rotate(-4deg)'}} />
		<Foto src="img/muestra/mesas.jpg" pos="50% 62%" rot={-2} style={{left: 50, width: 470, top: 1120, height: 470}} />
		<Foto src="img/muestra/collage.jpg" pos="50% 45%" rot={2} style={{right: 50, width: 470, top: 1120, height: 470}} />
		<Chip text="¡A crear!" bg={C.sol} ink={C.tinta} style={{left: 90, top: 1540, transform: 'rotate(-3deg)'}} />
		<Tricolor />
	</AbsoluteFill>
);

/** 2 · Juegos, música, familias y llamado al posteo. */
export const HistoriaMuestra2: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<Encabezado>
			¡Gracias, <span style={{color: C.celeste}}>familias</span>!
		</Encabezado>
		<Foto src="img/muestra/campo.jpg" pos="50% 55%" rot={1.5} style={{left: 50, right: 50, top: 470, height: 520}} />
		<Chip text="Juegos y desafíos" bg={C.bordo} ink={C.papel} style={{right: 80, top: 440, transform: 'rotate(3deg)'}} />
		<Foto src="img/muestra/teclado.jpg" pos="50% 55%" rot={-2} style={{left: 50, width: 470, top: 1020, height: 560}} />
		<Foto src="img/muestra/ronda-familias.jpg" pos="50% 45%" rot={2} style={{right: 50, width: 470, top: 1020, height: 560}} />
		<Chip text="¡A puro ritmo!" bg={C.sol} ink={C.tinta} style={{left: 90, top: 1530, transform: 'rotate(-3deg)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 1650, display: 'flex', justifyContent: 'center'}}>
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
