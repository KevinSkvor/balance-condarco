import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Barrido, Pan, Velo} from '../recorrido/Recorrido';
import T from './timeline.json';

/**
 * Reel "Exámenes AEXALEVI 2026": los alumnos rindieron el examen escrito de inglés
 * de la Asociación Lenguas Vivas. Voz de Sofía (ElevenLabs) y música de fondo
 * (audio/make_audio_aexalevi.py). Los niveles aparecen cuando la voz los nombra.
 */

const S = T.scenes;
const ROJO = '#d0342c'; // rojo del logo de AEXALEVI

const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});

const Escena: React.FC<{range: number[]; children: React.ReactNode}> = ({range, children}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	return <AbsoluteFill>{children}</AbsoluteFill>;
};

const Chip: React.FC<{at: number; bg: string; ink: string; size?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, bg, ink, size = 52, children, style}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 11, stiffness: 190});
	if (f < at - 1) return null;
	return (
		<div style={{padding: '12px 34px 16px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 12px 28px rgba(0,0,0,0.3)', transform: `scale(${s})`, opacity: Math.min(1, s * 2), ...style}}>
			{children}
		</div>
	);
};

const Titulo: React.FC<{at: number; children: React.ReactNode; size?: number}> = ({at, children, size = 96}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 14, stiffness: 150});
	return (
		<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.papel, textShadow: '0 6px 30px rgba(11,20,64,0.6)', opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 50}px)`}}>
			{children}
		</div>
	);
};

/** Fotos que se suceden dentro de una escena, con barrido. */
const Fotos: React.FC<{fotos: [string, string][]; cortes: number[]; fin: number}> = ({fotos, cortes, fin}) => (
	<>
		{fotos.map(([src, pos], i) => {
			const a = cortes[i];
			const b = i < fotos.length - 1 ? cortes[i + 1] + 8 : fin;
			const [x, y] = pos.split(' ').map(Number);
			return (
				<Barrido key={src + i} at={a}>
					<Pan src={`img/aexalevi/${src}.jpg`} at={a} dur={b - a + 10} x={[x - 4, x + 4]} y={y} zoom={[1.12, 1.02]} />
				</Barrido>
			);
		})}
	</>
);

// ───────────────────────── escenas ─────────────────────────

const Inicio: React.FC = () => {
	const f = useCurrentFrame();
	const logo = sp(f, 4, {damping: 12, stiffness: 140});
	const aexa = W('a1', 'exalevi') - 6;
	return (
		<AbsoluteFill>
			<Pan src="img/aexalevi/escalera.jpg" at={0} dur={S.inicio[1] + 10} x={[50, 50]} y={50} zoom={[1.15, 1.02]} />
			<Velo alto={1000} />
			<Velo alto={700} abajo />
			{/* logo de AEXALEVI */}
			<div style={{position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{width: 300, height: 300, borderRadius: '50%', background: C.papel, boxShadow: '0 20px 50px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${logo}) rotate(${(1 - Math.min(logo, 1)) * -20}deg)`, opacity: Math.min(1, logo * 2)}}>
					<Img src={staticFile('img/aexalevi/logo.png')} style={{width: 280}} />
				</div>
			</div>
			<div style={{position: 'absolute', top: 600, left: 56, right: 56, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<Titulo at={W('a1', 'examen') - 4}>
					Examen de <span style={{color: C.sol}}>inglés</span>
				</Titulo>
				<Chip at={aexa} bg={ROJO} ink={C.papel} size={46}>
					Asociación Lenguas Vivas · AEXALEVI
				</Chip>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1460, display: 'flex', justifyContent: 'center'}}>
				<Chip at={W('a1', 'escrito') - 2} bg={C.papel} ink={C.azul} size={42}>
					Examen escrito · 19/11
				</Chip>
			</div>
		</AbsoluteFill>
	);
};

const Chicos: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.chicos;
	const n0 = W('a2', '100') - 4;
	const n = Math.round(interpolate(f, [n0, n0 + 24], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)}));
	const corte = W('a2', 'desde') - 4;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['pasillo', '50 50'], ['aula-secundaria', '50 55']]} cortes={[a, corte]} fin={b} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 6}}>
				<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 0.95, color: C.sol, textShadow: '0 8px 40px rgba(11,20,64,0.6)', opacity: f >= n0 ? 1 : 0}}>+{n}</div>
				<Titulo at={W('a2', 'chicos') - 3} size={72}>
					alumnos rindieron
				</Titulo>
			</div>
			<div style={{position: 'absolute', left: 56, top: 1480}}>
				<Chip at={W('a2', 'segundo') - 3} bg={C.celeste} ink={C.papel} size={46}>
					Desde 2.º grado
				</Chip>
			</div>
		</AbsoluteFill>
	);
};

