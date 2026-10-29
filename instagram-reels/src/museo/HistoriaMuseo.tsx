import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Historia 1080×1920 que avisa del reel del museo.
 * Abajo (y 1560–1760) queda libre para el sticker de enlace o de mención al reel.
 */
export const HistoriaMuseo: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Img src={staticFile('img/museo/16.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 50%', filter: 'brightness(0.55) saturate(0.9)'}} />
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,20,64,0.85) 0%, rgba(11,20,64,0.35) 45%, rgba(11,20,64,0.85) 100%)'}} />

		<div style={{position: 'absolute', top: 260, left: 72, display: 'flex', alignItems: 'center', gap: 16}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 76}} />
			<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.papel}}>Álvarez Condarco</div>
		</div>

		<div style={{position: 'absolute', top: 420, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 22}}>
			<div style={{alignSelf: 'flex-start', padding: '10px 26px 12px', borderRadius: 999, background: C.bordo, color: C.papel, fontSize: 30, fontWeight: 700, letterSpacing: '0.12em'}}>NUEVO REEL</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.papel}}>
				¿Sabías que debajo de <span style={{color: C.sol}}>Florida y Santa Fe</span> encontraron un perezoso gigante?
			</h1>
		</div>

		{/* tarjeta "reproducir" con el T-Rex */}
		<div style={{position: 'absolute', top: 1110, left: 72, right: 72, height: 380, borderRadius: 32, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', border: `4px solid ${C.papel}`}}>
			<Img src={staticFile('img/museo/12.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 52%'}} />
			<div style={{position: 'absolute', inset: 0, background: 'rgba(11,20,64,0.25)'}} />
			<div style={{position: 'absolute', left: '50%', top: '50%', width: 140, height: 140, marginLeft: -70, marginTop: -70, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<svg width={64} height={64} viewBox="0 0 24 24"><path d="M8 5 L19 12 L8 19 Z" fill={C.bordo} /></svg>
			</div>
			<div style={{position: 'absolute', left: 24, bottom: 20, padding: '8px 22px 10px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 30}}>2.º año · Museo de Ciencias Naturales</div>
		</div>

		<div style={{position: 'absolute', top: 1520, width: '100%', textAlign: 'center', fontSize: 38, fontWeight: 600, color: C.papel}}>
			Miralo en nuestro perfil
		</div>
		<svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke={C.sol} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', top: 1580, left: 510}}>
			<path d="M12 5v14M6 13l6 6 6-6" />
		</svg>

		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
