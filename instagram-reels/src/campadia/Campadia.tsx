import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Check, Titulo, Volanta} from '../ui';
import {Barrido, Pan, Velo} from '../recorrido/Recorrido';
import T from './timeline.json';

/**
 * Reel "Campadía" de Sala de 5 (Ositos): el jardín se convierte en campamento.
 * Carpa que se arma en el gancho, misiones de la lista que se tildan con la voz,
 * juegos, la ronda del fuego con las familias y cierre con el escudo, sin voz.
 */

const S = T.scenes;

const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};
const Ws = (id: string, words: string[]) => words.map((w) => W(id, w) - 2);

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const out = Easing.out(Easing.cubic);

const Escena: React.FC<{range: number[]; children: React.ReactNode}> = ({range, children}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	return <AbsoluteFill>{children}</AbsoluteFill>;
};

/** Carpa dibujada: los dos paños se despliegan desde el palo central. */
export const Carpa: React.FC<{p: number; size: number}> = ({p, size}) => (
	<svg width={size} height={size * 0.8} viewBox="-200 -320 400 320" style={{overflow: 'visible'}}>
		<path d={`M0 -300 L${-190 * p} 0 L${190 * p} 0 Z`} fill={C.bordo} />
		<path d={`M0 -300 L${-60 * p} 0 L${60 * p} 0 Z`} fill={C.noche} opacity={0.85} />
		<path d={`M0 -300 L${-60 * p} 0`} stroke={C.sol} strokeWidth={8} />
		<path d="M0 -300 L0 -340" stroke={C.tinta} strokeWidth={8} strokeLinecap="round" opacity={p} />
		<path d="M0 -340 L44 -326 L0 -312" fill={C.sol} opacity={p} />
		<path d="M-215 0 L215 0" stroke={C.tinta} strokeWidth={10} strokeLinecap="round" />
	</svg>
);

/** Llamas que bailan. */
export const Llama: React.FC<{size: number; s: number}> = ({size, s}) => {
	const f = useCurrentFrame();
	const w = Math.sin(f / 3) * 0.06;
	return (
		<svg width={size} height={size} viewBox="-100 -220 200 240" style={{transform: `scale(${s}, ${s * (1 + w)})`, transformOrigin: '50% 100%'}}>
			<path d="M-70 -6 L70 -30 M-70 -30 L70 -6" stroke="#7a4a2a" strokeWidth={20} strokeLinecap="round" />
			<path d="M0 -190 C 50 -120, 70 -80, 40 -30 C 30 -60, 15 -70, 10 -90 C -10 -60, -40 -60, -40 -30 C -70 -80, -40 -130, 0 -190 Z" fill={C.sol} />
			<path d="M4 -120 C 30 -80, 30 -50, 12 -34 C 4 -50, -4 -54, -8 -66 C -18 -50, -24 -44, -22 -34 C -36 -60, -20 -90, 4 -120 Z" fill={C.bordo} />
		</svg>
	);
};

// ───────────────────────── escenas ─────────────────────────

/** "¿Qué pasa cuando el jardín se convierte en un campamento?" */
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	const camp = W('c1', 'campamento');
	const p = sp(f, camp - 4, {damping: 11, stiffness: 140});
	const words = ['qué', 'pasa', 'cuando', 'el', 'jardín', 'se', 'convierte', 'en', 'un', 'campamento'].map((w, i) => (i === 0 ? 0 : W('c1', w) - 3));
	return (
		<AbsoluteFill>
			<Pan src="img/campadia/patio.jpg" at={0} dur={130} x={[50, 50]} y={60} zoom={[1.0, 1.12]} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={0} parts={['¿Qué pasa cuando el jardín se convierte en un ', 'campamento?']} size={96} color={C.papel} accent={C.sol} wordAts={words} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center', opacity: Math.min(1, p * 3), transform: `translateY(${(1 - p) * 60}px)`}}>
				<Carpa p={Math.min(1, p)} size={560} />
			</div>
		</AbsoluteFill>
	);
};

