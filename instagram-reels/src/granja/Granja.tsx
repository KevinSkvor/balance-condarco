import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Titulo} from '../ui';
import T from './timeline.json';

const S = T.scenes;

/** Frame global en que la voz dice `word` (n-ésima aparición) en el bloque `id`. */
const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const out = Easing.out(Easing.cubic);

const Escena: React.FC<{range: number[]; children: React.ReactNode; fadeIn?: boolean; fadeOut?: boolean}> = ({range, children, fadeIn = true, fadeOut = true}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	const i = fadeIn ? ease(f, range[0], range[0] + 10) : 1;
	const o = fadeOut ? ease(f, range[1] - 10, range[1]) : 0;
	return <AbsoluteFill style={{opacity: i * (1 - o)}}>{children}</AbsoluteFill>;
};

/** Foto tipo polaroid que entra con resorte y rotación. */
const Polaroid: React.FC<{src: string; x: number; y: number; w: number; h: number; rot: number; at: number; pos?: string; from?: 'bottom' | 'right'; exitAt?: number}> = ({src, x, y, w, h, rot, at, pos = '50% 50%', from = 'bottom', exitAt}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 13, stiffness: 120});
	if (s <= 0.001) return null;
	const ex = exitAt === undefined ? 0 : ease(f, exitAt, exitAt + 12, Easing.in(Easing.cubic));
	const dx = from === 'right' ? (1 - s) * 900 - ex * 1200 : -ex * 1200;
	const dy = from === 'bottom' ? (1 - s) * 900 : 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				padding: 16,
				paddingBottom: 16,
				boxSizing: 'border-box',
				background: C.papel,
				borderRadius: 22,
				boxShadow: '0 22px 50px rgba(27,31,51,0.22)',
				transform: `translate(${dx}px, ${dy}px) rotate(${rot + (1 - s) * (from === 'right' ? 18 : -10) - ex * 20}deg)`,
			}}
		>
			<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, borderRadius: 12, display: 'block'}} />
		</div>
	);
};

