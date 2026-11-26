import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Barrido, Pan} from '../recorrido/Recorrido';
import T from './timeline.json';

/**
 * Reel "Examen oral AEXALEVI 2026": misma línea que el reel del escrito (src/aexalevi),
 * sólo con las fotos del día y la voz tranquila de Sofía; algunos stickers oficiales de
 * Lenguas Vivas aparecen chicos, abajo, en algunas fotos. Música: audio/make_audio_oral.py.
 */

const S = T.scenes;

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

/** Sticker chico, abajo de la foto. */
const Mini: React.FC<{n: string; at: number; lado?: 'izq' | 'der'}> = ({n, at, lado = 'der'}) => (
	<Sticker n={n} at={at} x={lado === 'der' ? 800 : 60} y={1500} w={210} rot={lado === 'der' ? 6 : -6} />
);

const Inicio: React.FC = () => (
	<AbsoluteFill>
		<Fotos fotos={[['entrada', '50 55'], ['pasillo', '50 55'], ['escalera', '50 50']]} cortes={[0, W('o1', 'examen') - 4, W('o1', 'asociación') - 4]} fin={S.inicio[1]} />
		<Mini n="03" at={W('o1', 'exalevi') - 6} />
	</AbsoluteFill>
);

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
			<Mini n="08" at={W('o2', 'frente') + 4} lado="izq" />
		</AbsoluteFill>
	);
};

const Paso: React.FC = () => {
	const [a, b] = S.paso;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['oral-profe', '50 55'], ['oral-nena', '50 50']]} cortes={[a, W('o3', 'camino') - 4]} fin={b} />
		</AbsoluteFill>
	);
};

const Felicitaciones: React.FC = () => {
	const [a, b] = S.felicitaciones;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['aula', '50 55'], ['seno', '50 55'], ['corren', '50 55']]} cortes={[a, W('o4', 'estamos') - 4, W('o4', 'orgullosos') - 2]} fin={b} />
			<Mini n="07" at={W('o4', 'estamos') + 2} lado="izq" />
			<Mini n="01" at={W('o4', 'orgullosos') + 6} />
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