/** "Los Ositos de sala de cinco vivieron su Campadía, junto a sus familias." */
const Ositos: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.ositos;
	const fam = W('c2', 'familias');
	const chips: [string, string, string, number][] = [
		['Turno mañana', C.sol, C.tinta, W('c2', 'sala') + 4],
		['Turno tarde', C.celeste, C.papel, W('c2', 'cinco') + 6],
	];
	const f2 = sp(f, fam - 3, {damping: 12, stiffness: 160});
	return (
		<AbsoluteFill>
			<Pan src="img/campadia/ronda-fuego.jpg" at={a} dur={S.ositos[1] - a + 10} x={[30, 55]} y={70} zoom={[1.05, 1.15]} />
			<Velo alto={900} />
			<Velo alto={600} abajo />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a} color={C.sol}>JARDÍN · SALA DE 5 · OSITOS</Volanta>
				{(() => {
					const t = sp(f, W('c2', 'vivieron') - 2, {damping: 11, stiffness: 150});
					return (
						<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 160, lineHeight: 1, letterSpacing: '-0.02em', color: C.papel, opacity: Math.min(1, t * 2), transform: `scale(${0.7 + 0.3 * Math.min(t, 1.1)}) rotate(${(1 - Math.min(t, 1)) * -6}deg)`, transformOrigin: 'left center'}}>
							¡Campa<span style={{color: C.sol}}>día</span>!
						</h1>
					);
				})()}
				<div style={{display: 'flex', gap: 16}}>
					{chips.map(([t, bg, ink, at]) => {
						const s = sp(f, at, {damping: 12, stiffness: 170});
						return (
							<div key={t} style={{padding: '10px 28px 12px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, opacity: Math.min(1, s * 2), transform: `scale(${s})`}}>
								{t}
							</div>
						);
					})}
				</div>
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, top: 1340, opacity: Math.min(1, f2 * 2), transform: `scale(${0.8 + 0.2 * f2}) rotate(-3deg)`, transformOrigin: 'left center'}}>
				<div style={{display: 'inline-block', padding: '14px 38px 20px', borderRadius: 28, background: C.bordo, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1}}>junto a sus familias</div>
			</div>
		</AbsoluteFill>
	);
};

const MISIONES: [string, string][] = [
	['hojas', '8 hojas diferentes'],
	['piedras', '5 piedras'],
	['flores', '10 flores'],
	['piñas', '2 piñas'],
];

/** "Buscamos hojas, piedras, flores y piñas, corrimos y jugamos toda la tarde." */
const Juegos: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.juegos;
	const corr = W('c3', 'corrimos') - 4;
	const jug = W('c3', 'jugamos') - 4;
	const card = sp(f, a + 2, {damping: 15});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Pan src="img/campadia/lista2.jpg" at={a} dur={corr - a + 10} x={[50, 50]} y={50} zoom={[1.2, 1.05]} />
			<Velo alto={520} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a} parts={['Misión: ', 'explorar']} size={100} color={C.papel} accent={C.sol} wordAts={[a + 2, a + 6]} />
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, top: 1080, padding: '30px 40px 34px', background: C.papel, borderRadius: 28, boxShadow: '0 18px 40px rgba(0,0,0,0.35)', transform: `rotate(-2deg) translateY(${(1 - card) * 300}px)`}}>
				<div style={{fontFamily: SANS, fontSize: 28, fontWeight: 700, letterSpacing: '0.12em', color: C.bordo, marginBottom: 18}}>NUESTRA LISTA</div>
				{MISIONES.map(([w, t]) => {
					const at = W('c3', w);
					const c = ease(f, at, at + 10, out);
					const pop = sp(f, at - 2, {damping: 9, stiffness: 220});
					return (
						<div key={w} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14, fontFamily: SANS, fontSize: 46, fontWeight: 700, color: c > 0.5 ? C.tinta : C.tintaSuave}}>
							<div style={{width: 60, height: 60, borderRadius: 16, border: `4px solid ${C.sol}`, background: c > 0.01 ? C.sol : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.8 + 0.2 * Math.min(pop, 1.2)})`}}>
								<Check size={46} color={C.tinta} progress={c} />
							</div>
							{t}
						</div>
					);
				})}
			</div>
			<Barrido at={corr}>
				<Pan src="img/campadia/corren.jpg" at={corr} dur={jug - corr + 12} x={[50, 50]} y={62} zoom={[1.1, 1.0]} />
				<Velo alto={600} abajo />
				<div style={{position: 'absolute', left: 56, top: 1360, fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: C.sol, textShadow: '0 6px 30px rgba(11,20,64,0.7)'}}>¡Corrimos!</div>
			</Barrido>
			<Barrido at={jug}>
				<Pan src="img/campadia/aros.jpg" at={jug} dur={b - jug + 10} x={[40, 55]} y={64} zoom={[1.1, 1.02]} />
				<Velo alto={600} abajo />
				<div style={{position: 'absolute', left: 56, right: 56, top: 1300, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.02, color: C.papel, textShadow: '0 6px 30px rgba(11,20,64,0.7)'}}>
					¡Y jugamos <span style={{color: C.sol}}>toda la tarde!</span>
				</div>
			</Barrido>
		</AbsoluteFill>
	);
};

/** "Y al atardecer, nos juntamos en ronda alrededor del fuego." */
const Fuego: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.fuego;
	const fg = W('c4', 'fuego') - 4;
	const glow = ease(f, fg, fg + 20, out);
	const llama = sp(f, fg, {damping: 10, stiffness: 140});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Pan src="img/campadia/ronda.jpg" at={a} dur={fg - a + 12} x={[35, 50]} y={68} zoom={[1.15, 1.05]} />
			<Barrido at={fg}>
				<Pan src="img/campadia/gorra.jpg" at={fg} dur={b - fg + 10} x={[50, 50]} y={45} zoom={[1.0, 1.1]} />
			</Barrido>
			{/* cálido de atardecer */}
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 75%, rgba(242,182,50,${0.35 * glow}) 0%, rgba(142,43,29,${0.25 * glow}) 40%, rgba(11,20,64,0) 75%)`, mixBlendMode: 'screen'}} />
			<Velo alto={820} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a} parts={['Y al atardecer, en ronda alrededor del ', 'fuego']} size={92} color={C.papel} accent={C.sol} wordAts={Ws('c4', ['y', 'al', 'atardecer', 'en', 'ronda', 'alrededor', 'del', 'fuego'])} />
			</div>
			<div style={{position: 'absolute', right: 56, top: 760, opacity: Math.min(1, llama * 2)}}>
				<Llama size={240} s={Math.min(1.1, llama)} />
			</div>
		</AbsoluteFill>
	);
};

