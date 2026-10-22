import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Check, Titulo, Volanta} from '../ui';
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

const Escena: React.FC<{range: number[]; children: React.ReactNode; fadeOut?: boolean}> = ({range, children, fadeOut = true}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	const i = ease(f, range[0], range[0] + 12);
	const o = fadeOut ? ease(f, range[1] - 12, range[1]) : 0;
	return <AbsoluteFill style={{opacity: i * (1 - o), transform: `translateY(${(1 - i) * 24}px)`}}>{children}</AbsoluteFill>;
};

/**
 * Video real del simulacro en una tarjeta redondeada, con un tono cálido suave.
 * Arranca cuando empieza su escena (startAt) y queda en silencio: el audio es la banda sonora.
 */
const VideoCard: React.FC<{src: string; startAt: number; top: number; height: number; pos?: string}> = ({src, startAt, top, height, pos = '50% 50%'}) => {
	const f = useCurrentFrame();
	const s = ease(f, startAt, startAt + 16, out);
	return (
		<div style={{position: 'absolute', left: 56, right: 56, top, height, borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 60px rgba(19,32,90,0.18)', clipPath: `inset(${(1 - s) * 40}% 0 ${(1 - s) * 40}% 0 round 28px)`}}>
			{/* la Sequence hace que el video empiece desde su segundo 0 cuando arranca la escena */}
			<Sequence from={startAt} layout="none">
				<OffthreadVideo
					src={staticFile(src)}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter: 'sepia(0.12) saturate(1.05) contrast(1.03)', transform: `scale(${1.08 - 0.06 * ease(f, startAt, startAt + 150, Easing.linear)})`}}
				/>
			</Sequence>
		</div>
	);
};

/** Ícono de línea (estilo Lucide) que se dibuja. */
const ICONOS: Record<string, string[]> = {
	calma: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z', 'M8 11h1.5l1.5-2 2 4 1.5-2H16'],
	docente: ['M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M3 21v-5a5 5 0 0 1 10 0v5', 'M15 4v10', 'M15 4l6 2-6 2'],
	orden: ['M14 4h5v16h-5', 'M3 12h11', 'M10 8l4 4-4 4'],
	campana: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
};
const Icono: React.FC<{name: string; size: number; color: string; progress: number}> = ({name, size, color, progress}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		{ICONOS[name].map((d, i) => (
			<path key={i} d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
		))}
	</svg>
);

// ───────────────────────── escenas ─────────────────────────

/** 0–5 s · "Esta semana, todo el colegio participó de un simulacro de evacuación." */
const Inicio: React.FC = () => {
	const sim = W('s1', 'simulapro');
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 230, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 16}}>
				<Volanta at={W('s1', 'todo')}>TODO EL COLEGIO</Volanta>
				<Titulo at={0} parts={['Simulacro de ', 'evacuación']} size={104} wordAts={[sim - 4, sim + 8, W('s1', 'evacuación')]} />
			</div>
			<VideoCard src="video/simulacro/wa0090.mp4" startAt={4} top={560} height={920} pos="50% 55%" />
		</AbsoluteFill>
	);
};

