import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';

/**
 * Reel "Último día · Egresados 2026" (6.º Economía y Sociales): desayuno sorpresa de las familias.
 * Orden: aulas vacías decoradas → los egresados → las familias esperando afuera → la espuma
 * → humo de colores y bengalas → escudo. Cada toma dura un número entero de tiempos
 * de la música (124 BPM); la grilla coincide con audio/make_audio_egresados.py.
 */

const BEAT = (60 / 124) * 30; // cuadros por tiempo
type Toma = {beats: number; foto?: string; video?: string; desde?: number; vol?: number; volanta?: string; titulo?: React.ReactNode; apaisada?: boolean; logo?: boolean};

const TOMAS: Toma[] = [
	// 1 · la sorpresa preparada (sin nadie)
	{beats: 8, video: 'aula-eco', desde: 0.5, logo: true, titulo: <>Desayuno <span style={{color: C.sol}}>sorpresa</span></>},
	{beats: 4, foto: 'aula-soc', titulo: <>Promo <span style={{color: C.sol}}>26</span></>},
	{beats: 6, video: 'aula-soc', desde: 9, volanta: 'PREPARADO CON AMOR', titulo: <>por las <span style={{color: C.sol}}>familias</span></>},
	{beats: 4, foto: 'bandera-eco', titulo: <>6.º <span style={{color: C.sol}}>Economía</span></>},
	{beats: 4, foto: 'globos-soc', apaisada: true, titulo: <>6.º <span style={{color: C.sol}}>Sociales</span></>},
	{beats: 4, foto: 'aula-eco'},
	// 2 · los egresados
	{beats: 6, foto: 'desayuno', titulo: <>¡<span style={{color: C.sol}}>Sorpresa</span>!</>},
	{beats: 6, foto: 'grupo', apaisada: true, volanta: 'EGRESADOS 2026', titulo: <>¡Los <span style={{color: C.sol}}>egresados</span>!</>},
	// 3 · las familias esperan afuera
	{beats: 6, video: 'familias', desde: 0, vol: 0.5, titulo: <>Afuera los <span style={{color: C.sol}}>esperan</span>…</>},
	// 4 · la espuma
	{beats: 8, video: 'espuma', desde: 6.6, vol: 0.35, titulo: <>¡A <span style={{color: C.sol}}>festejar</span>!</>},
	{beats: 6, video: 'espuma', desde: 20.3, vol: 0.35},
	{beats: 10, video: 'espuma', desde: 50.5, vol: 0.35},
	// 5 · colores y bengalas
	{beats: 4, foto: 'humo-azul'},
	{beats: 4, foto: 'humo-violeta', apaisada: true},
	{beats: 4, foto: 'humo-rosa', volanta: 'PROMO 2026', titulo: <>¡Felicitaciones, <span style={{color: C.sol}}>egresados</span>!</>},
];
const CIERRE_BEATS = 8;
const inicios = TOMAS.reduce<number[]>((acc, t, i) => [...acc, i === 0 ? 0 : acc[i - 1] + TOMAS[i - 1].beats], []);
const TOTAL_BEATS = inicios[inicios.length - 1] + TOMAS[TOMAS.length - 1].beats;
export const EGRESADOS_FRAMES = Math.round((TOTAL_BEATS + CIERRE_BEATS) * BEAT);
const fr = (b: number) => Math.round(b * BEAT);

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const Texto: React.FC<{volanta?: string; titulo?: React.ReactNode; logo?: boolean}> = ({volanta, titulo, logo}) => {
	const f = useCurrentFrame();
	const s = sp(f, 3, {damping: 12, stiffness: 170});
	if (!titulo && !volanta) return null;
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 900, background: 'linear-gradient(180deg, rgba(11,20,64,0.8) 0%, rgba(11,20,64,0.4) 60%, rgba(11,20,64,0) 100%)'}} />
			<div style={{position: 'absolute', top: 230, left: 56, right: 56, textAlign: 'center', opacity: Math.min(1, s * 2), transform: `translateY(${(1 - Math.min(s, 1)) * 40}px) scale(${0.85 + 0.15 * s})`}}>
				{logo && (
					<div style={{display: 'flex', justifyContent: 'center', marginBottom: 26}}>
						<div style={{width: 230, height: 230, borderRadius: '50%', background: C.papel, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
							<Img src={staticFile('img/escudo.png')} style={{width: 160}} />
						</div>
					</div>
				)}
				{volanta && <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: '0.16em', color: C.sol, marginBottom: 14}}>{volanta}</div>}
				{titulo && <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.papel, textShadow: '0 6px 30px rgba(11,20,64,0.6)'}}>{titulo}</div>}
			</div>
		</>
	);
};

