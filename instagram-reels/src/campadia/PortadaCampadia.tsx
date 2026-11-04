import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Carpa} from './Campadia';

/** Portada del reel. Todo el contenido queda dentro del recorte 3:4 del perfil (y 240–1680). */
export const PortadaCampadia: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Img src={staticFile('img/campadia/ronda-fuego.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '8% 70%', transform: 'scale(1.0)'}} />
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,20,64,0.9) 0%, rgba(11,20,64,0.55) 36%, rgba(11,20,64,0) 55%, rgba(11,20,64,0) 72%, rgba(11,20,64,0.7) 100%)'}} />
		<div style={{position: 'absolute', top: 290, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 18}}>
			<div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>JARDÍN · SALA DE 5</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 176, lineHeight: 0.95, letterSpacing: '-0.02em', color: C.papel}}>
				¡Campa<span style={{color: C.sol}}>día</span>!
			</h1>
		</div>
		<div style={{position: 'absolute', right: 40, top: 560, transform: 'rotate(6deg)'}}>
			<Carpa p={1} size={300} />
		</div>
		<div style={{position: 'absolute', top: 1490, left: 64, padding: '14px 32px 16px', borderRadius: 999, background: C.bordo, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, boxShadow: '0 10px 30px rgba(11,20,64,0.4)'}}>
			Ositos y sus familias
		</div>
	</AbsoluteFill>
);
