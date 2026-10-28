import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Granero} from './Granja';

/**
 * Publicación de feed 3:4 (1080×1440) de la salida de Sala de 3.
 * Sólo fotos sin caras: los chicos de espaldas, con el nombre del colegio en el buzo.
 */

export const Foto: React.FC<{src: string; style: React.CSSProperties; pos: string}> = ({src, style, pos}) => (
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

export const Burbuja: React.FC<{text: string; style: React.CSSProperties; color: string; ink: string}> = ({text, style, color, ink}) => (
	<div style={{position: 'absolute', padding: '12px 30px 16px', borderRadius: 999, background: color, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, transform: 'rotate(-6deg)', boxShadow: '0 10px 24px rgba(27,31,51,0.2)', ...style}}>
		{text}
	</div>
);

/** Marco común del carrusel: volanta, título, sol, firma y franja tricolor. */
export const Marco: React.FC<{titulo: React.ReactNode; volanta?: string; children: React.ReactNode; desliza?: boolean}> = ({titulo, volanta = 'JARDÍN · SALA DE 3', children, desliza}) => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<SolQuieto />
		<div style={{position: 'absolute', top: 64, left: 56, right: 220, display: 'flex', flexDirection: 'column', gap: 12}}>
			<div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>{volanta}</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.azul}}>{titulo}</h1>
		</div>
		{children}
		<div style={{position: 'absolute', top: 1340, left: 56, display: 'flex', alignItems: 'center', gap: 14}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 60}} />
			<div style={{fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
		</div>
		{desliza && (
			<div style={{position: 'absolute', top: 1342, right: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 26px', borderRadius: 999, background: C.azul, color: C.papel, fontSize: 28, fontWeight: 700}}>
				Deslizá
				<svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.papel} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
					<path d="M5 12h14M13 6l6 6-6 6" />
				</svg>
			</div>
		)}
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);

/** 1 · Portada del carrusel. */
export const PostGranja: React.FC = () => (
	<Marco desliza titulo={<>Un día en la <span style={{color: C.bordo}}>granja</span></>}>
		{/* los chicos sentados de espaldas, escuchando a la guía */}
		<Foto src="img/granja/guia.jpg" pos="50% 100%" style={{left: 56, top: 290, width: 968, height: 600}} />
		<Burbuja text="¡A escuchar!" color={C.celeste} ink={C.papel} style={{left: 84, top: 318}} />
		{/* mirando la vaca · dando de comer a las cabras */}
		<Foto src="img/granja/vaca.jpg" pos="50% 52%" style={{left: 56, top: 916, width: 474, height: 400}} />
		<Burbuja text="¡Muuu!" color={C.sol} ink={C.tinta} style={{left: 76, top: 936}} />
		<Foto src="img/granja/cabras.jpg" pos="50% 62%" style={{left: 550, top: 916, width: 474, height: 400}} />
		<Burbuja text="¡Ñam!" color={C.bordo} ink={C.papel} style={{left: 820, top: 936}} />
	</Marco>
);

/** 2 · El camino, de la mano. */
export const PostGranja2: React.FC = () => (
	<Marco titulo={<>Caminamos de la <span style={{color: C.bordo}}>mano</span></>}>
		<Foto src="img/granja/camino.jpg" pos="50% 62%" style={{left: 56, top: 290, width: 474, height: 1026}} />
		<Foto src="img/granja/fila.jpg" pos="38% 70%" style={{left: 550, top: 290, width: 474, height: 1026}} />
		<Burbuja text="¡Vamos!" color={C.sol} ink={C.tinta} style={{left: 80, top: 320}} />
	</Marco>
);

const GRILLA: [string, string, string, string][] = [
	['img/granja/chancho.jpg', '50% 65%', 'Chancho', C.bordo],
	['img/granja/pato.jpg', '50% 55%', 'Pato', C.celeste],
	['img/granja/oveja.jpg', '50% 40%', 'Oveja', C.sol],
	['img/granja/caballo.jpg', '55% 55%', 'Caballo', C.celeste],
	['img/granja/burro.jpg', '30% 45%', 'Burro', C.sol],
	['img/granja/llama.jpg', '45% 35%', 'Llama', C.bordo],
	['img/granja/llama-negra.jpg', '50% 40%', 'Llama', C.sol],
	['img/granja/vaca.jpg', '50% 45%', 'Vaca', C.bordo],
	['img/granja/comer.jpg', '50% 50%', 'Cabra', C.celeste],
];

/** 3 · Todos los animales que conocimos. */
export const PostGranja3: React.FC = () => (
	<Marco titulo={<>Conocimos a muchos <span style={{color: C.bordo}}>amigos</span></>}>
		{GRILLA.map(([src, pos, nombre, color], i) => {
			const x = 56 + (i % 3) * 329;
			const y = 290 + Math.floor(i / 3) * 347;
			const ink = color === C.sol ? C.tinta : C.papel;
			return (
				<React.Fragment key={i}>
					<Foto src={src} pos={pos} style={{left: x, top: y, width: 310, height: 328, borderRadius: 22}} />
					<div style={{position: 'absolute', left: x + 14, top: y + 328 - 62, padding: '6px 20px', borderRadius: 999, background: color, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 30}}>{nombre}</div>
				</React.Fragment>
			);
		})}
	</Marco>
);

/** 4 · Cierre ilustrado: el granero del reel, sin repetir fotos. */
export const PostGranja4: React.FC = () => (
	<Marco titulo={<>¡Qué lindo es aprender <span style={{color: C.bordo}}>jugando</span>!</>}>
		<div style={{position: 'absolute', left: 540 - 400, top: 360, width: 800, height: 800, borderRadius: '50%', background: C.doradoClaro}} />
		<div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center', transform: 'scale(1.35)'}}>
			<Granero progress={1} />
		</div>
		{/* cerca */}
		<svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 1000}}>
			{Array.from({length: 9}, (_, i) => {
				const x = 30 + i * 130;
				return <path key={i} d={`M${x} 160 V30 l18 -20 l18 20 V160`} fill={C.papel} stroke={C.bordo} strokeWidth={5} strokeLinejoin="round" />;
			})}
			<rect x={0} y={60} width={1080} height={16} rx={8} fill={C.bordo} />
			<rect x={0} y={115} width={1080} height={16} rx={8} fill={C.bordo} />
		</svg>
		<Burbuja text="¡Muuu!" color={C.sol} ink={C.tinta} style={{left: 90, top: 420}} />
		<Burbuja text="¡Beee!" color={C.celeste} ink={C.papel} style={{left: 760, top: 560}} />
		<Burbuja text="¡Oinc!" color={C.bordo} ink={C.papel} style={{left: 120, top: 880}} />
		<Burbuja text="¡Cuac!" color={C.sol} ink={C.tinta} style={{left: 780, top: 900}} />
		<div style={{position: 'absolute', top: 1220, width: '100%', textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.azul}}>¡Hasta la próxima, granja!</div>
	</Marco>
);
