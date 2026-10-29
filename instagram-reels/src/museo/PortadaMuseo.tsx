import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/** Portada del reel. Todo el contenido queda dentro del recorte 3:4 del perfil (y 240–1680). */
export const PortadaMuseo: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Img src={staticFile('img/museo/12.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 48%', transform: 'scale(1.08)'}} />
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,20,64,0.9) 0%, rgba(11,20,64,0.6) 34%, rgba(11,20,64,0) 52%, rgba(11,20,64,0) 70%, rgba(11,20,64,0.75) 100%)'}} />
		<div style={{position: 'absolute', top: 290, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 18}}>
			<div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.14em', color: C.sol}}>2.º AÑO · SECUNDARIA</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 140, lineHeight: 0.98, letterSpacing: '-0.02em', color: C.papel}}>
				Viaje en el <span style={{color: C.sol}}>tiempo</span>
			</h1>
		</div>
		<div style={{position: 'absolute', top: 1500, left: 64, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px 16px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, boxShadow: '0 10px 30px rgba(11,20,64,0.4)'}}>
			<svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.tinta} strokeWidth={2.2} strokeLinecap="round">
				<circle cx={12} cy={12} r={9.5} />
				<path d="M12 12 L12 6.5" />
				<path d="M12 12 L15.5 12" />
			</svg>
			Museo de Ciencias Naturales
		</div>
	</AbsoluteFill>
);
