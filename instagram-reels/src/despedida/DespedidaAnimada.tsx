import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Invitación animada (historia 1080×1920, ~17 s) a la despedida de fin de año 2026.
 * Estilo delicado: papel crema y oro. Arranca como tarjeta digital: llega un sobre azul con lacre,
 * se abre la solapa y sale la tarjeta, que crece hasta ocupar la pantalla. Después cada elemento
 * entra con rebote en un tiempo de la música (100 BPM, 18 cuadros por tiempo; ver audio/make_audio_despedida.py):
 * marco que se dibuja → ramitas → escudo con brillo → nombre del colegio → "Despedida" letra a letra
 * → datos de a uno → "¡Los esperamos!" con lluvia de confeti.
 */

const BEAT = 18;
const T = {
	marco: 0,
	ramitas: BEAT * 1,
	escudo: BEAT * 2,
	colegio: BEAT * 4,
	despedida: BEAT * 6,
	finDeAnio: BEAT * 8,
	sep1: BEAT * 9,
	cuando: BEAT * 10,
	hora: BEAT * 12,
	donde: BEAT * 14,
	direccion: BEAT * 16,
	sep2: BEAT * 17,
	esperamos: BEAT * 18,
};
/** Intro: el sobre llega, se abre y sale la tarjeta (5 tiempos). */
const INTRO = BEAT * 5;
export const DESPEDIDA_FRAMES = INTRO + BEAT * 28;

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], {...clamp, easing: e});

const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898) * 43758.5453;
	return x - Math.floor(x);
};

/** Polvo dorado que flota todo el tiempo. */
const Polvo: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 46}, (_, i) => {
				const x = rnd(i) * 1080 + Math.sin(f / 40 + i) * 14;
				const y = (rnd(i + 50) * 2100 - f * (0.6 + rnd(i + 9) * 0.8) + 2100) % 2100 - 90;
				const r = 1.6 + rnd(i + 3) * 3.2;
				const o = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(f / 10 + i * 2));
				return <circle key={i} cx={x} cy={y} r={r} fill={C.dorado} opacity={o * ease(f, 0, 30)} />;
			})}
		</svg>
	);
};

/** Doble marco dorado que se dibuja desde una esquina. */
const Marco: React.FC = () => {
	const f = useCurrentFrame();
	const p = ease(f, T.marco, T.marco + 40, Easing.inOut(Easing.cubic));
	const q = ease(f, T.marco + 10, T.marco + 50, Easing.inOut(Easing.cubic));
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			<rect x={44} y={44} width={992} height={1832} rx={6} fill="none" stroke={C.dorado} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
			<rect x={58} y={58} width={964} height={1804} rx={4} fill="none" stroke={C.dorado} strokeWidth={1.2} opacity={0.7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} />
		</svg>
	);
};