const NIVELES: [string, string, number, string, string][] = [
	// [texto, palabra con la que aparece, aparición de esa palabra, fondo, tinta]
	['Preparatorio II', 'preparatorio', 0, C.sol, C.tinta],
	['Children 1', '1', 0, C.celeste, C.papel],
	['Children 2', '2', 0, C.celeste, C.papel],
	['Children 3', '3', 0, C.celeste, C.papel],
	['Pre-Adol. Beginners', 'beginners', 0, ROJO, C.papel],
	['Pre-Adol. 1', '1', 1, ROJO, C.papel],
	['Pre-Adol. 2', '2', 1, ROJO, C.papel],
	['Pre-Adol. 3', '3', 1, ROJO, C.papel],
];

/** Los niveles aparecen de a uno, grandes, y cada grupo va sobre su propia foto. */
const Niveles: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.niveles;
	const ats = NIVELES.map(([, w, n]) => W('a3', w, n) - 2);
	const cortes = [a, W('a3', 'children') - 4, W('a3', 'pre') - 4, W('a3', '1', 1) - 4];
	const k = ats.filter((t) => f >= t).length - 1;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos
				fotos={[
					['escribiendo', '50 50'],
					['aula-children', '50 55'],
					['mano-arriba', '50 50'],
					['aula-reja', '50 55'],
				]}
				cortes={cortes}
				fin={b}
			/>
			<Velo alto={700} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 700, background: 'linear-gradient(0deg, rgba(11,20,64,0.85) 0%, rgba(11,20,64,0) 100%)'}} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a + 2} size={100}>
					Los <span style={{color: C.sol}}>niveles</span>
				</Titulo>
			</div>
			{k >= 0 && (
				<div key={k} style={{position: 'absolute', left: 0, right: 0, top: 1380, display: 'flex', justifyContent: 'center'}}>
					<Chip at={ats[k]} bg={NIVELES[k][3]} ink={NIVELES[k][4]} size={72}>
						{NIVELES[k][0]}
					</Chip>
				</div>
			)}
		</AbsoluteFill>
	);
};

const Oral: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.oral;
	const cal = sp(f, W('a4', '26') - 4, {damping: 10, stiffness: 170});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['puerta', '50 55']]} cortes={[a]} fin={b} />
			<Velo alto={1000} />
			<div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
				<div style={{width: 380, borderRadius: 32, overflow: 'hidden', background: C.papel, boxShadow: '0 24px 60px rgba(0,0,0,0.45)', transform: `scale(${cal}) rotate(${-4 + (1 - Math.min(cal, 1)) * 10}deg)`, opacity: Math.min(1, cal * 2)}}>
					<div style={{background: ROJO, color: C.papel, fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em', textAlign: 'center', padding: '16px 0'}}>NOVIEMBRE</div>
					<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 1.1, color: C.azul, textAlign: 'center', paddingBottom: 10}}>26</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: 760, left: 56, right: 56, textAlign: 'center'}}>
				<Titulo at={W('a4', 'llega') - 3} size={100}>
					¡Llega el examen <span style={{color: C.sol}}>oral</span>!
				</Titulo>
			</div>
		</AbsoluteFill>
	);
};

const Suerte: React.FC = () => {
	const [a, b] = S.suerte;
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Fotos fotos={[['aula-chicos', '50 50']]} cortes={[a]} fin={b} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 260, left: 56, right: 56}}>
				<Titulo at={W('a5', 'muchas') - 3} size={120}>
					¡Mucha <span style={{color: C.sol}}>suerte</span>, chicos!
				</Titulo>
			</div>
			<div style={{position: 'absolute', left: 56, top: 1480}}>
				<Chip at={W('a5', 'orgullosos') - 4} bg={C.bordo} ink={C.papel} size={46}>
					¡Estamos muy orgullosos!
				</Chip>
			</div>
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

export const ExamenAexalevi: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
		<Audio src={staticFile('aexalevi/soundtrack.wav')} />
		<Escena range={S.inicio}>
			<Inicio />
		</Escena>
		<Escena range={S.chicos}>
			<Barrido at={S.chicos[0]}>
				<Chicos />
			</Barrido>
		</Escena>
		<Escena range={S.niveles}>
			<Niveles />
		</Escena>
		<Escena range={S.oral}>
			<Barrido at={S.oral[0]}>
				<Oral />
			</Barrido>
		</Escena>
		<Escena range={S.suerte}>
			<Barrido at={S.suerte[0]}>
				<Suerte />
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
