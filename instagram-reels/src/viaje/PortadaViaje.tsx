import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Luna, Papel, Polaroid, Sol} from './Viaje';

/** Portada del reel. Todo el contenido queda dentro del recorte 3:4 del perfil (y 240–1680). */
export const PortadaViaje: React.FC = () => (
	<AbsoluteFill style={{fontFamily: SANS}}>
		<Papel />
		<div style={{position: 'absolute', top: 290, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 18}}>
			<div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>DIARIO DE VIAJE · 3.º DE SECUNDARIA</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.98, letterSpacing: '-0.02em', color: C.azul}}>
				Nueva <span style={{color: C.bordo}}>Atlantis</span>
			</h1>
			<div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 6}}>
				{[0, 1, 2, 3].map((i) => (
					<Sol key={`s${i}`} s={0.8} />
				))}
				<div style={{width: 20}} />
				{[0, 1, 2].map((i) => (
					<Luna key={`l${i}`} s={0.8} />
				))}
			</div>
		</div>
		<Polaroid at={-200} left={60} top={830} w={960} h={442} rot={-3} img="img/viaje/grupo.jpg" caption="4 días, 3 noches, un grupo para siempre" />
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
