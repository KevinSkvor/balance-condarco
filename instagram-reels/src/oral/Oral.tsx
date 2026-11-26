import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Barrido, Pan, Velo} from '../recorrido/Recorrido';
import T from './timeline.json';

/**
 * Reel "Examen oral AEXALEVI 2026": misma línea que el reel del escrito (src/aexalevi),
 * con la voz tranquila de Sofía, fotos del día y stickers oficiales de Lenguas Vivas
 * que entran con rebote sobre las fotos. Música: audio/make_audio_oral.py.
 */

const S = T.scenes;
const ROJO = '#d0342c';

const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const Escena: React.FC<{range: number[]; children: React.ReactNode}> = ({range, children}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	return <AbsoluteFill>{children}</AbsoluteFill>;
};

const Titulo: React.FC<{at: number; size?: number; children: React.ReactNode}> = ({at, size = 96, children}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 14, stiffness: 150});
	return (
		<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.02em', color: C.papel, textShadow: '0 6px 30px rgba(11,20,64,0.6)', opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 50}px)`}}>
			{children}
		</div>
	);
};

const Chip: React.FC<{at: number; bg: string; ink: string; size?: number; children: React.ReactNode}> = ({at, bg, ink, size = 46, children}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 11, stiffness: 190});
	if (f < at - 1) return null;
	return (
		<div style={{display: 'inline-block', padding: '12px 34px 16px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 12px 28px rgba(0,0,0,0.3)', transform: `scale(${s})`, opacity: Math.min(1, s * 2)}}>
			{children}
		</div>
	);
};

/** Sticker oficial que entra con rebote y queda flotando suave. */
const Sticker: React.FC<{n: string; at: number; x: number; y: number; w: number; rot?: number}> = ({n, at, x, y, w, rot = 0}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 9, stiffness: 160});
	if (f < at - 1) return null;
	const flota = Math.sin((f - at) / 14) * 6;
	return (
		<Img
			src={staticFile(`img/aexalevi/stickers/${n}.png`)}
			style={{position: 'absolute', left: x, top: y + flota, width: w, transform: `scale(${s}) rotate(${rot + (1 - Math.min(s, 1)) * -25}deg)`, opacity: Math.min(1, s * 2), filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.35))'}}
		/>
	);
};

/** Fotos que se suceden con barrido. */
const Fotos: React.FC<{fotos: [string, string][]; cortes: number[]; fin: number}> = ({fotos, cortes, fin}) => (
	<>
		{fotos.map(([src, pos], i) => {
			const a = cortes[i];
			const b = i < fotos.length - 1 ? cortes[i + 1] + 8 : fin;
			const [x, y] = pos.split(' ').map(Number);
			return (
				<Barrido key={src + i} at={a}>
					<Pan src={`img/oral/${src}.jpg`} at={a} dur={b - a + 10} x={[x - 3, x + 3]} y={y} zoom={[1.1, 1.02]} />
				</Barrido>
			);
		})}
	</>
);

