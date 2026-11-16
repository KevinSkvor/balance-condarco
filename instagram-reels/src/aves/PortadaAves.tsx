import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Pajarito} from './Aves';

/** Portada del reel "Las aves". Todo el contenido queda dentro del recorte 3:4 del perfil (y 240–1680). */
const Polaroid: React.FC<{src: string; pos?: string; style: React.CSSProperties; rot: number}> = ({src, pos = '50% 50%', style, rot}) => (
	<div style={{position: 'absolute', padding: 16, background: C.papel, borderRadius: 26, boxShadow: '0 22px 50px rgba(19,32,90,0.28)', transform: `rotate(${rot}deg)`, ...style}}>
		<div style={{width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden'}}>
			<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
		</div>
	</div>
);

export const PortadaAves: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<div style={{position: 'absolute', top: 280, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 14}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
				<Img src={staticFile('img/escudo.png')} style={{height: 60}} />
				<div style={{fontSize: 32, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>JARDÍN · SALA DE 5</div>
			</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 168, lineHeight: 0.95, letterSpacing: '-0.02em', color: C.azul}}>
				Las <span style={{color: C.bordo}}>aves</span>
			</h1>
		</div>
		<div style={{position: 'absolute', right: 70, top: 420}}>
			<Pajarito size={210} />
		</div>
		<Polaroid src="img/aves/loro.jpg" pos="50% 45%" rot={-4} style={{left: 50, width: 560, top: 720, height: 760}} />
		<Polaroid src="img/aves/flamenco.jpg" pos="50% 40%" rot={5} style={{right: 50, width: 440, top: 820, height: 600}} />
		<div style={{position: 'absolute', left: 64, top: 1520, padding: '14px 34px 18px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, boxShadow: '0 10px 26px rgba(19,32,90,0.25)', transform: 'rotate(-2deg)'}}>
			Nuestro libro de aves argentinas
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