/** "Gracias, familias, por compartir este día con nosotros." */
const Gracias: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.gracias;
	const s = ease(f, a, b, Easing.linear);
	return (
		<AbsoluteFill style={{background: C.crema}}>
			<div style={{position: 'absolute', left: 56, right: 56, top: 250}}>
				<Titulo at={a} parts={['Gracias, ', 'familias,', ' por compartir este día con nosotros']} size={100} wordAts={Ws('c5', ['gracias', 'familias', 'por', 'compartir', 'este', 'día', 'con', 'nosotros'])} />
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, top: 900, height: 620, borderRadius: 32, overflow: 'hidden', boxShadow: '0 24px 60px rgba(19,32,90,0.2)', opacity: ease(f, a + 6, a + 20, out), transform: `translateY(${(1 - ease(f, a + 6, a + 24, out)) * 80}px)`}}>
				<Img src={staticFile('img/campadia/ronda-fuego.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 70%', transform: `scale(${1.05 + 0.08 * s})`}} />
			</div>
		</AbsoluteFill>
	);
};

const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = ease(f, a, a + 22, out);
	return (
		<AbsoluteFill style={{background: C.crema, alignItems: 'center', opacity: ease(f, a, a + 8)}}>
			<div style={{position: 'absolute', top: 540, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 290, opacity: ease(f, a + 6, a + 26, out)}} />
			</div>
			<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 66, fontWeight: 700, color: C.azul, opacity: ease(f, a + 16, a + 34, out)}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, a + 26, a + 44, out)}}>Sala de 5 · Campadía 2026</div>
		</AbsoluteFill>
	);
};

export const CampadiaSala5: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS, color: C.tinta}}>
		<Audio src={staticFile('campadia/soundtrack.wav')} />
		<Escena range={S.gancho}>
			<Gancho />
		</Escena>
		<Escena range={S.ositos}>
			<Barrido at={S.ositos[0]}>
				<Ositos />
			</Barrido>
		</Escena>
		<Escena range={S.juegos}>
			<Barrido at={S.juegos[0]}>
				<Juegos />
			</Barrido>
		</Escena>
		<Escena range={S.fuego}>
			<Barrido at={S.fuego[0]}>
				<Fuego />
			</Barrido>
		</Escena>
		<Escena range={S.gracias}>
			<Barrido at={S.gracias[0]}>
				<Gracias />
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