const Inicio: React.FC = () => {
	const f = useCurrentFrame();
	const logo = sp(f, 4, {damping: 12, stiffness: 140});
	return (
		<AbsoluteFill>
			<Fotos fotos={[['entrada', '50 55'], ['escalera', '50 50']]} cortes={[0, W('o1', 'asociación') - 4]} fin={S.inicio[1]} />
			<Velo alto={1000} />
			<Velo alto={700} abajo />
			<div style={{position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{width: 280, height: 280, borderRadius: '50%', background: C.papel, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${logo}) rotate(${(1 - Math.min(logo, 1)) * -20}deg)`, opacity: Math.min(1, logo * 2)}}>
					<Img src={staticFile('img/aexalevi/logo.png')} style={{width: 260}} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 580, left: 56, right: 56, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<Titulo at={W('o1', 'examen') - 4}>
					Examen <span style={{color: C.sol}}>oral</span>
				</Titulo>
				<Chip at={W('o1', 'asociación') - 4} bg={ROJO} ink={C.papel}>
					Asociación Lenguas Vivas · AEXALEVI
				</Chip>
			</div>
			<Sticker n="02" at={W('o1', 'exalevi') - 6} x={620} y={1240} w={360} rot={6} />
		</AbsoluteFill>
	);
};

const Examinadores: React.FC = () => {
	const [a, b] = S.examinadores;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos
				fotos={[
					['entran', '50 50'],
					['oral-sec', '50 55'],
					['oral-chicos', '45 55'],
				]}
				cortes={[a, W('o2', 'momento') - 4, W('o2', 'frente') - 4]}
				fin={b}
			/>
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 260, left: 56, right: 56}}>
				<Titulo at={W('o2', 'hablar') - 3} size={88}>
					¡A hablar en <span style={{color: C.sol}}>inglés</span>!
				</Titulo>
			</div>
			<Sticker n="08" at={W('o2', 'examinadores') - 4} x={60} y={1260} w={380} rot={-6} />
		</AbsoluteFill>
	);
};

const Paso: React.FC = () => {
	const [a, b] = S.paso;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['oral-profe', '50 55'], ['oral-nena', '50 50']]} cortes={[a, W('o3', 'camino') - 4]} fin={b} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 260, left: 56, right: 56}}>
				<Titulo at={W('o3', 'paso') - 3} size={92}>
					Un paso <span style={{color: C.sol}}>más</span>
				</Titulo>
			</div>
			<Sticker n="07" at={W('o3', 'idioma') - 4} x={640} y={1240} w={330} rot={5} />
		</AbsoluteFill>
	);
};

const Felicitaciones: React.FC = () => {
	const [a, b] = S.felicitaciones;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['seno', '50 55'], ['corren', '50 55']]} cortes={[a, W('o4', 'estamos') - 4]} fin={b} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 260, left: 56, right: 56}}>
				<Titulo at={W('o4', 'felicitaciones') - 3} size={104}>
					¡Felicitaciones, <span style={{color: C.sol}}>chicos</span>!
				</Titulo>
			</div>
			<Sticker n="01" at={W('o4', 'orgullosos') - 4} x={80} y={1220} w={330} rot={-5} />
		</AbsoluteFill>
	);
};

const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const s = ease(f, a, a + 20);
	return (
		<AbsoluteFill style={{background: C.crema, alignItems: 'center', opacity: ease(f, a, a + 8)}}>
			<div style={{position: 'absolute', top: 540, display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${0.9 + 0.1 * s})`}}>
				<div style={{width: 330, height: 330, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 210}} />
				</div>
				<div style={{width: 330, height: 330, borderRadius: '50%', background: C.papel, boxShadow: '0 10px 30px rgba(19,32,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, a + 8, a + 24)}}>
					<Img src={staticFile('img/aexalevi/logo.png')} style={{width: 300}} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 960, fontFamily: DISPLAY, fontSize: 64, fontWeight: 700, color: C.azul, opacity: ease(f, a + 14, a + 30)}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1050, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, a + 22, a + 38)}}>Exámenes AEXALEVI 2026</div>
			<Sticker n="04" at={a + 26} x={330} y={1180} w={420} rot={-3} />
		</AbsoluteFill>
	);
};

export const ExamenOral: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Audio src={staticFile('oral/soundtrack.wav')} />
		<Escena range={S.inicio}>
			<Inicio />
		</Escena>
		<Escena range={S.examinadores}>
			<Barrido at={S.examinadores[0]}>
				<Examinadores />
			</Barrido>
		</Escena>
		<Escena range={S.paso}>
			<Barrido at={S.paso[0]}>
				<Paso />
			</Barrido>
		</Escena>
		<Escena range={S.felicitaciones}>
			<Barrido at={S.felicitaciones[0]}>
				<Felicitaciones />
			</Barrido>
		</Escena>
		<Escena range={S.cierre}>
			<Cierre />
		</Escena>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