/** Ramita que crece (tallo y hojas se dibujan en orden). */
const Ramita: React.FC<{style: React.CSSProperties; at: number}> = ({style, at}) => {
	const f = useCurrentFrame();
	const tallo = ease(f, at, at + 30, Easing.inOut(Easing.cubic));
	return (
		<svg width={260} height={260} viewBox="0 0 260 260" style={{position: 'absolute', ...style}}>
			<path d="M20 240 C 70 180, 120 120, 230 30" stroke={C.dorado} strokeWidth={2.4} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tallo} />
			{[0.18, 0.34, 0.5, 0.66, 0.82].map((t, i) => {
				const x = 20 + 210 * t;
				const y = 240 - 210 * t - Math.sin(t * Math.PI) * 30;
				const a = i % 2 ? 40 : -50;
				const h = ease(f, at + 8 + i * 5, at + 20 + i * 5, Easing.out(Easing.back(2)));
				return (
					<g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(${h})`}>
						<path d="M0 0 C 10 -18, 30 -18, 38 0 C 30 12, 10 12, 0 0 Z" fill={C.doradoClaro} stroke={C.dorado} strokeWidth={2} />
					</g>
				);
			})}
			<circle cx={232} cy={28} r={5 * ease(f, at + 30, at + 40, Easing.out(Easing.back(3)))} fill={C.bordo} />
			<circle cx={150} cy={96} r={3.5 * ease(f, at + 34, at + 44, Easing.out(Easing.back(3)))} fill={C.celeste} />
		</svg>
	);
};

const Separador: React.FC<{at: number; top: number}> = ({at, top}) => {
	const f = useCurrentFrame();
	const p = ease(f, at, at + 16);
	const s = sp(f, at + 8, {damping: 8, stiffness: 200});
	return (
		<div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18}}>
			<div style={{width: 130, height: 1.5, background: C.dorado, transform: `scaleX(${p})`, transformOrigin: 'right'}} />
			<svg width={26} height={26} viewBox="-13 -13 26 26" style={{transform: `scale(${s}) rotate(${(1 - Math.min(s, 1)) * 180}deg)`}}>
				<path d="M0 -12 L3.5 -3.5 L12 0 L3.5 3.5 L0 12 L-3.5 3.5 L-12 0 L-3.5 -3.5 Z" fill={C.dorado} />
			</svg>
			<div style={{width: 130, height: 1.5, background: C.dorado, transform: `scaleX(${p})`, transformOrigin: 'left'}} />
		</div>
	);
};

/** Texto que aparece letra por letra, subiendo desde una máscara. */
const Letras: React.FC<{texto: string; at: number; paso: number; style: React.CSSProperties}> = ({texto, at, paso, style}) => {
	const f = useCurrentFrame();
	return (
		<div style={{display: 'flex', justifyContent: 'center', ...style}}>
			{texto.split('').map((ch, i) => {
				const s = sp(f, at + i * paso, {damping: 13, stiffness: 160});
				return (
					<span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em'}}>
						<span style={{display: 'inline-block', transform: `translateY(${(1 - s) * 105}%)`, opacity: s < 0.01 ? 0 : 1, whiteSpace: 'pre'}}>{ch}</span>
					</span>
				);
			})}
		</div>
	);
};

/** Aparición con rebote (escala con sobrepaso), como en las tarjetas digitales animadas. */
const Aparece: React.FC<{at: number; top: number; children: React.ReactNode; desde?: number}> = ({at, top, children, desde = 40}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 9, stiffness: 170});
	return (
		<div style={{position: 'absolute', top, left: 80, right: 80, textAlign: 'center', opacity: Math.min(1, s * 2.5), transform: `translateY(${(1 - Math.min(s, 1)) * desde}px) scale(${0.55 + 0.45 * s})`}}>
			{children}
		</div>
	);
};

const Confeti: React.FC<{at: number}> = ({at}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const t = f - at;
	const colores = [C.sol, C.celeste, C.bordo, C.dorado, C.azul];
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 70}, (_, i) => {
				const x0 = rnd(i + 300) * 1080;
				const v = 15 + rnd(i + 400) * 8; // rápido: la lluvia pasa y deja la invitación limpia
				const y = -60 - rnd(i + 500) * 450 + t * v;
				if (y > 1960) return null;
				const x = x0 + Math.sin(t / 9 + i) * 30;
				const r = t * (4 + rnd(i) * 8) + i * 30;
				const w = 10 + rnd(i + 7) * 10;
				return <rect key={i} x={x} y={y} width={w} height={w * 1.7} rx={2} fill={colores[i % colores.length]} opacity={0.9} transform={`rotate(${r} ${x + w / 2} ${y + w})`} />;
			})}
		</svg>
	);
};

const Dato: React.FC<{titulo: string; children: React.ReactNode}> = ({titulo, children}) => (
	<>
		<div style={{fontFamily: SANS, fontSize: 26, fontWeight: 700, letterSpacing: '0.3em', color: C.bordo}}>{titulo}</div>
		<div style={{fontFamily: DISPLAY, fontSize: 56, fontWeight: 600, color: C.azul, lineHeight: 1.15, marginTop: 8}}>{children}</div>
	</>
);

/** Contenido animado de la tarjeta; su cuadro 0 es el momento en que la tarjeta ya ocupa la pantalla. */
const Tarjeta: React.FC = () => {
	const f = useCurrentFrame();
	const escudo = sp(f, T.escudo, {damping: 12, stiffness: 120});
	const brillo = ease(f, T.escudo + 14, T.escudo + 40, Easing.inOut(Easing.sin));
	const nombre = ease(f, T.colegio, T.colegio + 30);
	const pin = sp(f, T.donde, {damping: 9, stiffness: 200});
	const respira = 1 + 0.02 * Math.sin((f - T.esperamos) / 8) * ease(f, T.esperamos, T.esperamos + 20);
	return (
		<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
			<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, rgba(255,255,255,0) 65%)'}} />
			<Polvo />
			<Marco />
			<Ramita at={T.ramitas} style={{left: 50, top: 50, transform: 'rotate(90deg) scaleX(-1)'}} />
			<Ramita at={T.ramitas + 4} style={{right: 50, top: 50, transform: 'rotate(-90deg)'}} />
			<Ramita at={T.ramitas + 8} style={{left: 50, bottom: 50}} />
			<Ramita at={T.ramitas + 12} style={{right: 50, bottom: 50, transform: 'scaleX(-1)'}} />

			{/* escudo con un destello que lo cruza */}
			<div style={{position: 'absolute', top: 270, left: 540 - 95, width: 190, height: 220, transform: `scale(${escudo})`, opacity: Math.min(1, escudo * 2), overflow: 'hidden'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 190}} />
				<div style={{position: 'absolute', top: -40, bottom: -40, width: 60, left: -80 + brillo * 340, background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 100%)', transform: 'rotate(18deg)', mixBlendMode: 'screen'}} />
			</div>

			<div style={{position: 'absolute', top: 530, left: 0, right: 0, textAlign: 'center', fontSize: 28, fontWeight: 600, letterSpacing: `${0.6 - 0.26 * nombre}em`, color: C.tintaSuave, opacity: nombre}}>INSTITUTO ÁLVAREZ CONDARCO</div>

			<Letras texto="Despedida" at={T.despedida} paso={3} style={{position: 'absolute', top: 630, left: 0, right: 0, fontFamily: DISPLAY, fontWeight: 600, fontSize: 150, color: C.azul, letterSpacing: '-0.01em', lineHeight: 1}} />
			<Letras texto="de fin de año" at={T.finDeAnio} paso={2} style={{position: 'absolute', top: 805, left: 0, right: 0, fontFamily: DISPLAY, fontWeight: 600, fontSize: 84, color: C.bordo, lineHeight: 1}} />

			<Separador at={T.sep1} top={970} />

			<Aparece at={T.cuando} top={1030}>
				<Dato titulo="CUÁNDO">Viernes 18 de diciembre</Dato>
			</Aparece>
			<Aparece at={T.hora} top={1170} desde={20}>
				<div style={{display: 'inline-block', padding: '10px 34px 14px', borderRadius: 999, border: `2px solid ${C.dorado}`, fontFamily: DISPLAY, fontWeight: 600, fontSize: 44, color: C.azul}}>a las 20 hs.</div>
			</Aparece>

			<Aparece at={T.donde} top={1290}>
				<div style={{display: 'flex', justifyContent: 'center', marginBottom: 6}}>
					<svg width={46} height={56} viewBox="-23 -52 46 56" style={{transform: `translateY(${(1 - Math.min(pin, 1)) * -40}px) scale(${pin})`}}>
						<path d="M0 0 C -20 -20, -20 -48, 0 -48 C 20 -48, 20 -20, 0 0 Z" fill={C.bordo} />
						<circle cx={0} cy={-31} r={7} fill={C.crema} />
					</svg>
				</div>
				<Dato titulo="DÓNDE">El Galpón de Tacuara</Dato>
			</Aparece>
			<Aparece at={T.direccion} top={1500} desde={20}>
				<div style={{fontSize: 36, fontWeight: 500, color: C.tintaSuave}}>Av. Ángel T. de Alvear 2470 · Don Torcuato</div>
			</Aparece>

			<Separador at={T.sep2} top={1585} />

			<Aparece at={T.esperamos} top={1630} desde={30}>
				<div style={{fontFamily: DISPLAY, fontSize: 64, fontWeight: 600, fontStyle: 'italic', color: C.azul, transform: `scale(${respira})`}}>¡Los esperamos!</div>
			</Aparece>

			<Confeti at={T.esperamos + 4} />

			<div style={{position: 'absolute', left: 58, right: 58, bottom: 58, display: 'flex', height: 8}}>
				{[C.sol, C.celeste, C.bordo].map((c, i) => (
					<div key={c} style={{flex: 1, background: c, transform: `scaleX(${ease(f, T.esperamos + i * 4, T.esperamos + 14 + i * 4)})`, transformOrigin: 'left'}} />
				))}
			</div>
		</AbsoluteFill>
	);
};

const W = 760; // sobre
const H = 500;
const ENV_TOP = 1000;

/** Posición vertical del sobre: entra desde abajo y, cuando la tarjeta crece, se va por abajo. */
const sobreY = (f: number) => {
	const llega = sp(f, 0, {damping: 13, stiffness: 110});
	const sale = ease(f, 66, 88, Easing.in(Easing.cubic));
	return ENV_TOP + (1 - llega) * 1100 + sale * 1100;
};

/** Sobre azul con solapa que se abre y lacre bordó con el escudo. */
const Sobre: React.FC<{capa: 'fondo' | 'frente'}> = ({capa}) => {
	const f = useCurrentFrame();
	const abre = ease(f, 24, 44, Easing.inOut(Easing.cubic));
	const lacre = sp(f, 10, {damping: 8, stiffness: 220}) * (1 - ease(f, 24, 32));
	const y = sobreY(f);
	const box: React.CSSProperties = {position: 'absolute', left: 540 - W / 2, top: y, width: W, height: H};
	if (capa === 'fondo') {
		return (
			<div style={{...box, perspective: 1400}}>
				<div style={{position: 'absolute', inset: 0, background: '#0f1b4d', borderRadius: 14}} />
				{/* solapa abierta: queda detrás de la tarjeta */}
				{abre > 0.5 && (
					<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H * 0.62, transformOrigin: 'top', transform: `rotateX(${abre * 180}deg)`, background: C.azul, clipPath: 'polygon(0 0, 100% 0, 50% 100%)', borderTop: `3px solid ${C.dorado}`}} />
				)}
			</div>
		);
	}
	return (
		<div style={{...box, perspective: 1400}}>
			{/* bolsillo delantero */}
			<div style={{position: 'absolute', inset: 0, background: C.azul, borderRadius: 14, clipPath: `polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)`, boxShadow: '0 30px 60px rgba(0,0,0,0.35)'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<path d={`M 6 6 L ${W / 2} ${H * 0.52} L ${W - 6} 6`} stroke={C.dorado} strokeWidth={2.5} fill="none" />
				<rect x={6} y={6} width={W - 12} height={H - 12} rx={10} fill="none" stroke={C.dorado} strokeWidth={1.5} opacity={0.7} />
			</svg>
			{/* solapa cerrada */}
			{abre <= 0.5 && (
				<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H * 0.62, transformOrigin: 'top', transform: `rotateX(${abre * 180}deg)`, background: '#1a2a70', clipPath: 'polygon(0 0, 100% 0, 50% 100%)'}} />
			)}
			{/* lacre */}
			<div style={{position: 'absolute', left: W / 2 - 70, top: H * 0.62 - 90, width: 140, height: 140, borderRadius: '50%', background: C.bordo, boxShadow: `0 0 0 6px ${C.dorado}, 0 10px 24px rgba(0,0,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${lacre})`, opacity: Math.min(1, lacre * 2)}}>
				<div style={{width: 96, height: 96, borderRadius: '50%', background: C.crema, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('img/escudo.png')} style={{width: 70}} />
				</div>
			</div>
		</div>
	);
};

export const DespedidaAnimada: React.FC = () => {
	const f = useCurrentFrame();
	// la tarjeta sale del sobre (cuadros 44–66) y crece hasta ocupar la pantalla (66–INTRO)
	const sube = ease(f, 44, 66, Easing.out(Easing.cubic));
	const crece = ease(f, 66, INTRO, Easing.inOut(Easing.cubic));
	const k = 0.5 + 0.5 * crece;
	const llegaY = ENV_TOP + (1 - sp(f, 0, {damping: 13, stiffness: 110})) * 1100;
	const yCaja = llegaY + 40 - sube * 620;
	const top = yCaja * (1 - crece);
	const intro = f < INTRO;
	// mientras está en el sobre, la tarjeta sólo se ve por encima del borde inferior del sobre
	const borde = sobreY(f) + H - 30;
	const oculto = intro ? Math.max(0, 1920 - (borde - top) / k) : 0;
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #24347f 0%, ${C.noche} 75%)`, fontFamily: SANS, overflow: 'hidden'}}>
			<Audio src={staticFile('despedida/musica.wav')} />
			{intro && <Polvo />}
			{intro && <Sobre capa="fondo" />}
			<div style={{position: 'absolute', left: 540 - 540 * k, top, width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: 'top left', boxShadow: intro ? '0 30px 80px rgba(0,0,0,0.45)' : undefined, borderRadius: intro ? 20 : 0, overflow: 'hidden', clipPath: `inset(0 0 ${oculto}px 0)`}}>
				{intro ? (
					<AbsoluteFill style={{background: C.crema}}>
						<div style={{position: 'absolute', inset: 44, border: `2.5px solid ${C.dorado}`, borderRadius: 6}} />
						<Img src={staticFile('img/escudo.png')} style={{position: 'absolute', top: 270, left: 445, width: 190, opacity: 0.25}} />
					</AbsoluteFill>
				) : (
					<Sequence from={INTRO} layout="none">
						<Tarjeta />
					</Sequence>
				)}
			</div>
			{intro && <Sobre capa="frente" />}
		</AbsoluteFill>
	);
};
