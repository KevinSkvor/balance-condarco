import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Grano, Mapa, PAPEL_VIEJO} from './Condarco';

/**
 * Portada del reel "¿Por qué nos llamamos Álvarez Condarco?" (1080×1920).
 * Usa el mapa del video tal como queda cuando la pluma termina de dibujarlo:
 * se renderiza como composición en el frame MAPA_TERMINADO (ver Root y package.json).
 * Lo importante queda dentro del recorte 3:4 de la grilla (y 240–1680).
 */
export const MAPA_TERMINADO = 1300;

export const PortadaCondarco: React.FC = () => (
	<AbsoluteFill style={{background: PAPEL_VIEJO, fontFamily: SANS}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,84,40,0.2) 100%)'}} />

		<div style={{position: 'absolute', top: 280, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 6}}>
			<div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo, marginBottom: 14}}>NUESTRA HISTORIA</div>
			<div style={{fontSize: 52, fontWeight: 600, color: C.tintaSuave}}>¿Por qué nos llamamos</div>
			<div style={{fontFamily: DISPLAY, fontSize: 104, fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.azul, whiteSpace: 'nowrap'}}>
				Álvarez <span style={{color: C.bordo}}>Condarco</span>?
			</div>
		</div>

		{/* el mapa del reel, reducido */}
		<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: 'translate(0px, 360px) scale(0.74)', transformOrigin: '540px 262px'}}>
			<Mapa />
		</div>

		{/* medallón con el retrato */}
		<div style={{position: 'absolute', top: 600, right: 80, width: 210, height: 210, borderRadius: '50%', border: `10px solid ${C.dorado}`, overflow: 'hidden', boxShadow: '0 16px 40px rgba(19,32,90,0.25)', background: C.papel}}>
			<Img src={staticFile('img/condarco/retrato.jpg')} style={{width: '100%', height: '120%', objectFit: 'cover', objectPosition: '35% 20%', filter: 'sepia(0.35)'}} />
		</div>

		<div style={{position: 'absolute', top: 1590, left: 72, display: 'flex', alignItems: 'center', gap: 16}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 70}} />
			<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
		</div>

		<Grano />
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