/** Globo de onomatopeya. */
const Globo: React.FC<{text: string; x: number; y: number; at: number; color: string; ink?: string; size?: number; until?: number}> = ({text, x, y, at, color, ink = C.tinta, size = 92, until}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 8, stiffness: 200});
	if (s <= 0.001) return null;
	const o = until === undefined ? 1 : 1 - ease(f, until, until + 8);
	const wob = Math.sin((f - at) / 4) * 3;
	return (
		<div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s}) rotate(${-6 + wob}deg)`, opacity: o}}>
			<div style={{position: 'relative', padding: '18px 40px 24px', borderRadius: 999, background: color, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap', boxShadow: '0 12px 30px rgba(27,31,51,0.18)'}}>
				{text}
				<div style={{position: 'absolute', left: 60, bottom: -26, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `34px solid ${color}`, transform: 'rotate(20deg)'}} />
			</div>
		</div>
	);
};

const Pill: React.FC<{text: string; at: number; top: number; color: string; ink?: string; until?: number}> = ({text, at, top, color, ink = C.papel, until}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 12, stiffness: 170});
	const o = until === undefined ? 1 : 1 - ease(f, until, until + 8);
	return (
		<div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(1, s * 2) * o}}>
			<div style={{padding: '16px 42px', borderRadius: 999, background: color, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, transform: `scale(${s})`}}>{text}</div>
		</div>
	);
};

// ───────────────────────── decoración dibujada ─────────────────────────

const Sol: React.FC = () => {
	const f = useCurrentFrame();
	const s = sp(f, 4, {damping: 10, stiffness: 120});
	return (
		<svg width={260} height={260} viewBox="-130 -130 260 260" style={{position: 'absolute', right: 30, top: 190, transform: `scale(${s})`}}>
			<g transform={`rotate(${f * 0.6})`}>
				{Array.from({length: 12}, (_, i) => (
					<line key={i} x1={0} y1={-80} x2={0} y2={-112} stroke={C.sol} strokeWidth={10} strokeLinecap="round" transform={`rotate(${i * 30})`} />
				))}
			</g>
			<circle r={64} fill={C.sol} />
			<circle cx={-20} cy={-8} r={6} fill={C.tinta} />
			<circle cx={20} cy={-8} r={6} fill={C.tinta} />
			<path d="M-22 16 Q0 36 22 16" fill="none" stroke={C.tinta} strokeWidth={6} strokeLinecap="round" />
		</svg>
	);
};

const Nube: React.FC<{y: number; speed: number; offset: number; scale: number}> = ({y, speed, offset, scale}) => {
	const f = useCurrentFrame();
	const x = ((offset + f * speed) % 1400) - 250;
	return (
		<svg width={260} height={120} viewBox="0 0 260 120" style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, opacity: 0.95}}>
			<g fill={C.papel} stroke={C.celeste} strokeWidth={4}>
				<path d="M40 100 a35 35 0 0 1 10-68 a45 45 0 0 1 82-12 a38 38 0 0 1 70 20 a30 30 0 0 1 18 60 z" />
			</g>
		</svg>
	);
};

/** Cerca de madera dibujada al pie de la pantalla. */
const Cerca: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	const p = ease(f, at, at + 30, out);
	return (
		<svg width={1080} height={200} style={{position: 'absolute', left: 0, top: 1560}}>
			{Array.from({length: 9}, (_, i) => {
				const x = 30 + i * 130;
				const pr = ease(f, at + i * 2, at + i * 2 + 14, out);
				return <path key={i} d={`M${x} 160 V${30} l18 -20 l18 20 V160`} fill={C.doradoClaro} stroke={C.bordo} strokeWidth={5} strokeLinejoin="round" opacity={pr} transform={`translate(0 ${(1 - pr) * 60})`} />;
			})}
			<rect x={0} y={60} width={1080 * p} height={16} rx={8} fill={C.bordo} />
			<rect x={0} y={115} width={1080 * p} height={16} rx={8} fill={C.bordo} />
		</svg>
	);
};

const Huella: React.FC<{x: number; y: number; rot: number; o: number}> = ({x, y, rot, o}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} fill={C.sol}>
		<ellipse cx={0} cy={8} rx={14} ry={12} />
		<circle cx={-14} cy={-10} r={5} />
		<circle cx={-5} cy={-16} r={5} />
		<circle cx={5} cy={-16} r={5} />
		<circle cx={14} cy={-10} r={5} />
	</g>
);

/** Granero de línea que se dibuja. */
const Granero: React.FC<{progress: number}> = ({progress}) => {
	const paths = ['M60 360 V170 L230 60 L400 170 V360 Z', 'M150 360 V250 H310 V360', 'M150 250 L310 360', 'M310 250 L150 360', 'M190 160 H270 V215 H190 Z', 'M20 360 H440'];
	return (
		<svg width={460} height={400} viewBox="0 0 460 400">
			<path d="M60 360 V170 L230 60 L400 170 V360 Z" fill={C.bordo} opacity={0.12 * progress} />
			{paths.map((d, i) => (
				<path key={i} d={d} fill="none" stroke={C.bordo} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, progress * 1.6 - i * 0.12))} />
			))}
		</svg>
	);
};

// ───────────────────────── escenas ─────────────────────────

/** 0–4 s · "¡Sala de 3 se fue de paseo a la granja!" */
const Llegada: React.FC = () => {
	const f = useCurrentFrame();
	const granero = ease(f, 6, 46, out);
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 420, width: '100%', display: 'flex', justifyContent: 'center', transform: `scale(${0.9 + 0.1 * granero})`}}>
				<Granero progress={granero} />
			</div>
			<div style={{position: 'absolute', top: 900, left: 64, right: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
				<div style={{fontFamily: SANS, fontSize: 34, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo, opacity: ease(f, 10, 24)}}>JARDÍN · SALA DE 3</div>
				<Titulo at={0} parts={['¡De paseo por la ', 'granja!']} size={120} align="center" wordAts={[W('g1', 'paseo') - 8, W('g1', 'paseo'), W('g1', 'paseo') + 8, W('g1', 'la'), W('g1', 'granja')]} />
			</div>
		</AbsoluteFill>
	);
};

/** 4–8 s · "Caminamos juntos, de la mano, para descubrir a los animales." */
const Camino: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.camino;
	const pasos = Array.from({length: 12}, (_, i) => ({x: 90 + i * 82, y: 1500 + (i % 2 ? -22 : 22), at: a + 8 + i * 9}));
	return (
		<AbsoluteFill>
			<Polaroid src="img/granja/camino.jpg" x={70} y={360} w={560} h={820} rot={-7} at={W('g2', 'caminamos') - 2} pos="50% 60%" />
			<Polaroid src="img/granja/fila.jpg" x={460} y={430} w={560} h={760} rot={6} at={W('g2', 'mano') - 6} pos="40% 60%" />
			<Polaroid src="img/granja/camino-vaca.jpg" x={250} y={700} w={560} h={760} rot={-2} at={W('g2', 'descubrir') - 4} pos="50% 55%" />
			<Pill text="¡De la mano!" at={W('g2', 'mano')} top={250} color={C.celeste} />
			<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
				{pasos.map((p, i) => (
					<Huella key={i} x={p.x} y={p.y} rot={90} o={ease(f, p.at, p.at + 6) * (1 - ease(f, p.at + 40, p.at + 60))} />
				))}
			</svg>
		</AbsoluteFill>
	);
};

const ANIMALES = [
	{word: 'vaca', src: 'img/granja/vaca.jpg', pos: '50% 35%', grito: '¡Muuu!', nombre: 'La vaca', color: C.sol, ink: C.tinta},
	{word: 'cabras', src: 'img/granja/cabras.jpg', pos: '50% 30%', grito: '¡Meee!', nombre: 'Las cabras', color: C.celeste, ink: C.papel},
	{word: 'chancho', src: 'img/granja/chancho.jpg', pos: '50% 60%', grito: '¡Oinc!', nombre: 'El chancho', color: C.bordo, ink: C.papel},
	{word: 'pato', src: 'img/granja/pato.jpg', pos: '50% 55%', grito: '¡Cuac!', nombre: 'El pato', color: C.sol, ink: C.tinta},
	{word: 'ovejas', src: 'img/granja/oveja.jpg', pos: '50% 40%', grito: '¡Beee!', nombre: 'Las ovejas', color: C.celeste, ink: C.papel},
	{word: 'caballo', src: 'img/granja/caballo.jpg', pos: '55% 50%', grito: '¡Iiih!', nombre: 'El caballo', color: C.bordo, ink: C.papel},
	{word: 'burro', src: 'img/granja/burro.jpg', pos: '35% 45%', grito: '¡I-aaa!', nombre: 'El burro', color: C.sol, ink: C.tinta},
];

/** 8–18 s · Desfile de animales, cada uno cuando la voz lo nombra. */
const Animales: React.FC = () => {
	const f = useCurrentFrame();
	const llamas = W('g3', 'llamas');
	const ats = ANIMALES.map((a) => W('g3', a.word));
	const actual = ats.filter((t) => f >= t - 4).length - 1;
	const fondo = actual >= 0 && f < llamas - 4 ? ANIMALES[actual].color : C.doradoClaro;
	const pulso = actual >= 0 ? sp(f, ats[actual] - 4, {damping: 10, stiffness: 140}) : 0;
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 540 - 430, top: 920 - 430, width: 860, height: 860, borderRadius: '50%', background: fondo, opacity: 0.35, transform: `scale(${0.85 + 0.15 * pulso})`}} />
			{ANIMALES.map((a, i) => (
				<React.Fragment key={a.word}>
					<Polaroid src={a.src} x={190} y={420} w={700} h={980} rot={i % 2 ? 4 : -4} at={ats[i] - 6} pos={a.pos} from="right" exitAt={(ats[i + 1] ?? llamas) - 6} />
					<Globo text={a.grito} x={720} y={420} at={ats[i]} color={a.color} ink={a.ink} until={(ats[i + 1] ?? llamas) - 8} />
					<Pill text={a.nombre} at={ats[i] + 2} top={1440} color={a.color} ink={a.ink} until={(ats[i + 1] ?? llamas) - 8} />
				</React.Fragment>
			))}
			{/* ¡y hasta las llamas! */}
			<Polaroid src="img/granja/llama.jpg" x={40} y={470} w={520} h={720} rot={-6} at={W('g3', 'hasta') - 2} pos="45% 40%" from="right" />
			<Polaroid src="img/granja/llama-negra.jpg" x={520} y={560} w={520} h={720} rot={5} at={llamas - 4} pos="50% 40%" from="right" />
			<Globo text="¡Hola!" x={560} y={430} at={llamas + 2} color={C.sol} />
			<Pill text="¡Y las llamas!" at={llamas} top={1340} color={C.bordo} />
		</AbsoluteFill>
	);
};

/** 18–21.7 s · "Les dimos de comer y aprendimos a cuidarlos." */
const Comer: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.comer;
	const corazon = sp(f, W('g4', 'cuidarlos'), {damping: 8, stiffness: 180});
	const late = 1 + 0.08 * Math.sin((f - W('g4', 'cuidarlos')) / 3);
	return (
		<AbsoluteFill>
			<Polaroid src="img/granja/comer.jpg" x={70} y={330} w={620} h={680} rot={-5} at={a + 6} pos="50% 50%" />
			<Globo text="¡Ñam!" x={640} y={360} at={W('g4', 'comer')} color={C.sol} />
			<Polaroid src="img/granja/guia.jpg" x={470} y={860} w={520} h={680} rot={5} at={W('g4', 'aprendimos') - 4} pos="50% 70%" />
			{corazon > 0.01 && (
				<svg width={200} height={200} viewBox="-100 -100 200 200" style={{position: 'absolute', left: 200, top: 1130, transform: `scale(${corazon * late})`}}>
					<path d="M0 60 C -80 10, -70 -60, -20 -55 C 0 -52, 0 -35, 0 -30 C 0 -35, 0 -52, 20 -55 C 70 -60, 80 10, 0 60 Z" fill={C.bordo} />
				</svg>
			)}
		</AbsoluteFill>
	);
};

/** 21.7–25.4 s · "¡Qué lindo es aprender jugando!" */
const Final: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.final;
	const r = ease(f, a - 4, a + 18, out);
	const words = ['qué', 'lindo', 'es', 'aprender', 'jugando'].map((w) => W('g5', w));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 540 - 1200, top: 900 - 1200, width: 2400, height: 2400, borderRadius: '50%', background: C.sol, transform: `scale(${r})`}} />
			<svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.8}}>
				{Array.from({length: 26}, (_, i) => {
					const t = f - a - random(`cf${i}`) * 30;
					if (t < 0) return null;
					const x = random(`cx${i}`) * 1080 + Math.sin(t / 8 + i) * 30;
					const y = -60 + t * (7 + random(`cv${i}`) * 6);
					const col = [C.celeste, C.bordo, C.papel, C.azul][i % 4];
					return i % 3 ? (
						<rect key={i} x={x} y={y} width={18} height={28} rx={4} fill={col} transform={`rotate(${t * 6} ${x + 9} ${y + 14})`} />
					) : (
						<path key={i} d={`M${x} ${y} l8 18 20 2 -15 13 5 20 -18 -10 -18 10 5 -20 -15 -13 20 -2z`} fill={col} />
					);
				})}
			</svg>
			<div style={{position: 'absolute', top: 700, left: 64, right: 64, opacity: 1 - ease(f, b - 10, b)}}>
				<Titulo at={a} parts={['¡Qué lindo es aprender ', 'jugando!']} size={132} align="center" color={C.tinta} accent={C.bordo} wordAts={words} />
			</div>
		</AbsoluteFill>
	);
};

/** 25.4–29 s · Cierre sin voz. */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = sp(f, a + 4, {damping: 12, stiffness: 120});
	const nombre = ease(f, a + 20, a + 40, out);
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 440, width: 480, height: 480, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 300}} />
			</div>
			<div style={{position: 'absolute', top: 1010, fontFamily: SANS, fontSize: 36, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo, opacity: nombre}}>JARDÍN · SALA DE 3</div>
			<div style={{position: 'absolute', top: 1070, fontFamily: DISPLAY, fontSize: 72, fontWeight: 700, color: C.azul, opacity: nombre, transform: `translateY(${(1 - nombre) * 16}px)`}}>Instituto Álvarez Condarco</div>
		</AbsoluteFill>
	);
};

export const GranjaSala3: React.FC = () => {
	const f = useCurrentFrame();
	const deco = f < S.final[0] + 4;
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
			<Audio src={staticFile('granja/soundtrack.wav')} />
			{deco && (
				<>
					<Nube y={250} speed={1.2} offset={100} scale={1} />
					<Nube y={150} speed={0.8} offset={760} scale={0.7} />
					<Sol />
					<Cerca at={20} />
				</>
			)}
			<Escena range={S.llegada} fadeIn={false}>
				<Llegada />
			</Escena>
			<Escena range={S.camino}>
				<Camino />
			</Escena>
			<Escena range={S.animales}>
				<Animales />
			</Escena>
			<Escena range={S.comer}>
				<Comer />
			</Escena>
			<Escena range={S.final} fadeIn={false}>
				<Final />
			</Escena>
			<Escena range={S.cierre} fadeOut={false}>
				<Cierre />
			</Escena>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
