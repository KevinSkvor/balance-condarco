import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, SHADOW, clamp, sp} from '../lib';
import {Check, Titulo, Tricolor, Volanta} from '../ui';
import T from './timeline.json';

const S = T.scenes;

/** Frame global en que la voz dice `word` dentro del bloque `id`. */
const W = (id: string, word: string) => {
	const v = T.vo.find((x) => x.id === id)!;
	const w = v.words.find(([text]) => text === word)!;
	return v.at + Math.round((w[1] as number) * T.fps);
};

const ease = (f: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});

/** Entrada y salida suaves de cada escena (fundido + leve desplazamiento). */
const Escena: React.FC<{range: number[]; children: React.ReactNode; fadeIn?: boolean; fadeOut?: boolean}> = ({range, children, fadeIn = true, fadeOut = true}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	const i = fadeIn ? ease(f, range[0], range[0] + 14) : 1;
	const o = fadeOut ? ease(f, range[1] - 14, range[1]) : 0;
	return <AbsoluteFill style={{opacity: i * (1 - o), transform: `translateY(${(1 - i) * 30 - o * 30}px)`}}>{children}</AbsoluteFill>;
};

/** Signo de pregunta dibujado a mano que se traza y flota. */
const Signo: React.FC<{x: number; y: number; size: number; color: string; at: number; seed: number; gather?: number}> = ({x, y, size, color, at, seed, gather = 0}) => {
	const f = useCurrentFrame();
	const draw = ease(f, at, at + 22, Easing.out(Easing.cubic));
	const dot = sp(f, at + 18, {damping: 10, stiffness: 180});
	const fx = Math.sin((f + seed * 40) / 34) * 14;
	const fy = Math.cos((f + seed * 25) / 41) * 18;
	const rot = (random(`rot${seed}`) - 0.5) * 30 + Math.sin((f + seed * 10) / 50) * 6;
	const gx = interpolate(gather, [0, 1], [x + fx, 540]);
	const gy = interpolate(gather, [0, 1], [y + fy, 700]);
	return (
		<svg
			width={size}
			height={size * 1.5}
			viewBox="0 0 40 60"
			style={{position: 'absolute', left: gx - size / 2, top: gy - size * 0.75, transform: `rotate(${rot}deg) scale(${1 - gather * 0.7})`, opacity: 1 - gather}}
		>
			<path
				d="M8 16 C 8 4, 32 2, 32 16 C 32 26, 20 26, 20 38"
				fill="none"
				stroke={color}
				strokeWidth={5.5}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1 - draw}
			/>
			<circle cx={20} cy={50} r={4} fill={color} transform={`scale(${dot})`} style={{transformOrigin: '20px 50px'}} />
		</svg>
	);
};

const SIGNOS = [
	{x: 200, y: 330, size: 120, color: C.bordo},
	{x: 520, y: 260, size: 90, color: C.celeste},
	{x: 860, y: 360, size: 130, color: C.sol},
	{x: 330, y: 620, size: 100, color: C.azul},
	{x: 720, y: 600, size: 150, color: C.bordo},
	{x: 140, y: 860, size: 80, color: C.sol},
	{x: 920, y: 820, size: 95, color: C.celeste},
	{x: 520, y: 880, size: 70, color: C.dorado},
];