const Media: React.FC<{t: Toma; n: number}> = ({t, n}) => {
	const f = useCurrentFrame();
	const z = 1.04 - 0.04 * ease(f, 0, n); // zoom mínimo para no perder nitidez
	const pulso = 1 + 0.02 * Math.exp(-((f % Math.round(BEAT)) / BEAT) * 6);
	const src = t.foto ? staticFile(`img/egresados/${t.foto}.jpg`) : staticFile(`video/egresados/${t.video}.mp4`);
	const el = (style: React.CSSProperties, muted = false) =>
		t.foto ? (
			<Img src={src} style={style} />
		) : (
			<OffthreadVideo src={src} startFrom={Math.round((t.desde ?? 0) * 30)} muted={muted || !t.vol} volume={t.vol} style={style} />
		);
	if (t.apaisada) {
		return (
			<AbsoluteFill style={{background: C.noche}}>
				{el({position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(36px) brightness(0.55)', transform: 'scale(1.25)'}, true)}
				<div style={{position: 'absolute', left: 30, right: 30, top: 640, height: 780, padding: 14, background: C.papel, borderRadius: 30, boxShadow: '0 30px 70px rgba(0,0,0,0.45)', transform: `scale(${pulso})`}}>
					<div style={{width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden'}}>{el({width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`})}</div>
				</div>
			</AbsoluteFill>
		);
	}
	return <AbsoluteFill style={{background: C.noche, transform: `scale(${pulso})`}}>{el({width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`})}</AbsoluteFill>;
};

const Toma: React.FC<{t: Toma; n: number}> = ({t, n}) => {
	const f = useCurrentFrame();
	const entra = ease(f, 0, 7);
	const flash = 1 - ease(f, 0, 6);
	return (
		<AbsoluteFill style={{transform: `translateX(${(1 - entra) * 100}%)`, filter: entra < 1 ? `blur(${(1 - entra) * 10}px)` : undefined}}>
			<Media t={t} n={n} />
			<Texto volanta={t.volanta} titulo={t.titulo} logo={t.logo} />
			<AbsoluteFill style={{background: C.papel, opacity: flash * 0.45}} />
		</AbsoluteFill>
	);
};

/** Confeti dorado que cae en el festejo. */
const Confeti: React.FC = () => {
	const f = useCurrentFrame();
	const r = (i: number) => {
		const x = Math.sin(i * 12.9898) * 43758.5453;
		return x - Math.floor(x);
	};
	const cols = [C.sol, C.dorado, C.papel, C.celeste, C.bordo];
	return (
		<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
			{Array.from({length: 60}, (_, i) => {
				const v = 7 + r(i + 4) * 8;
				const y = ((r(i + 9) * 2200 + f * v) % 2200) - 140;
				const x = r(i) * 1080 + Math.sin(f / 10 + i) * 30;
				const w = 10 + r(i + 7) * 10;
				return <rect key={i} x={x} y={y} width={w} height={w * 1.7} rx={2} fill={cols[i % cols.length]} opacity={0.9} transform={`rotate(${f * (4 + r(i) * 6) + i * 30} ${x + w / 2} ${y + w})`} />;
			})}
		</svg>
	);
};

const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const s = sp(f, 0, {damping: 12, stiffness: 140});
	return (
		<AbsoluteFill style={{background: C.crema, alignItems: 'center'}}>
			<Confeti />
			<div style={{position: 'absolute', top: 520, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})`}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 290}} />
			</div>
			<div style={{position: 'absolute', top: 1040, fontFamily: DISPLAY, fontSize: 72, fontWeight: 700, color: C.azul, opacity: ease(f, 8, 24)}}>
				Promo <span style={{color: C.bordo}}>2026</span>
			</div>
			<div style={{position: 'absolute', top: 1140, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, 14, 30)}}>6.º Economía · 6.º Sociales</div>
			<div style={{position: 'absolute', top: 1200, fontFamily: SANS, fontSize: 32, color: C.tintaSuave, opacity: ease(f, 20, 36)}}>Instituto Álvarez Condarco</div>
		</AbsoluteFill>
	);
};

export const EgresadosUltimoDia: React.FC = () => {
	const fin = fr(TOTAL_BEATS);
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS}}>
			<Audio src={staticFile('egresados/soundtrack.wav')} />
			{TOMAS.map((t, i) => {
				const a = fr(inicios[i]);
				const n = fr(inicios[i] + t.beats) - a;
				return (
					<Sequence key={i} from={a} durationInFrames={n + (i < TOMAS.length - 1 ? 7 : 0)} layout="none">
						<Toma t={t} n={n} />
					</Sequence>
				);
			})}
			{/* confeti en el festejo (desde la espuma hasta el final) */}
			<Sequence from={fr(inicios[9])} durationInFrames={fin - fr(inicios[9])} layout="none">
				<Confeti />
			</Sequence>
			<Sequence from={fin} layout="none">
				<Cierre />
			</Sequence>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
		</AbsoluteFill>
	);
};
