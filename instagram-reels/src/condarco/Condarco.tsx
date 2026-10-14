import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Titulo} from '../ui';
import T from './timeline.json';

/** Frame global en que la voz dice `word` (n-ésima aparición) en la parte `id`. */
const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const out = Easing.out(Easing.cubic);

const PAPEL_VIEJO = '#f3e8cf';

// ───────────────────────── geometría del mapa (coords. de pantalla) ─────────────────────────

const SANTIAGO = {x: 330, y: 860};
const MENDOZA = {x: 830, y: 960};
const COSTA = 'M150 300 C 175 450, 118 600, 160 760 S 128 1050, 170 1200 S 140 1400, 160 1520';
const PATOS = 'M830 960 C 870 780, 770 560, 610 535 S 375 610, 330 860';
const USPALLATA = 'M330 860 C 430 905, 515 1005, 600 985 S 745 935, 830 960';
const RIOS = ['M560 640 C 470 660, 360 600, 175 640', 'M600 1150 C 480 1190, 330 1120, 168 1180', 'M610 760 C 700 800, 860 760, 1000 820', 'M590 1320 C 700 1290, 850 1360, 1000 1330'];

const spine = (y: number) => 560 + 34 * Math.sin(y / 125);
const PICOS = Array.from({length: 13}, (_, row) => {
	const y = 350 + row * 88;
	const n = row % 2 ? 3 : 2;
	return Array.from({length: n}, (_, k) => {
		const off = n === 3 ? [-105, 0, 105][k] : [-55, 55][k];
		const x = spine(y) + off + (random(`px${row}-${k}`) - 0.5) * 40;
		const w = 120 + random(`pw${row}-${k}`) * 50;
		const h = 95 + random(`ph${row}-${k}`) * 55 + (k === 1 && n === 3 ? 25 : 0);
		return {x, y: y + (random(`py${row}-${k}`) - 0.5) * 24, w, h};
	});
}).flat();
const pico = (p: {x: number; y: number; w: number; h: number}) =>
	`M${p.x - p.w / 2} ${p.y + p.h / 2} L${p.x} ${p.y - p.h / 2} L${p.x + p.w / 2} ${p.y + p.h / 2}`;
const nieve = (p: {x: number; y: number; w: number; h: number}) =>
	`M${p.x - p.w * 0.17} ${p.y - p.h * 0.16} L${p.x - p.w * 0.06} ${p.y - p.h * 0.24} L${p.x + p.w * 0.04} ${p.y - p.h * 0.12} L${p.x + p.w * 0.18} ${p.y - p.h * 0.15}`;

const NIEBLA = Array.from({length: 9}, (_, i) => ({
	x: spine(420 + i * 120) + (random(`nx${i}`) - 0.5) * 60,
	y: 420 + i * 120,
	rx: 165 + random(`nr${i}`) * 35,
	ry: 70 + random(`ny${i}`) * 25,
}));

const COLUMNAS = [
	'M960 470 C 760 420, 520 470, 280 520',
	'M960 640 C 760 600, 520 650, 250 690',
	'M960 820 C 780 800, 560 830, 330 860',
	'M960 1000 C 760 990, 540 1030, 300 1010',
	'M960 1170 C 760 1160, 540 1190, 270 1170',
	'M960 1330 C 760 1320, 540 1350, 260 1320',
];

// ───────────────────────── íconos de línea (estilo Lucide, viewBox 24) ─────────────────────────