/** 0–5 s · "Crecer viene con muchas preguntas. Y está bien hacerlas." */
const Preguntas: React.FC = () => {
	const f = useCurrentFrame();
	const gather = ease(f, S.preguntas[1] - 22, S.preguntas[1]);
	const sub = sp(f, W('s1', 'está'), {damping: 18});
	return (
		<AbsoluteFill>
			{SIGNOS.map((s, i) => (
				<Signo key={i} {...s} at={4 + i * 6} seed={i} gather={gather} />
			))}
			<div style={{position: 'absolute', top: 1060, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 28, opacity: 1 - gather}}>
				<Titulo at={0} parts={['Crecer viene con ', 'preguntas']} size={118} wordAts={[12, 20, 30, W('s1', 'preguntas')]} />
				<div style={{fontFamily: SANS, fontSize: 48, color: C.tintaSuave, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>Y está bien hacerlas.</div>
			</div>
		</AbsoluteFill>
	);
};

/** Globo de diálogo. */
const Globo: React.FC<{w: number; h: number; fill: string; stroke?: string; tail: 'left' | 'right'; children?: React.ReactNode; style?: React.CSSProperties}> = ({
	w,
	h,
	fill,
	stroke,
	tail,
	children,
	style,
}) => (
	<div style={{position: 'absolute', width: w, height: h, ...style}}>
		<svg width={w} height={h + 26} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<path
				d={
					tail === 'left'
						? `M24 0 H${w - 24} Q${w} 0 ${w} 24 V${h - 24} Q${w} ${h} ${w - 24} ${h} H64 L30 ${h + 26} L38 ${h} H24 Q0 ${h} 0 ${h - 24} V24 Q0 0 24 0 Z`
						: `M24 0 H${w - 24} Q${w} 0 ${w} 24 V${h - 24} Q${w} ${h} ${w - 24} ${h} H${w - 38} L${w - 30} ${h + 26} L${w - 64} ${h} H24 Q0 ${h} 0 ${h - 24} V24 Q0 0 24 0 Z`
				}
				fill={fill}
				stroke={stroke ?? 'none'}
				strokeWidth={3}
				style={{filter: 'drop-shadow(0 10px 24px rgba(19,32,90,0.12))'}}
			/>
		</svg>
		<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>{children}</div>
	</div>
);

/** 5–13 s · "…tienen un espacio para preguntar, escuchar y aprender a cuidarse." */
const Espacio: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.espacio;
	const foto = sp(f, a + 6, {damping: 20, stiffness: 80});
	const reveal = ease(f, a + 4, a + 26, Easing.out(Easing.cubic));
	const zoom = 1.12 - 0.1 * ease(f, a, S.espacio[1], Easing.linear);
	const bubbles = [
		{at: a + 26, x: 640, y: 470, w: 150, h: 96, fill: C.papel, tail: 'left' as const, txt: '?'},
		{at: a + 40, x: 800, y: 560, w: 128, h: 84, fill: C.sol, tail: 'right' as const, txt: '?'},
		{at: a + 54, x: 600, y: 620, w: 116, h: 76, fill: C.papel, tail: 'left' as const, txt: '…'},
	];
	const palabras: [string, number, string][] = [
		['Preguntar', W('s2', 'preguntar'), C.bordo],
		['Escuchar', W('s2', 'escuchar'), C.celeste],
		['Cuidarse', W('s2', 'cuidarse'), C.azul],
	];
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 220, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a + 4}>4.º AÑO · SALUD Y ADOLESCENCIA</Volanta>
				<Titulo at={a + 8} parts={['Un espacio para ', 'preguntar']} size={92} wordAts={[a + 8, a + 12, a + 16, W('s2', 'preguntar')]} />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 470,
					left: 64,
					right: 64,
					height: 860,
					borderRadius: 28,
					overflow: 'hidden',
					transform: `translateY(${(1 - foto) * 80}px)`,
					clipPath: `inset(${(1 - reveal) * 100}% 0 0 0 round 28px)`,
				}}
			>
				<Img src={staticFile('img/salud/charla-1.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 40%', transform: `scale(${zoom})`}} />
			</div>
			{bubbles.map((b, i) => {
				const s = sp(f, b.at, {damping: 11, stiffness: 160});
				const float = Math.sin((f + i * 30) / 24) * 8;
				return (
					<Globo
						key={i}
						w={b.w}
						h={b.h}
						fill={b.fill}
						stroke={b.fill === C.papel ? C.linea : undefined}
						tail={b.tail}
						style={{left: b.x, top: b.y + float, transform: `scale(${s})`, transformOrigin: b.tail === 'left' ? '20% 100%' : '80% 100%'}}
					>
						<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: b.h * 0.62, color: b.fill === C.sol ? C.tinta : C.bordo, marginTop: -6}}>{b.txt}</span>
					</Globo>
				);
			})}
			<div style={{position: 'absolute', top: 1366, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
				{palabras.map(([txt, at, col]) => {
					const s = sp(f, at, {damping: 12, stiffness: 170});
					return (
						<div
							key={txt}
							style={{
								padding: '16px 34px',
								borderRadius: 999,
								background: col,
								color: C.papel,
								fontFamily: SANS,
								fontSize: 40,
								fontWeight: 700,
								opacity: Math.min(1, s * 2),
								transform: `scale(${s}) translateY(${(1 - s) * 20}px)`,
							}}
						>
							{txt}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/** 13–20 s · "…la licenciada en nutrición Marina Ruiz nos acompañó…" */
const Charla: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.charla;
	const reveal = ease(f, a + 2, a + 24, Easing.out(Easing.cubic));
	const zoom = 1.14 - 0.1 * ease(f, a, b, Easing.linear);
	const tarjeta = sp(f, W('s3', 'Marina') - 4, {damping: 15, stiffness: 140});
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 220, left: 64, right: 64, height: 720, borderRadius: 28, overflow: 'hidden', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0 round 28px)`}}>
				<Img src={staticFile('img/salud/charla-2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 50%', transform: `scale(${zoom})`}} />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 880,
					left: 100,
					display: 'flex',
					alignItems: 'center',
					gap: 22,
					padding: '22px 34px 22px 22px',
					borderRadius: 999,
					background: C.papel,
					boxShadow: SHADOW,
					transform: `scale(${tarjeta}) translateY(${(1 - tarjeta) * 30}px)`,
					transformOrigin: 'left center',
					opacity: Math.min(1, tarjeta * 2),
				}}
			>
				<div style={{width: 76, height: 76, borderRadius: 99, background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
						<circle cx="12" cy="13" r="8" />
						<circle cx="12" cy="13" r="4" />
						<path d="M12 2v3" />
					</svg>
				</div>
				<div>
					<div style={{fontFamily: DISPLAY, fontSize: 40, fontWeight: 700, color: C.azul, lineHeight: 1.1}}>Lic. Marina Ruiz</div>
					<div style={{fontFamily: SANS, fontSize: 28, fontWeight: 600, color: C.tintaSuave}}>Nutricionista</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: 1090, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a + 10}>CHARLA CON ESPECIALISTA</Volanta>
				<Titulo at={a + 14} parts={['Alimentación y hábitos ', 'saludables']} size={92} wordAts={[W('s3', 'alimentación'), W('s3', 'alimentación') + 6, W('s3', 'alimentación') + 12, W('s3', 'saludables')]} />
			</div>
		</AbsoluteFill>
	);
};

/** 20–26 s · "Sin juicios: con información clara y de la mano de profesionales." */
const Profesionales: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.profesionales;
	const q = sp(f, a + 10, {damping: 12, stiffness: 150});
	const r = sp(f, W('s4', 'información'), {damping: 12, stiffness: 150});
	const check = ease(f, W('s4', 'información') + 8, W('s4', 'información') + 22, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', top: 280, left: 0, right: 0, height: 640}}>
				<Globo w={340} h={190} fill={C.papel} stroke={C.linea} tail="left" style={{left: 100, top: 40, transform: `scale(${q})`, transformOrigin: '15% 100%'}}>
					<span style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, color: C.bordo, marginTop: -10}}>?</span>
				</Globo>
				<Globo w={520} h={250} fill={C.azul} tail="right" style={{left: 460, top: 300, transform: `scale(${r})`, transformOrigin: '85% 100%'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '0 36px', width: '100%'}}>
						<div style={{width: 96, height: 96, borderRadius: 99, background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
							<Check size={60} color={C.azul} progress={check} />
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: 16, flex: 1}}>
							{[1, 0.82, 0.6].map((w, i) => (
								<div key={i} style={{height: 16, borderRadius: 8, background: C.papel, opacity: 0.85, width: `${w * 100 * ease(f, W('s4', 'información') + 6 + i * 4, W('s4', 'información') + 18 + i * 4)}%`}} />
							))}
						</div>
					</div>
				</Globo>
			</div>
			<div style={{position: 'absolute', top: 1040, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 20}}>
				<Volanta at={W('s4', 'juicios')}>SIN JUICIOS</Volanta>
				<Titulo
					at={a}
					parts={['Información clara, de la mano de ', 'profesionales']}
					size={92}
					wordAts={[W('s4', 'información'), W('s4', 'información') + 8, a + 85, a + 89, a + 93, a + 97, W('s4', 'profesionales')]}
				/>
			</div>
		</AbsoluteFill>
	);
};

/** 26–31 s · "Porque cada pregunta merece una respuesta seria y cuidada." Banda azul-noche. */
const Respuesta: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.respuesta;
	const inP = ease(f, a - 6, a + 14);
	const outP = ease(f, b - 14, b);
	const words = T.vo.find((v) => v.id === 's5')!.words.map(([w]) => W('s5', w as string));
	const filete = ease(f, W('s5', 'cuidada') + 10, W('s5', 'cuidada') + 30, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill style={{background: C.noche, clipPath: `inset(${(1 - inP) * 100}% 0 ${outP * 100}% 0)`}}>
			<div style={{position: 'absolute', top: 640, left: 72, right: 72}}>
				<Titulo at={a} parts={['Porque cada pregunta merece una respuesta ', 'seria y cuidada']} size={108} color={C.papel} accent={C.doradoClaro} wordAts={words} />
				<svg width={560} height={40} viewBox="0 0 420 40" preserveAspectRatio="none" style={{marginTop: 18}}>
					<path d="M6 26 C 120 8, 260 8, 414 22" fill="none" stroke={C.dorado} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - filete} />
				</svg>
			</div>
		</AbsoluteFill>
	);
};

/** Ícono de línea (estilo Lucide) que se dibuja. */
const Trazo: React.FC<{d: string[]; size: number; progress: number; color?: string}> = ({d, size, progress, color = C.azul}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		{d.map((p, i) => (
			<path key={i} d={p} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
		))}
	</svg>
);

const ESCUELA = ['M3 21h18', 'M5 21V10l7-4 7 4v11', 'M10 21v-5h4v5', 'M12 6V2l4 1.5L12 5', 'M8 12h1', 'M15 12h1'];
const CASA = ['M3 11l9-7 9 7', 'M5 9.5V21h14V9.5', 'M10 21v-6h4v6'];

/** 31–37 s · "Es solo el comienzo de un camino que recorremos juntos: escuela y familias." */
const Juntos: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.juntos;
	const camino = ease(f, W('s6', 'comienzo'), W('s6', 'juntos') + 10, Easing.inOut(Easing.quad));
	const esc = ease(f, W('s6', 'escuela') - 4, W('s6', 'escuela') + 20, Easing.out(Easing.cubic));
	const casa = ease(f, W('s6', 'familias') - 4, W('s6', 'familias') + 20, Easing.out(Easing.cubic));
	const escS = sp(f, W('s6', 'escuela') - 4, {damping: 14});
	const casaS = sp(f, W('s6', 'familias') - 4, {damping: 14});
	const pulso = sp(f, W('s6', 'familias') + 16, {damping: 9, stiffness: 140});
	return (
		<AbsoluteFill>
			<svg width={1080} height={1000} style={{position: 'absolute', top: 260, left: 0}}>
				<path
					d="M 250 470 C 330 180, 540 760, 540 470 S 760 160, 830 470"
					fill="none"
					stroke={C.dorado}
					strokeWidth={10}
					strokeLinecap="round"
					strokeDasharray="2 22"
					opacity={0.9}
					style={{clipPath: `inset(0 ${(1 - camino) * 100}% 0 0)`}}
				/>
				<circle cx={540} cy={470} r={16 * pulso} fill={C.bordo} />
			</svg>
			<div style={{position: 'absolute', top: 570, left: 110, width: 280, height: 280, borderRadius: 999, background: C.doradoClaro, transform: `scale(${escS})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Trazo d={ESCUELA} size={180} progress={esc} />
			</div>
			<div style={{position: 'absolute', top: 570, left: 690, width: 280, height: 280, borderRadius: 999, background: C.doradoClaro, transform: `scale(${casaS})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Trazo d={CASA} size={170} progress={casa} />
			</div>
			<div style={{position: 'absolute', top: 1060, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 20}}>
				<Volanta at={a + 16}>ES SOLO EL COMIENZO</Volanta>
				<Titulo at={a} parts={['Escuela y familias, ', 'juntos']} size={104} wordAts={[W('s6', 'escuela'), W('s6', 'escuela') + 12, W('s6', 'familias'), W('s6', 'familias') + 14]} />
			</div>
		</AbsoluteFill>
	);
};

/** 37–41 s · Cierre sin voz: escudo, nombre y lema como firma. */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = ease(f, a + 4, a + 40, Easing.out(Easing.cubic));
	const escudo = ease(f, a + 12, a + 46, Easing.out(Easing.cubic));
	const nombre = ease(f, a + 34, a + 60, Easing.out(Easing.cubic));
	const lema = ease(f, a + 50, a + 76, Easing.out(Easing.cubic));
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 420, width: 520, height: 520, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.92 + 0.08 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 330, opacity: escudo, transform: `scale(${0.96 + 0.04 * escudo})`}} />
			</div>
			<div style={{position: 'absolute', top: 1040, fontFamily: DISPLAY, fontSize: 72, fontWeight: 700, color: C.azul, letterSpacing: '-0.01em', opacity: nombre, transform: `translateY(${(1 - nombre) * 16}px)`}}>
				Instituto Álvarez Condarco
			</div>
			<div style={{position: 'absolute', top: 1140, fontFamily: SANS, fontSize: 38, color: C.tintaSuave, opacity: lema, transform: `translateY(${(1 - lema) * 12}px)`}}>
				Un estilo en pos de la excelencia
			</div>
		</AbsoluteFill>
	);
};

export const SaludAdolescencia: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
		<Audio src={staticFile('salud/soundtrack.wav')} />
		<Escena range={S.preguntas} fadeIn={false}>
			<Preguntas />
		</Escena>
		<Escena range={S.espacio}>
			<Espacio />
		</Escena>
		<Escena range={S.charla}>
			<Charla />
		</Escena>
		<Escena range={S.profesionales}>
			<Profesionales />
		</Escena>
		<Escena range={S.juntos}>
			<Juntos />
		</Escena>
		<Escena range={S.cierre} fadeOut={false}>
			<Cierre />
		</Escena>
		<RespuestaLayer />
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
			<Tricolor at={S.cierre[0] + 60} height={20} />
		</div>
	</AbsoluteFill>
);

/** La banda azul tapa el cambio de escena, así que se monta un poco antes y después de su rango. */
const RespuestaLayer: React.FC = () => {
	const f = useCurrentFrame();
	return f >= S.respuesta[0] - 8 && f < S.respuesta[1] ? <Respuesta /> : null;
};
