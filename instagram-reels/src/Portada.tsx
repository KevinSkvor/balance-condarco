import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, NIVELES, SANS} from './lib';

/**
 * Portada del reel (1080×1920). Todo lo importante queda dentro del recorte 3:4
 * que muestra la grilla del perfil (franja central de 1440 px: y 240–1680).
 */
export const Portada: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS, alignItems: 'center'}}>
		<div style={{position: 'absolute', top: 300, width: 470, height: 470, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', inset: -18, borderRadius: '50%', border: `3px solid ${C.dorado}`, opacity: 0.6}} />
			<Img src={staticFile('img/escudo.png')} style={{width: 300}} />
		</div>

		<div style={{position: 'absolute', top: 840, left: 64, right: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
			<div style={{fontSize: 36, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>CICLO LECTIVO 2027</div>
			<h1
				style={{
					margin: 0,
					fontFamily: DISPLAY,
					fontWeight: 700,
					fontSize: 150,
					lineHeight: 1.0,
					letterSpacing: '-0.02em',
					color: C.azul,
					textAlign: 'center',
				}}
			>
				Inscripciones
				<br />
				<span style={{color: C.bordo}}>abiertas</span>
			</h1>
			<div style={{display: 'flex', gap: 16, marginTop: 18}}>
				{NIVELES.map((n) => (
					<div key={n.name} style={{padding: '14px 32px', borderRadius: 999, background: n.color, color: n.ink, fontSize: 38, fontWeight: 700}}>
						{n.name}
					</div>
				))}
			</div>
		</div>

		<div style={{position: 'absolute', top: 1500, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 40px', borderRadius: 999, background: C.azul, color: C.papel, fontSize: 42, fontWeight: 700}}>
			<svg width={38} height={38} viewBox="0 0 24 24" fill="none" stroke={C.dorado} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="9" />
				<path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
			</svg>
			alvarezcondarco.com
		</div>

		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', padding: '30px 64px', background: C.noche, color: C.doradoClaro, fontSize: 30, fontWeight: 600}}>
				<span>Ing. Adolfo Sourdeaux</span>
				<span>Desde 1977</span>
			</div>
			<div style={{display: 'flex', height: 20}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</div>
	</AbsoluteFill>
);
