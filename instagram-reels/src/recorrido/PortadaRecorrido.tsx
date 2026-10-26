import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/** Portada del reel. Todo el contenido queda dentro del recorte 3:4 del perfil (y 240–1680). */
export const PortadaRecorrido: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Img src={staticFile('img/edificio/fachada.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '70% 55%', transform: 'scale(1.12)'}} />
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,20,64,0.88) 0%, rgba(11,20,64,0.6) 40%, rgba(11,20,64,0) 62%)'}} />
		<div style={{position: 'absolute', top: 300, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 22}}>
			<div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>INSCRIPCIONES 2027</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 132, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.papel}}>
				Te mostramos el cole <span style={{color: C.sol}}>por dentro</span>
			</h1>
		</div>
		<div style={{position: 'absolute', top: 1480, left: 64, display: 'flex', gap: 16}}>
			{[
				['Jardín', C.sol, C.tinta],
				['Primaria', C.celeste, C.papel],
				['Secundaria', C.bordo, C.papel],
			].map(([t, bg, ink]) => (
				<div key={t} style={{padding: '12px 30px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, boxShadow: '0 8px 24px rgba(11,20,64,0.35)'}}>
					{t}
				</div>
			))}
		</div>
	</AbsoluteFill>
);