const ICONOS: Record<string, string[]> = {
	compas: ['M12 3v3', 'M12 6l-6 15', 'M12 6l6 15', 'M8.2 15.5h7.6', 'M10.5 4.5h3'],
	escuadra: ['M4 20V4l16 16H4z', 'M8 16v-4l4 4H8z', 'M4 8h2', 'M4 12h2'],
	libro: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z', 'M4 20.5A2.5 2.5 0 0 0 6.5 23H20', 'M8 7h8', 'M8 11h6'],
	ojo: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
	equipo: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M3 20a6 6 0 0 1 12 0', 'M16 11a2.5 2.5 0 1 0 0-5', 'M17 14a5 5 0 0 1 4 6'],
	valle: ['M2 18l5-9 5 7 5-7 5 9', 'M7 18c2-3 8-3 10 0'],
	rio: ['M2 8c3-2 5 2 8 0s5 2 8 0 3 1 4 0', 'M2 13c3-2 5 2 8 0s5 2 8 0 3 1 4 0', 'M2 18c3-2 5 2 8 0s5 2 8 0 3 1 4 0'],
	cumbre: ['M2 20l8-12 4 5 2-3 6 10z', 'M10 8V3l4 1.5L10 6'],
	libreta: ['M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6z', 'M6 3v18', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
	pergamino: ['M6 4h12v14a3 3 0 0 1-3 3H5a3 3 0 0 1 0-6h1z', 'M9 8h6', 'M9 12h6', 'M18 4a2 2 0 0 1 2 2v1h-2'],
	castillo: ['M4 21V9h3V6h2v3h2V6h2v3h2V6h2v3h3v12z', 'M10 21v-5h4v5'],
	caballo: ['M8 20l1-6-4-1 2-6 5-3 3 2 2 5-2 2-3-1v8', 'M12 4l1-2'],
	carpa: ['M3 20L12 5l9 15z', 'M12 5v15', 'M9 20l3-5 3 5'],
	pluma: ['M20 4C12 4 6 10 5 19', 'M20 4c0 7-5 12-12 13', 'M5 19l-2 2', 'M10 13l4-1'],
};

/** Ícono de trazo que se dibuja (progress 0→1), centrado en (x, y). */
const Icono: React.FC<{name: string; x: number; y: number; size: number; color: string; progress: number; width?: number}> = ({name, x, y, size, color, progress, width = 1.6}) => (
	<g transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}>
		{ICONOS[name].map((d, i) => (
			<path key={i} d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
		))}
	</g>
);

/** Ícono dentro de un círculo que aparece con resorte. */
const Insignia: React.FC<{f: number; at: number; name: string; x: number; y: number; r: number; color: string; fill?: string}> = ({f, at, name, x, y, r, color, fill = C.doradoClaro}) => {
	const s = sp(f, at, {damping: 11, stiffness: 170});
	const d = ease(f, at + 4, at + 22, out);
	if (s <= 0.001) return null;
	return (
		<g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
			<circle cx={x} cy={y} r={r} fill={fill} stroke={color} strokeWidth={3} />
			<Icono name={name} x={x} y={y} size={r * 1.15} color={color} progress={d} />
		</g>
	);
};

const Rotulo: React.FC<{x: number; y: number; children: string; size?: number; o: number; color?: string; rotate?: number; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, children, size = 24, o, color = C.tintaSuave, rotate = 0, anchor = 'middle'}) => (
	<text
		x={x}
		y={y}
		textAnchor={anchor}
		transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
		style={{fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: '0.16em', fill: color, opacity: o}}
	>
		{children}
	</text>
);

/** Ruta punteada que se dibuja: el trazo discontinuo se revela con una máscara que avanza. */
const Ruta: React.FC<{id: string; d: string; progress: number; color: string; width?: number}> = ({id, d, progress, color, width = 7}) => {
	if (progress <= 0) return null;
	const ev = evolvePath(progress, d);
	return (
		<>
			<defs>
				<mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
					<path d={d} fill="none" stroke="#fff" strokeWidth={width * 4} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
				</mask>
			</defs>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="2 16" mask={`url(#${id})`} />
		</>
	);
};

const punto = (d: string, t: number) => getPointAtLength(d, getLength(d) * Math.max(0, Math.min(1, t))) ?? {x: 0, y: 0};

// ───────────────────────── tiempos clave ─────────────────────────

const K = {
	alvarez: W('p1', 'álvarez'),
	viajar: W('p1', 'viajar'),
	y1816: W('p1', '1816'),
	sanMartin: W('p1', 'san'),
	andes: W('p1', 'andes'),
	faltaba: W('p1', 'faltaba'),
	mapa: W('p1', 'mapa'),
	mision: W('p2', 'misión'),
	nombre: W('p2', 'álvarez'),
	ingeniero: W('p2', 'ingeniero'),
	viajo: W('p2', 'viajó'),
	patos: W('p2', 'patos'),
	acta: W('p2', 'acta'),
	gobernador: W('p2', 'gobernador'),
	previsto: W('p2', 'previsto'),
	expulsaron: W('p2', 'expulsaron'),
	uspallata: W('p2', 'uspallata'),
	notas: W('p2', 'tomar'),
	memorizo: W('p2', 'memorizó'),
	valle: W('p2', 'valle'),
	rio: W('p2', 'río'),
	cumbre: W('p2', 'cumbre'),
	mendoza: W('p2', 'mendoza'),
	dibujo: W('p2', 'dibujó'),
	y1817: W('p3', '1817'),
	cruzo: W('p3', 'cruzó'),
	hoy: W('p3', 'hoy'),
	estudiar: W('p3', 'estudiar'),
	observar: W('p3', 'observar'),
	trabajar: W('p3', 'trabajar'),
	lejos: W('p3', 'lejos'),
	busto: W('p3', 'busto'),
	cierre: T.cierre,
};

