import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';
import T from './timeline.json';

/**
 * Reel "3.º de Secundaria en Nueva Atlantis": diario de viaje.
 * Contador de días y noches, mapa con el micro, polaroids que caen con cada momento,
 * lo que no se aprende en el aula y "los esperamos a la vuelta". Cierre con el escudo, sin voz.
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
	const i = ease(f, range[0], range[0] + 8);
	return <AbsoluteFill style={{opacity: i}}>{children}</AbsoluteFill>;
};

/** Papel de cuaderno: renglones suaves sobre crema. */
const Papel: React.FC = () => (
	<AbsoluteFill style={{background: C.crema}}>
		<AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(180deg, transparent 0 62px, ${C.linea} 62px 64px)`, opacity: 0.6}} />
	</AbsoluteFill>
);

// ───────────────────────── polaroids ─────────────────────────

/** Foto o video con marco de polaroid que cae girando y se asienta. */
const Polaroid: React.FC<{
	at: number;
	left: number;
	top: number;
	w: number;
	h: number;
	rot: number;
	caption: string;
	img?: string;
	video?: string;
	pos?: string;
}> = ({at, left, top, w, h, rot, caption, img, video, pos = '50% 50%'}) => {
	const f = useCurrentFrame();
	if (f < at - 2) return null;
	const s = sp(f, at, {damping: 13, stiffness: 120});
	const flash = 1 - ease(f, at, at + 10, out);
	const media: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'};
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width: w,
				padding: '24px 24px 0',
				background: C.papel,
				boxShadow: '0 18px 40px rgba(19,32,90,0.28)',
				transform: `translateY(${(1 - s) * -260}px) rotate(${rot + (1 - s) * 16}deg) scale(${1.15 - 0.15 * s})`,
				opacity: Math.min(1, s * 3),
			}}
		>
			<div style={{position: 'relative', height: h, overflow: 'hidden', background: C.noche}}>
				{img && <Img src={staticFile(img)} style={media} />}
				{video && (
					<Sequence from={at} layout="none">
						<OffthreadVideo src={staticFile(video)} muted style={media} />
					</Sequence>
				)}
				<div style={{position: 'absolute', inset: 0, background: C.papel, opacity: flash * 0.8}} />
			</div>
			<div style={{height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 600, fontSize: 36, color: C.azul}}>{caption}</div>
			{/* cinta adhesiva */}
			<div style={{position: 'absolute', top: -22, left: '50%', width: 150, height: 44, marginLeft: -75, background: C.sol, opacity: 0.75, transform: `rotate(${-rot * 1.5 - 3}deg)`}} />
		</div>
	);
};

// ───────────────────────── íconos dibujados ─────────────────────────

const Sol: React.FC<{s: number}> = ({s}) => (
	<svg width={84} height={84} viewBox="-50 -50 100 100" style={{transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`}}>
		{Array.from({length: 8}, (_, i) => (
			<line key={i} x1={0} y1={-30} x2={0} y2={-44} stroke={C.sol} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 45})`} />
		))}
		<circle r={22} fill={C.sol} />
	</svg>
);
const Luna: React.FC<{s: number}> = ({s}) => (
	<svg width={84} height={84} viewBox="-50 -50 100 100" style={{transform: `scale(${s}) rotate(${(1 - s) * 60}deg)`}}>
		<path d="M10 -36 A38 38 0 1 0 36 10 A30 30 0 1 1 10 -36 Z" fill={C.azul} />
		<circle cx={30} cy={-30} r={4} fill={C.dorado} />
	</svg>
);

// ───────────────────────── escenas ─────────────────────────

/** 0–5 s · "Cuatro días, tres noches, y un grupo que no se va a olvidar nunca." */
const Inicio: React.FC = () => {
	const f = useCurrentFrame();
	const dias = W('v1', 'cuatro');
	const noches = W('v1', 'tres');
	const fila = (n: number, at: number, Icono: React.FC<{s: number}>) => (
		<div style={{display: 'flex', gap: 10}}>
			{Array.from({length: n}, (_, i) => (
				<Icono key={i} s={sp(f, at + 4 + i * 3, {damping: 11, stiffness: 180})} />
			))}
		</div>
	);
	const num = (at: number) => sp(f, at - 3, {damping: 12, stiffness: 160});
	return (
		<AbsoluteFill>
			<Papel />
			<div style={{position: 'absolute', top: 240, left: 64}}>
				<Volanta at={0}>DIARIO DE VIAJE</Volanta>
			</div>
			<div style={{position: 'absolute', top: 310, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 6}}>
				{(
					[
						[dias, '4', 'días', 4, Sol, C.bordo],
						[noches, '3', 'noches', 3, Luna, C.azul],
					] as [number, string, string, number, React.FC<{s: number}>, string][]
				).map(([at, n, label, k, Icono, color]) => (
					<div key={label} style={{display: 'flex', alignItems: 'center', gap: 24}}>
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 1, color, transform: `scale(${num(at)})`, width: 130}}>{n}</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: 4, opacity: Math.min(1, num(at) * 2)}}>
							<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, color: C.azul, lineHeight: 1}}>{label}</div>
							{fila(k, at, Icono)}
						</div>
					</div>
				))}
			</div>
			<Polaroid at={W('v1', 'grupo') - 4} left={70} top={800} w={940} h={432} rot={-3} img="img/viaje/grupo.jpg" caption="un grupo que no se va a olvidar nunca" />
		</AbsoluteFill>
	);
};

/** Mapa esquemático: Adolfo Sourdeaux → Nueva Atlantis (costa atlántica bonaerense). */
const COSTA = 'M 160 84 L 236 152 C 300 190 360 220 418 247 C 560 330 640 400 703 467 C 640 520 610 560 627 589 C 650 640 680 680 703 703 C 760 760 820 790 855 806 L 874 836 C 880 880 882 930 882 958 L 878 980 C 860 1030 840 1070 817 1102 L 817 1150';
const TIERRA = `${COSTA} L -40 1150 L -40 84 Z`;
const RUTA = 'M 129 114 C 230 230 330 330 450 420 C 560 500 590 610 640 700 C 690 790 780 850 870 975';

const Ruta: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.ruta;
	const ini = W('v2', 'está') - 4;
	const fin = W('v2', 'atlantis') + 6;
	const p = ease(f, ini, fin, Easing.inOut(Easing.quad));
	const len = getLength(RUTA);
	const bus = getPointAtLength(RUTA, Math.max(1, len * p)) ?? {x: 0, y: 0};
	const prev = getPointAtLength(RUTA, Math.max(0, len * p - 6)) ?? {x: 0, y: 0};
	const ang = (Math.atan2(bus.y - prev.y, bus.x - prev.x) * 180) / Math.PI;
	const mapa = ease(f, a, a + 16, out);
	const pinA = sp(f, a + 8, {damping: 12});
	const pinB = sp(f, fin - 4, {damping: 9, stiffness: 180});
	const turnos: [string, string, string, number][] = [
		['Turno mañana', C.sol, C.tinta, W('v2', 'turno', 0)],
		['Turno tarde', C.celeste, C.papel, W('v2', 'turno', 1)],
	];
	const evo = evolvePath(p, RUTA);
	return (
		<AbsoluteFill>
			<Papel />
			<div style={{position: 'absolute', top: 240, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 20}}>
				<Titulo at={a} parts={['3.º de ', 'Secundaria']} size={104} wordAts={Ws('v2', ['tercero', 'de', 'secundaria'])} />
				<div style={{display: 'flex', gap: 16}}>
					{turnos.map(([t, bg, ink, at]) => {
						const s = sp(f, at - 2, {damping: 12, stiffness: 170});
						return (
							<div key={t} style={{padding: '10px 28px 12px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, opacity: Math.min(1, s * 2), transform: `scale(${s})`}}>
								{t}
							</div>
						);
					})}
				</div>
			</div>
			<svg width={1080} height={1100} viewBox="-60 40 1080 1100" style={{position: 'absolute', top: 470, left: 0, opacity: mapa, transform: `scale(${0.96 + 0.04 * mapa})`}}>
				<rect x={-60} y={40} width={1080} height={1100} rx={40} fill="#d9e6f5" />
				{/* olas */}
				{[0, 1, 2, 3, 4].map((i) => (
					<path key={i} d={`M ${640 + i * 30 + ((f + i * 20) % 40)} ${200 + i * 170} q 15 -12 30 0 t 30 0`} stroke={C.celeste} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />
				))}
				<path d={TIERRA} fill={C.doradoClaro} stroke={C.dorado} strokeWidth={4} strokeLinejoin="round" />
				<text x={560} y={170} style={{fontFamily: SANS, fontStyle: 'italic', fontSize: 30, fill: C.celeste}}>Río de la Plata</text>
				<text x={940} y={620} textAnchor="end" style={{fontFamily: SANS, fontStyle: 'italic', fontSize: 30, fill: C.celeste}}>Mar Argentino</text>
				<path d={RUTA} stroke={C.papel} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.8} />
				<path d={RUTA} stroke={C.bordo} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
				{/* origen */}
				<g transform={`translate(129 114) scale(${pinA})`}>
					<circle r={18} fill={C.azul} stroke={C.papel} strokeWidth={6} />
				</g>
				<text x={160} y={70} style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, fill: C.azul, opacity: pinA}}>Adolfo Sourdeaux</text>
				{/* destino */}
				<g transform={`translate(870 975) scale(${pinB})`}>
					<path d="M0 0 C -34 -34, -34 -78, 0 -78 C 34 -78, 34 -34, 0 0 Z" fill={C.bordo} />
					<circle cx={0} cy={-50} r={12} fill={C.papel} />
				</g>
				<text x={840} y={1040} textAnchor="end" style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, fill: C.bordo, opacity: pinB}}>Nueva Atlantis</text>
				{/* micro */}
				{p > 0 && p < 1 && (
					<g transform={`translate(${bus.x} ${bus.y}) rotate(${ang})`}>
						<rect x={-34} y={-18} width={68} height={36} rx={10} fill={C.sol} stroke={C.tinta} strokeWidth={3} />
						<rect x={-24} y={-11} width={16} height={11} rx={3} fill={C.papel} />
						<rect x={-4} y={-11} width={16} height={11} rx={3} fill={C.papel} />
						<rect x={16} y={-11} width={12} height={11} rx={3} fill={C.papel} />
					</g>
				)}
			</svg>
		</AbsoluteFill>
	);
};

/** 11–18 s · "Carpas entre los pinos, el mar a pocos pasos, partidos en la arena y charlas alrededor del fogón." */
const Momentos: React.FC = () => (
	<AbsoluteFill>
		<Papel />
		<Polaroid at={W('v3', 'carpas') - 2} left={50} top={250} w={520} h={640} rot={-5} video="video/viaje/carpas.mp4" caption="Carpas entre los pinos" />
		<Polaroid at={W('v3', 'mar') - 3} left={545} top={340} w={490} h={600} rot={4} video="video/viaje/playa.mp4" pos="50% 40%" caption="El mar a pocos pasos" />
		<Polaroid at={W('v3', 'partidos') - 3} left={50} top={990} w={440} h={480} rot={3} video="video/viaje/partido.mp4" pos="50% 60%" caption="Partidos en la arena" />
		<Polaroid at={W('v3', 'charlas') - 3} left={450} top={1030} w={590} h={360} rot={-3} img="img/viaje/fogon.jpg" pos="50% 60%" caption="Charlas alrededor del fogón" />
	</AbsoluteFill>
);

/** 18.3–24.5 s · "Porque hay cosas que no se aprenden en el aula: convivir, cuidarnos, ser un grupo." */
const Aula: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.aula;
	const p = ease(f, a, b, Easing.inOut(Easing.sin));
	const palabras: [string, string, number][] = [
		['Convivir', C.sol, W('v4', 'convivir')],
		['Cuidarnos', C.doradoClaro, W('v4', 'cuidarnos')],
		['Ser un grupo', C.papel, W('v4', 'ser')],
	];
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Img src={staticFile('img/viaje/grupo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${30 + 40 * p}% 50%`, transform: `scale(${1.05 + 0.08 * p})`}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,20,64,0.85) 0%, rgba(11,20,64,0.55) 50%, rgba(11,20,64,0.85) 100%)'}} />
			<div style={{position: 'absolute', top: 250, left: 64, right: 64}}>
				<Titulo at={a} parts={['Hay cosas que no se aprenden ', 'en el aula']} size={88} color={C.papel} accent={C.sol} wordAts={Ws('v4', ['hay', 'cosas', 'que', 'no', 'se', 'aprenden', 'en', 'el', 'aula'])} />
			</div>
			<div style={{position: 'absolute', top: 820, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 28}}>
				{palabras.map(([t, color, at]) => {
					const s = sp(f, at - 3, {damping: 14, stiffness: 150});
					const linea = ease(f, at + 2, at + 16, out);
					return (
						<div key={t} style={{position: 'relative', alignSelf: 'flex-start', opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * -80}px)`}}>
							<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1.05, color}}>{t}</div>
							<div style={{position: 'absolute', left: 0, bottom: 2, height: 10, width: '100%', borderRadius: 5, background: color, transform: `scaleX(${linea})`, transformOrigin: 'left', opacity: 0.6}} />
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/** 24.5–28 s · "Los esperamos a la vuelta, con muchas historias para contar." */
const Vuelta: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.vuelta;
	const p = ease(f, a, b + 30, Easing.linear);
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Img src={staticFile('img/viaje/camino.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', transform: `scale(${1.15 + 0.25 * p})`}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,20,64,0.85) 0%, rgba(11,20,64,0.4) 45%, rgba(11,20,64,0) 70%)'}} />
			<div style={{position: 'absolute', top: 250, left: 64, right: 64}}>
				<Titulo at={a} parts={['Los esperamos a la vuelta, ', 'con muchas historias para contar']} size={92} color={C.papel} accent={C.sol} wordAts={Ws('v5', ['los', 'esperamos', 'a', 'la', 'vuelta', 'con', 'muchas', 'historias', 'para', 'contar'])} />
			</div>
		</AbsoluteFill>
	);
};

/** Cierre sin voz: escudo. */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = ease(f, a, a + 22, out);
	return (
		<AbsoluteFill style={{alignItems: 'center'}}>
			<Papel />
			<div style={{position: 'absolute', top: 540, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 290, opacity: ease(f, a + 6, a + 26, out)}} />
			</div>
			<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 66, fontWeight: 700, color: C.azul, opacity: ease(f, a + 16, a + 34, out)}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, a + 26, a + 44, out)}}>3.º de Secundaria · Nueva Atlantis</div>
		</AbsoluteFill>
	);
};

export const ViajeAtlantis: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS, color: C.tinta}}>
		<Audio src={staticFile('viaje/soundtrack.wav')} />
		<Escena range={S.inicio}>
			<Inicio />
		</Escena>
		<Escena range={S.ruta}>
			<Ruta />
		</Escena>
		<Escena range={S.momentos}>
			<Momentos />
		</Escena>
		<Escena range={S.aula}>
			<Aula />
		</Escena>
		<Escena range={S.vuelta}>
			<Vuelta />
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
