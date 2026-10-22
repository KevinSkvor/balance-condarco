import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Publicación de feed 3:4 (1080×1440) de la salida de Sala de 3.
 * Sólo fotos sin caras: los chicos de espaldas, con el nombre del colegio en el buzo.
 */

const Foto: React.FC<{src: string; style: React.CSSProperties; pos: string}> = ({src, style, pos}) => (
	<div style={{position: 'absolute', borderRadius: 28, overflow: 'hidden', ...style}}>
		<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
	</div>
);

const SolQuieto: React.FC = () => (
	<svg width={150} height={150} viewBox="-130 -130 260 260" style={{position: 'absolute', right: 56, top: 48}}>
		{Array.from({length: 12}, (_, i) => (
			<line key={i} x1={0} y1={-80} x2={0} y2={-112} stroke={C.sol} strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 30 + 8})`} />
		))}
		<circle r={64} fill={C.sol} />
		<circle cx={-20} cy={-8} r={7} fill={C.tinta} />
		<circle cx={20} cy={-8} r={7} fill={C.tinta} />
		<path d="M-22 16 Q0 36 22 16" fill="none" stroke={C.tinta} strokeWidth={7} strokeLinecap="round" />
	</svg>
);

const Burbuja: React.FC<{text: string; style: React.CSSProperties; color: string; ink: string}> = ({text, style, color, ink}) => (
	<div style={{position: 'absolute', padding: '12px 30px 16px', borderRadius: 999, background: color, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, transform: 'rotate(-6deg)', boxShadow: '0 10px 24px rgba(27,31,51,0.2)', ...style}}>
		{text}
	</div>
);

export const PostGranja: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<SolQuieto />
		<div style={{position: 'absolute', top: 64, left: 56, right: 220, display: 'flex', flexDirection: 'column', gap: 12}}>
			<div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>JARDÍN · SALA DE 3</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.azul}}>
				Un día en la <span style={{color: C.bordo}}>granja</span>
			</h1>
		</div>

		{/* los chicos sentados de espaldas, escuchando a la guía */}
		<Foto src="img/granja/guia.jpg" pos="50% 100%" style={{left: 56, top: 290, width: 968, height: 600}} />
		<Burbuja text="¡A escuchar!" color={C.celeste} ink={C.papel} style={{left: 84, top: 318}} />

		{/* mirando la vaca · dando de comer a las cabras */}
		<Foto src="img/granja/vaca.jpg" pos="50% 52%" style={{left: 56, top: 916, width: 474, height: 400}} />
		<Burbuja text="¡Muuu!" color={C.sol} ink={C.tinta} style={{left: 76, top: 936}} />
		<Foto src="img/granja/cabras.jpg" pos="50% 62%" style={{left: 550, top: 916, width: 474, height: 400}} />
		<Burbuja text="¡Ñam!" color={C.bordo} ink={C.papel} style={{left: 820, top: 936}} />

		<div style={{position: 'absolute', top: 1340, left: 56, display: 'flex', alignItems: 'center', gap: 14}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 60}} />
			<div style={{fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