// ───────────────────────── escenas ─────────────────────────

/** 0–7 s · "¿Por qué nuestro colegio se llama Álvarez Condarco? … viajar a 1816." */
const Apertura: React.FC = () => {
	const f = useCurrentFrame();
	const q = ease(f, 4, 40, out);
	const salida = ease(f, K.y1816 + 30, K.y1816 + 52);
	const anio = Math.round(interpolate(ease(f, K.viajar - 6, K.y1816 + 6, Easing.inOut(Easing.quad)), [0, 1], [2026, 1816]));
	const anioIn = sp(f, K.viajar - 10, {damping: 14});
	const vuela = ease(f, K.y1816 + 34, K.y1816 + 60);
	if (f > K.y1816 + 64) return null;
	return (
		<AbsoluteFill>
			<div style={{opacity: 1 - salida, transform: `translateY(${-salida * 80}px)`}}>
				<svg width={1080} height={1920} style={{position: 'absolute'}}>
					<g transform="translate(400 300) scale(7)">
						<path d="M8 16 C 8 4, 32 2, 32 16 C 32 26, 20 26, 20 38" fill="none" stroke={C.bordo} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
						<circle cx={20} cy={50} r={3.2} fill={C.bordo} opacity={ease(f, 34, 40)} />
					</g>
				</svg>
				<div style={{position: 'absolute', top: 800, left: 64, right: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
					<div style={{fontFamily: SANS, fontSize: 46, fontWeight: 600, color: C.tintaSuave, opacity: ease(f, 8, 24)}}>¿Por qué nos llamamos</div>
					<Titulo at={0} parts={['', 'Álvarez Condarco?']} size={116} align="center" wordAts={[K.alvarez, K.alvarez + 16]} />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: interpolate(vuela, [0, 1], [1180, 300]),
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: DISPLAY,
					fontWeight: 700,
					fontSize: interpolate(vuela, [0, 1], [230, 0]),
					letterSpacing: '-0.02em',
					color: C.azul,
					opacity: anioIn * (1 - vuela),
					transform: `scale(${anioIn})`,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{anio}
			</div>
		</AbsoluteFill>
	);
};

/** Cámara del mapa: [frame, escala, centroX, centroY]. */
const CAMARA: [number, number, number, number][] = [
	[0, 1, 540, 900],
	[K.patos - 40, 1, 540, 900],
	[K.patos, 1.32, 590, 720],
	[K.gobernador, 1.32, 520, 760],
	[K.expulsaron, 1.38, 470, 860],
	[K.uspallata + 10, 1.45, 580, 920],
	[K.mendoza, 1.45, 640, 930],
	[K.dibujo + 6, 1, 540, 900],
	[K.y1817, 1, 540, 900],
];
const camara = (f: number) => {
	const fr = CAMARA.map((c) => c[0]);
	const e = {...clamp, easing: Easing.inOut(Easing.cubic)};
	return {
		s: interpolate(f, fr, CAMARA.map((c) => c[1]), e),
		x: interpolate(f, fr, CAMARA.map((c) => c[2]), e),
		y: interpolate(f, fr, CAMARA.map((c) => c[3]), e),
	};
};

/** 7–50 s · El mapa: cordillera, niebla, misión, regreso, mapa dibujado y cruce del ejército. */
const Mapa: React.FC = () => {
	const f = useCurrentFrame();
	const start = K.sanMartin - 14;
	if (f < start || f > K.hoy + 40) return null;
	const cam = camara(f);
	const dim = interpolate(f, [K.mision - 20, K.mision, K.viajo - 14, K.viajo + 4], [1, 0.12, 0.12, 1], clamp);
	const fadeOut = ease(f, K.hoy, K.hoy + 34);

	const costa = ease(f, start + 10, start + 70, out);
	const rotulos = ease(f, K.andes, K.andes + 20);
	const nieblaIn = ease(f, K.faltaba - 6, K.faltaba + 26);
	const pregunta = ease(f, K.mapa, K.mapa + 26, out);
	const preguntaOut = ease(f, K.mision - 20, K.mision);

	// recorridos
	const ida = ease(f, K.viajo + 4, K.acta + 20, Easing.inOut(Easing.quad));
	const vuelta = ease(f, K.expulsaron + 6, K.mendoza + 4, Easing.inOut(Easing.sin));
	const viajero = f < K.expulsaron + 6 ? punto(PATOS, ida) : punto(USPALLATA, vuelta);
	const medallon = sp(f, K.viajo - 4, {damping: 12, stiffness: 160});
	const llegada = sp(f, K.mendoza + 4, {damping: 8, stiffness: 160});
	const memoriaGlow = f >= K.memorizo && f < K.mendoza + 20 ? 0.5 + 0.5 * Math.sin((f - K.memorizo) / 4) : 0;
	const expulsion = f >= K.expulsaron && f < K.expulsaron + 14 ? Math.sin((f - K.expulsaron) * 1.6) * 8 * (1 - (f - K.expulsaron) / 14) : 0;

	// mapa final dibujado con pluma
	const dibujo = ease(f, K.dibujo - 2, K.dibujo + 58, Easing.inOut(Easing.quad));
	const plumaT = dibujo;
	const pluma = {x: 200 + 700 * (0.5 + 0.5 * Math.sin(plumaT * 9)), y: 360 + plumaT * 1050};
	const sello = sp(f, K.y1817, {damping: 9, stiffness: 140});

	// la niebla se despeja: la del regreso mientras memoriza, el resto cuando dibuja el mapa
	const nieblaFor = (n: {y: number}) => {
		const enRegreso = n.y > 780 && n.y < 1080;
		const clear = enRegreso ? ease(f, K.memorizo, K.mendoza) : ease(f, K.dibujo, K.dibujo + 40);
		return nieblaIn * (1 - clear);
	};

	const notas = sp(f, K.notas - 4, {damping: 12, stiffness: 170}) * (1 - ease(f, K.memorizo - 4, K.memorizo + 8));
	const memIcons: [string, number, number][] = [
		['valle', K.valle, 0.3],
		['rio', K.rio, 0.55],
		['cumbre', K.cumbre, 0.78],
	];

	return (
		<AbsoluteFill style={{opacity: dim * (1 - fadeOut)}}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="medallon">
						<circle cx={0} cy={0} r={40} />
					</clipPath>
					<filter id="borroso">
						<feGaussianBlur stdDeviation={14} />
					</filter>
				</defs>
				<g transform={`translate(540 900) scale(${cam.s}) translate(${-cam.x} ${-cam.y})`}>
					{/* océano y costa */}
					{Array.from({length: 28}, (_, i) => {
						const y = 320 + i * 44;
						const p = ease(f, start + 20 + i * 1.2, start + 40 + i * 1.2, out);
						return <line key={i} x1={70} y1={y} x2={70 + 50 * p} y2={y} stroke={C.celeste} strokeWidth={3} strokeLinecap="round" opacity={0.45} />;
					})}
					<path d={COSTA} fill="none" stroke={C.azul} strokeWidth={4} strokeLinecap="round" {...evolvePath(costa, COSTA)} />

					{/* ríos (aparecen con el mapa final) */}
					{RIOS.map((d, i) => (
						<path key={i} d={d} fill="none" stroke={C.celeste} strokeWidth={4} strokeLinecap="round" opacity={0.8} {...evolvePath(ease(f, K.dibujo + i * 8, K.dibujo + 30 + i * 8, out), d)} />
					))}

					{/* cordillera */}
					{PICOS.map((p, i) => {
						const at = start + 6 + i * 2;
						const pr = ease(f, at, at + 18, out);
						const sombra = ease(f, K.dibujo + 10 + i, K.dibujo + 26 + i);
						return (
							<g key={i}>
								<path d={`${pico(p)} Z`} fill={PAPEL_VIEJO} stroke="none" opacity={pr} />
								{sombra > 0 &&
									[0.25, 0.45, 0.65].map((k) => (
										<line
											key={k}
											x1={p.x + p.w * 0.06}
											y1={p.y - p.h / 2 + p.h * k}
											x2={p.x + p.w * 0.06 + p.w * 0.22 * k * sombra}
											y2={p.y - p.h / 2 + p.h * k + p.h * 0.2 * sombra}
											stroke={C.azul}
											strokeWidth={2}
											opacity={0.5}
										/>
									))}
								<path d={pico(p)} fill="none" stroke={C.azul} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
								<path d={nieve(p)} fill="none" stroke={C.celeste} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease(f, at + 10, at + 22)} />
							</g>
						);
					})}

					{/* rótulos */}
					<Rotulo x={250} y={470} o={rotulos} size={28} color={C.azul}>CHILE</Rotulo>
					<Rotulo x={100} y={1100} o={rotulos} size={20} rotate={-90}>OCÉANO PACÍFICO</Rotulo>
					<Rotulo x={760} y={1330} o={rotulos} size={20} rotate={90}>CORDILLERA DE LOS ANDES</Rotulo>

					{/* ciudades */}
					{[
						{c: SANTIAGO, n: 'SANTIAGO', at: K.andes},
						{c: MENDOZA, n: 'MENDOZA', at: K.sanMartin},
					].map(({c, n, at}) => {
						const s = sp(f, at, {damping: 12, stiffness: 180});
						return (
							<g key={n} opacity={Math.min(1, s * 2)}>
								<circle cx={c.x} cy={c.y} r={14 * s} fill={C.bordo} />
								<circle cx={c.x} cy={c.y} r={24 * s} fill="none" stroke={C.bordo} strokeWidth={3} />
								<Rotulo x={c.x} y={c.y + 62} o={s} size={24} color={C.tinta}>{n}</Rotulo>
							</g>
						);
					})}
					{/* campamento de San Martín */}
					<Insignia f={f} at={K.sanMartin + 4} name="carpa" x={MENDOZA.x + 80} y={MENDOZA.y - 90} r={44} color={C.azul} />

					{/* niebla: la cordillera desconocida */}
					{NIEBLA.map((n, i) => {
						const o = nieblaFor(n);
						if (o <= 0) return null;
						return <ellipse key={i} cx={n.x + Math.sin((f + i * 30) / 40) * 20} cy={n.y} rx={n.rx} ry={n.ry} fill="#fffaf0" opacity={0.92 * o} filter="url(#borroso)" />;
					})}
					{pregunta > 0 && preguntaOut < 1 && (
						<g transform={`translate(470 760) scale(${3.6 * (0.6 + 0.4 * pregunta)})`} opacity={1 - preguntaOut}>
							<path d="M8 16 C 8 4, 32 2, 32 16 C 32 26, 20 26, 20 38" fill="none" stroke={C.bordo} strokeWidth={4.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pregunta} />
							<circle cx={20} cy={50} r={3.4} fill={C.bordo} opacity={pregunta} />
						</g>
					)}

					{/* rutas */}
					<Ruta id="patos" d={PATOS} progress={ida} color={C.bordo} />
					<Ruta id="uspallata" d={USPALLATA} progress={vuelta} color={C.celeste} width={8} />
					<Rotulo x={760} y={600} o={ease(f, K.patos, K.patos + 16)} size={22} color={C.bordo}>LOS PATOS</Rotulo>
					<Rotulo x={510} y={1060} o={ease(f, K.uspallata, K.uspallata + 16)} size={22} color={C.celeste}>USPALLATA</Rotulo>

					{/* gobernador realista en Santiago */}
					<g transform={`translate(${expulsion} 0)`}>
						<Insignia f={f} at={K.gobernador - 6} name="castillo" x={SANTIAGO.x - 70} y={SANTIAGO.y - 110} r={48} color={C.tinta} />
					</g>
					{/* acta de la independencia */}
					{f >= K.acta - 4 && f < K.expulsaron + 20 && (
						<g opacity={1 - ease(f, K.expulsaron + 4, K.expulsaron + 20)}>
							<Insignia f={f} at={K.acta - 4} name="pergamino" x={viajero.x + 70} y={viajero.y - 80} r={40} color={C.bordo} />
						</g>
					)}
					{/* "como San Martín había previsto" */}
					{f >= K.previsto - 10 && f < K.uspallata + 30 && (
						<g opacity={1 - ease(f, K.uspallata + 10, K.uspallata + 30)}>
							<Insignia f={f} at={K.previsto - 10} name="caballo" x={MENDOZA.x + 80} y={MENDOZA.y + 90} r={40} color={C.azul} />
						</g>
					)}

					{/* "sin poder tomar notas" */}
					{notas > 0.01 && (
						<g transform={`translate(${viajero.x - 110} ${viajero.y - 110}) scale(${notas})`}>
							<circle cx={0} cy={0} r={46} fill={C.papel} stroke={C.linea} strokeWidth={3} />
							<Icono name="libreta" x={0} y={0} size={52} color={C.tintaSuave} progress={1} />
							<path d="M-30 -30 L30 30" stroke={C.bordo} strokeWidth={7} strokeLinecap="round" />
						</g>
					)}

					{/* lo que memoriza: aparece junto al camino y vuela hacia él */}
					{memIcons.map(([name, at, t]) => {
						if (f < at - 4 || f > K.mendoza + 10) return null;
						const p = punto(USPALLATA, t);
						const fly = ease(f, at + 18, at + 34, Easing.in(Easing.cubic));
						const x = interpolate(fly, [0, 1], [p.x, viajero.x]);
						const y = interpolate(fly, [0, 1], [p.y - 95, viajero.y]);
						return (
							<g key={name}>
								<circle cx={p.x} cy={p.y} r={8 * ease(f, at, at + 8)} fill={C.dorado} />
								<g opacity={1 - ease(f, at + 28, at + 36)} transform={`translate(${x} ${y}) scale(${1 - 0.6 * fly}) translate(${-x} ${-y})`}>
									<Insignia f={f} at={at - 4} name={name} x={x} y={y} r={44} color={C.azul} />
								</g>
							</g>
						);
					})}

					{/* viajero: medallón con el retrato */}
					{medallon > 0.01 && f < K.dibujo + 40 && (
						<g transform={`translate(${viajero.x} ${viajero.y}) scale(${medallon * (1 + 0.25 * Math.sin(Math.min(llegada, 1) * Math.PI))})`} opacity={1 - ease(f, K.dibujo + 20, K.dibujo + 40)}>
							{memoriaGlow > 0 && <circle r={58 + 10 * memoriaGlow} fill="none" stroke={C.dorado} strokeWidth={6} opacity={0.4 + 0.5 * memoriaGlow} />}
							<circle r={46} fill={C.dorado} />
							<image href={staticFile('img/condarco/retrato.jpg')} x={-32} y={-43} width={92} height={113} clipPath="url(#medallon)" style={{filter: 'sepia(0.35)'}} />
						</g>
					)}

					{/* pluma dibujando el mapa */}
					{dibujo > 0 && dibujo < 1 && (
						<g transform={`translate(${pluma.x} ${pluma.y}) rotate(-20)`}>
							<Icono name="pluma" x={20} y={-20} size={80} color={C.bordo} progress={1} width={1.8} />
						</g>
					)}

					{/* marco y rosa de los vientos */}
					<rect x={44} y={262} width={992} height={1290} fill="none" stroke={C.azul} strokeWidth={4} {...evolvePath(ease(f, K.dibujo + 6, K.dibujo + 50, out), 'M44 262 H1036 V1552 H44 Z')} rx={18} />
					{(() => {
						const r = ease(f, K.dibujo + 30, K.dibujo + 60, out);
						if (r <= 0) return null;
						return (
							<g transform={`translate(930 1440) rotate(${(1 - r) * -90}) scale(${r})`}>
								<circle r={56} fill="none" stroke={C.azul} strokeWidth={3} />
								<path d="M0 -76 L12 0 L0 76 L-12 0 Z" fill={C.azul} />
								<path d="M-76 0 L0 -10 L76 0 L0 10 Z" fill={C.dorado} />
								<text y={-86} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, fill: C.azul}}>N</text>
							</g>
						);
					})()}

					{/* 1817: el ejército cruza */}
					{COLUMNAS.map((d, ci) => {
						const t0 = K.cruzo - 18 + ci * 4;
						if (f < t0) return null;
						const trail = ease(f, t0, t0 + 70, Easing.inOut(Easing.quad));
						return (
							<g key={ci}>
								<path d={d} fill="none" stroke={C.azul} strokeWidth={3} opacity={0.35} strokeDasharray="4 10" style={{clipPath: `inset(0 0 0 ${(1 - trail) * 100}%)`}} />
								{Array.from({length: 7}, (_, k) => {
									const t = trail - k * 0.05;
									if (t <= 0) return null;
									const p = punto(d, t);
									return <circle key={k} cx={p.x} cy={p.y} r={k === 0 ? 11 : 8} fill={k === 0 ? C.bordo : C.azul} />;
								})}
							</g>
						);
					})}
				</g>
			</svg>

			{/* sello 1817 */}
			{sello > 0.01 && (
				<div
					style={{
						position: 'absolute',
						top: 250,
						right: 70,
						width: 250,
						height: 250,
						borderRadius: '50%',
						border: `8px solid ${C.bordo}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						color: C.bordo,
						transform: `scale(${2.2 - 1.2 * sello}) rotate(${-14 + (1 - sello) * 30}deg)`,
						opacity: Math.min(1, sello * 1.6) * 0.92,
						background: 'rgba(243,232,207,0.85)',
					}}
				>
					<div style={{fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: '0.2em'}}>CRUCE</div>
					<div style={{fontFamily: DISPLAY, fontSize: 92, fontWeight: 700, lineHeight: 1}}>1817</div>
				</div>
			)}
		</AbsoluteFill>
	);
};

/** 16–22 s · La misión: retrato, nombre e "ingeniero del Ejército de los Andes". */
const Retrato: React.FC = () => {
	const f = useCurrentFrame();
	if (f < K.mision - 24 || f > K.viajo + 10) return null;
	const marco = ease(f, K.mision - 20, K.mision + 16, out);
	const foto = ease(f, K.mision - 4, K.mision + 20);
	const cinta = sp(f, K.nombre - 4, {damping: 16, stiffness: 120});
	const ing = sp(f, K.ingeniero - 2, {damping: 14});
	const salida = ease(f, K.viajo - 16, K.viajo + 6, Easing.in(Easing.cubic));
	const cx = interpolate(salida, [0, 1], [540, 830]);
	const cy = interpolate(salida, [0, 1], [760, 960]);
	const s = interpolate(salida, [0, 1], [1, 0.15]);
	return (
		<AbsoluteFill style={{opacity: 1 - ease(f, K.viajo - 2, K.viajo + 8)}}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				<defs>
					<clipPath id="ovalo">
						<ellipse cx={0} cy={0} rx={220} ry={280} />
					</clipPath>
				</defs>
				<g transform={`translate(${cx} ${cy}) scale(${s})`}>
					<g opacity={foto}>
						<image href={staticFile('img/condarco/retrato.jpg')} x={-240} y={-290} width={480} height={591} clipPath="url(#ovalo)" preserveAspectRatio="xMidYMid slice" style={{filter: 'sepia(0.4) contrast(1.05)'}} />
					</g>
					<ellipse cx={0} cy={0} rx={232} ry={292} fill="none" stroke={C.dorado} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - marco} />
					<ellipse cx={0} cy={0} rx={250} ry={310} fill="none" stroke={C.azul} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - marco} />
				</g>
				<g opacity={1 - salida}>
					<Insignia f={f} at={K.ingeniero} name="compas" x={150} y={620} r={70} color={C.azul} />
					<Insignia f={f} at={K.ingeniero + 8} name="escuadra" x={930} y={900} r={70} color={C.bordo} />
				</g>
			</svg>
			<div style={{position: 'absolute', top: 1110, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: 1 - salida}}>
				<div
					style={{
						padding: '20px 44px',
						background: C.azul,
						color: C.papel,
						fontFamily: DISPLAY,
						fontWeight: 700,
						fontSize: 50,
						borderRadius: 12,
						transform: `scaleX(${cinta})`,
						opacity: Math.min(1, cinta * 2),
						clipPath: 'polygon(0 0, 100% 0, 97% 50%, 100% 100%, 0 100%, 3% 50%)',
					}}
				>
					José Antonio Álvarez Condarco
				</div>
				<div style={{fontFamily: SANS, fontSize: 36, fontWeight: 600, color: C.tintaSuave, opacity: ing, transform: `translateY(${(1 - ing) * 20}px)`}}>
					Ingeniero del Ejército de los Andes
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** 50–57 s · Estudiar, observar, trabajar en equipo… "nos permite llegar lejos". */
const Valores: React.FC = () => {
	const f = useCurrentFrame();
	if (f < K.hoy || f > K.busto + 30) return null;
	const salida = ease(f, K.busto - 14, K.busto + 10);
	const monte = ease(f, K.lejos - 34, K.lejos, out);
	const bandera = sp(f, K.lejos + 2, {damping: 9, stiffness: 140});
	const items: [string, string, number, number, string][] = [
		['libro', 'Estudiar', K.estudiar, 200, C.bordo],
		['ojo', 'Observar', K.observar, 540, C.celeste],
		['equipo', 'En equipo', K.trabajar, 880, C.azul],
	];
	const cima = {x: 540, y: 520};
	return (
		<AbsoluteFill style={{opacity: 1 - salida, transform: `translateY(${-salida * 60}px)`}}>
			<svg width={1080} height={1920} style={{position: 'absolute'}}>
				{/* montaña con bandera: "llegar lejos" */}
				<path d="M140 820 L380 560 L460 640 L540 520 L700 700 L780 630 L940 820" fill="none" stroke={C.azul} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" {...evolvePath(monte, 'M140 820 L380 560 L460 640 L540 520 L700 700 L780 630 L940 820')} />
				{bandera > 0.01 && (
					<g transform={`translate(${cima.x} ${cima.y})`}>
						<line x1={0} y1={0} x2={0} y2={-150 * bandera} stroke={C.tinta} strokeWidth={6} strokeLinecap="round" />
						<path d={`M0 ${-150 * bandera} q ${50} ${-14 + 8 * Math.sin(f / 4)} ${100} 0 v 56 q -50 ${14 - 8 * Math.sin(f / 4)} -100 0 z`} fill={C.bordo} opacity={Math.min(1, bandera * 2)} />
					</g>
				)}
				{items.map(([icon, , at, x, color]) => {
					const linea = ease(f, K.lejos - 30, K.lejos - 4, out);
					const d = `M${x} 1060 C ${x} 900, ${cima.x} 760, ${cima.x} ${cima.y + 40}`;
					return (
						<g key={icon}>
							{linea > 0 && <path d={d} fill="none" stroke={color} strokeWidth={5} strokeDasharray="3 14" strokeLinecap="round" style={{clipPath: `inset(${(1 - linea) * 100}% 0 0 0)`}} />}
							<Insignia f={f} at={at} name={icon} x={x} y={1160} r={120} color={color} />
						</g>
					);
				})}
			</svg>
			{items.map(([, label, at, x]) => {
				const s = sp(f, at + 6, {damping: 14});
				return (
					<div key={label} style={{position: 'absolute', top: 1310, left: x - 170, width: 340, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.azul, opacity: s, transform: `translateY(${(1 - s) * 20}px)`}}>
						{label}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** 57–60 s · El busto en el jardín del colegio. */
const Busto: React.FC = () => {
	const f = useCurrentFrame();
	if (f < K.busto - 16) return null;
	const reveal = ease(f, K.busto - 10, K.busto + 16, out);
	const zoom = 1.12 - 0.1 * ease(f, K.busto, K.cierre + 40, Easing.linear);
	const salida = ease(f, K.cierre, K.cierre + 20);
	return (
		<AbsoluteFill style={{opacity: 1 - salida}}>
			<div style={{position: 'absolute', top: 330, left: 280, width: 520, height: 860, borderRadius: 28, overflow: 'hidden', clipPath: `inset(${(1 - reveal) * 100}% 0 0 0 round 28px)`, boxShadow: '0 30px 80px rgba(19,32,90,0.18)'}}>
				<Img src={staticFile('img/condarco/busto.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%', transform: `scale(${zoom})`}} />
			</div>
			<div style={{position: 'absolute', top: 1240, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 32, fontWeight: 700, letterSpacing: '0.16em', color: C.bordo, opacity: ease(f, K.busto + 10, K.busto + 30)}}>
				EN EL JARDÍN DEL COLEGIO
			</div>
		</AbsoluteFill>
	);
};

/** 60–64 s · Cierre sin voz. */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const a = K.cierre;
	if (f < a) return null;
	const disco = ease(f, a + 4, a + 40, out);
	const escudo = ease(f, a + 12, a + 46, out);
	const nombre = ease(f, a + 34, a + 60, out);
	const lema = ease(f, a + 50, a + 76, out);
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 420, width: 520, height: 520, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.92 + 0.08 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 330, opacity: escudo, transform: `scale(${0.96 + 0.04 * escudo})`}} />
			</div>
			<div style={{position: 'absolute', top: 1040, fontFamily: DISPLAY, fontSize: 72, fontWeight: 700, color: C.azul, opacity: nombre, transform: `translateY(${(1 - nombre) * 16}px)`}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1140, fontFamily: SANS, fontSize: 38, color: C.tintaSuave, opacity: lema, transform: `translateY(${(1 - lema) * 12}px)`}}>Un estilo en pos de la excelencia</div>
		</AbsoluteFill>
	);
};

/** Textura de papel: se vuelve "antigua" al viajar a 1816 y vuelve al presente con "Hoy". */
const Papel: React.FC = () => {
	const f = useCurrentFrame();
	const viejo = ease(f, K.viajar, K.y1816 + 20) * (1 - ease(f, K.hoy - 10, K.hoy + 30));
	return (
		<>
			<AbsoluteFill style={{background: PAPEL_VIEJO, opacity: viejo}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,84,40,0.22) 100%)', opacity: viejo}} />
		</>
	);
};

const Grano: React.FC = () => (
	<AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.1, pointerEvents: 'none'}}>
		<svg width="100%" height="100%">
			<filter id="papel">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={3} />
				<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 1 0" />
			</filter>
			<rect width="100%" height="100%" filter="url(#papel)" />
		</svg>
	</AbsoluteFill>
);

export const NombreCondarco: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
			<Audio src={staticFile('condarco/soundtrack.wav')} />
			<Papel />
			<Apertura />
			<Mapa />
			<Retrato />
			<Valores />
			<Busto />
			<Cierre />
			<Grano />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
				{[C.sol, C.celeste, C.bordo].map((c, i) => (
					<div key={c} style={{flex: 1, background: c, transform: `scaleX(${ease(f, K.cierre + 50 + i * 4, K.cierre + 64 + i * 4, out)})`, transformOrigin: 'left'}} />
				))}
			</div>
		</AbsoluteFill>
	);
};

export const CONDARCO_KEYS = K;