/** 5–11 s · "Jardín, Primaria y Secundaria practicamos juntos qué hacer si suena la alarma." */
const Niveles: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.niveles;
	const niveles: [string, string, string, number][] = [
		['Jardín', C.sol, C.tinta, W('s2', 'jardín')],
		['Primaria', C.celeste, C.papel, W('s2', 'primaria')],
		['Secundaria', C.bordo, C.papel, W('s2', 'secundaria')],
	];
	const al = W('s2', 'alarma');
	const campana = sp(f, al - 4, {damping: 9, stiffness: 180});
	const balanceo = Math.sin((f - al) / 2.5) * 14 * Math.exp(-Math.max(0, f - al) / 18);
	return (
		<AbsoluteFill>
			<VideoCard src="video/simulacro/wa0091.mp4" startAt={a} top={230} height={940} pos="50% 70%" />
			<div style={{position: 'absolute', top: 1220, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
				{niveles.map(([t, bg, ink, at]) => {
					const s = sp(f, at - 2, {damping: 12, stiffness: 170});
					return (
						<div key={t} style={{padding: '16px 36px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, opacity: Math.min(1, s * 2), transform: `scale(${s})`}}>
							{t}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.tintaSuave, opacity: ease(f, W('s2', 'practicamos'), W('s2', 'practicamos') + 14)}}>
				practicamos juntos
			</div>
			{campana > 0.01 && (
				<div style={{position: 'absolute', left: 820, top: 160, width: 200, height: 200, borderRadius: '50%', background: C.papel, boxShadow: '0 16px 40px rgba(19,32,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${campana})`}}>
					{[1, 2].map((k) => {
						const r = ease(f, al + k * 6, al + k * 6 + 24, out);
						return <div key={k} style={{position: 'absolute', inset: -r * 40, borderRadius: '50%', border: `4px solid ${C.sol}`, opacity: 1 - r}} />;
					})}
					<div style={{transform: `rotate(${balanceo}deg)`, transformOrigin: '50% 10%'}}>
						<Icono name="campana" size={110} color={C.bordo} progress={1} />
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

/** 11–16 s · "Mantener la calma, seguir a nuestros docentes y salir en orden." */
const Pasos: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.pasos;
	const pasos: [string, string, string, number][] = [
		['calma', 'Mantener la calma', C.celeste, W('s3', 'calma')],
		['docente', 'Seguir a los docentes', C.bordo, W('s3', 'seguir')],
		['orden', 'Salir en orden', C.azul, W('s3', 'orden') - 6],
	];
	return (
		<AbsoluteFill>
			<VideoCard src="video/simulacro/wa0095.mp4" startAt={a} top={230} height={820} pos="50% 60%" />
			{pasos.map(([icon, label, color, at], i) => {
				const s = sp(f, at - 4, {damping: 14, stiffness: 150});
				const d = ease(f, at, at + 18, out);
				return (
					<div key={icon} style={{position: 'absolute', top: 1090 + i * 124, left: 56, right: 56, height: 108, display: 'flex', alignItems: 'center', gap: 24, padding: '0 28px', borderRadius: 24, background: C.papel, border: `2px solid ${C.linea}`, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 200}px)`}}>
						<div style={{width: 72, height: 72, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Icono name={icon} size={44} color={C.papel} progress={d} />
						</div>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: C.azul}}>{label}</div>
						<div style={{marginLeft: 'auto', opacity: d}}>
							<Check size={52} color={color} progress={d} />
						</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** 16–20.5 s · "Hasta llegar al punto de encuentro, donde nos aseguramos de que estemos todos." Plano animado. */
const Encuentro: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.encuentro;
	const punto = W('s4', 'punto');
	const todos = W('s4', 'todos');
	const plano = ease(f, a, a + 26, out);
	const rutas = ease(f, a + 10, punto + 6, Easing.inOut(Easing.quad));
	const pin = sp(f, W('s4', 'encuentro') - 4, {damping: 9, stiffness: 170});
	const reunion = ease(f, W('s4', 'aseguramos') - 10, todos - 4);
	const ok = sp(f, todos, {damping: 9, stiffness: 160});
	// aulas → puerta → punto de encuentro (coordenadas del SVG del plano, 1080×640)
	const aulas = [
		{x: 180, y: 150},
		{x: 400, y: 150},
		{x: 610, y: 150},
		{x: 180, y: 380},
		{x: 400, y: 380},
	];
	const puerta = {x: 730, y: 400};
	const meet = {x: 900, y: 330};
	return (
		<AbsoluteFill>
			<VideoCard src="video/simulacro/wa0099.mp4" startAt={a} top={230} height={520} pos="50% 70%" />
			<svg width={1080} height={640} viewBox="0 0 1080 640" style={{position: 'absolute', top: 780, left: 0, opacity: plano}}>
				{/* edificio */}
				<rect x={70} y={40} width={660} height={480} rx={24} fill={C.papel} stroke={C.azul} strokeWidth={6} />
				{aulas.map((c, i) => (
					<rect key={i} x={c.x - 90} y={c.y - 85} width={180} height={170} rx={14} fill={C.crema} stroke={C.linea} strokeWidth={4} />
				))}
				<rect x={puerta.x - 12} y={puerta.y - 55} width={24} height={110} rx={6} fill={C.sol} />
				{/* rutas de evacuación */}
				{aulas.map((c, i) => {
					const d = `M${c.x} ${c.y} C ${c.x + 110} ${c.y + 60}, ${puerta.x - 140} ${puerta.y}, ${puerta.x} ${puerta.y} L ${meet.x} ${meet.y + 40}`;
					return <path key={i} d={d} fill="none" stroke={C.bordo} strokeWidth={6} strokeLinecap="round" pathLength={1} style={{strokeDasharray: `${rutas} 1`}} opacity={0.85} />;
				})}
				{/* grupos de chicos (puntos) que van al punto de encuentro */}
				{aulas.map((c, i) =>
					Array.from({length: 4}, (_, k) => {
						const t = Math.min(1, Math.max(0, reunion * 1.2 - i * 0.05 - k * 0.03));
						const n = i * 4 + k;
						const x = interpolate(t, [0, 0.6, 1], [c.x - 30 + k * 20, puerta.x, meet.x - 66 + (n % 7) * 22]);
						const y = interpolate(t, [0, 0.6, 1], [c.y + 40, puerta.y, meet.y + 70 + Math.floor(n / 7) * 22]);
						return <circle key={`${i}-${k}`} cx={x} cy={y} r={9} fill={[C.sol, C.celeste, C.bordo][(i + k) % 3]} />;
					}),
				)}
				{/* punto de encuentro */}
				<g transform={`translate(${meet.x} ${meet.y + 30}) scale(${pin})`}>
					<path d="M0 0 C -40 -40, -40 -90, 0 -90 C 40 -90, 40 -40, 0 0 Z" fill={C.azul} />
					<circle cx={0} cy={-58} r={14} fill={C.papel} />
				</g>
				<text x={meet.x} y={meet.y + 170} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.1em', fill: C.azul, opacity: pin}}>
					PUNTO DE ENCUENTRO
				</text>
			</svg>
			{ok > 0.01 && (
				<div style={{position: 'absolute', top: 1440, width: '100%', display: 'flex', justifyContent: 'center'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 34px', borderRadius: 999, background: C.azul, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, transform: `scale(${ok})`}}>
						<Check size={52} color={C.papel} progress={ease(f, todos, todos + 14)} />
						¡Estamos todos!
					</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

/** 20.5–24.4 s · "Porque estar preparados también es cuidarnos." */
const Cuidarnos: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cuidarnos;
	const banda = ease(f, a + 4, a + 22, out);
	const words = [W('s5', 'estar'), W('s5', 'preparados'), W('s5', 'también'), W('s5', 'es'), W('s5', 'cuidarnos')];
	return (
		<AbsoluteFill>
			<VideoCard src="video/simulacro/wa0094.mp4" startAt={a} top={230} height={880} pos="50% 75%" />
			<div style={{position: 'absolute', left: 0, right: 0, top: 1150, height: 380, background: C.noche, clipPath: `inset(0 ${(1 - banda) * 100}% 0 0)`}}>
				<div style={{position: 'absolute', top: 60, left: 64, right: 64}}>
					<Titulo at={a} parts={['Estar preparados también es ', 'cuidarnos']} size={92} color={C.papel} accent={C.doradoClaro} wordAts={words} />
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** 24.4–28 s · Cierre sin voz. */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = ease(f, a + 4, a + 36, out);
	const nombre = ease(f, a + 26, a + 50, out);
	const lema = ease(f, a + 40, a + 64, out);
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 440, width: 480, height: 480, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.92 + 0.08 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 300, opacity: ease(f, a + 10, a + 40, out)}} />
			</div>
			<div style={{position: 'absolute', top: 1010, fontFamily: DISPLAY, fontSize: 72, fontWeight: 700, color: C.azul, opacity: nombre}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1110, fontFamily: SANS, fontSize: 38, color: C.tintaSuave, opacity: lema}}>Un estilo en pos de la excelencia</div>
		</AbsoluteFill>
	);
};

export const Simulacro: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
			<Audio src={staticFile('simulacro/soundtrack.wav')} />
			<Escena range={S.inicio}>
				<Inicio />
			</Escena>
			<Escena range={S.niveles}>
				<Niveles />
			</Escena>
			<Escena range={S.pasos}>
				<Pasos />
			</Escena>
			<Escena range={S.encuentro}>
				<Encuentro />
			</Escena>
			<Escena range={S.cuidarnos}>
				<Cuidarnos />
			</Escena>
			<Escena range={S.cierre} fadeOut={false}>
				<Cierre />
			</Escena>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
				{[C.sol, C.celeste, C.bordo].map((c, i) => (
					<div key={c} style={{flex: 1, background: c, transform: `scaleX(${ease(f, i * 4, 20 + i * 4, out)})`, transformOrigin: 'left'}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
