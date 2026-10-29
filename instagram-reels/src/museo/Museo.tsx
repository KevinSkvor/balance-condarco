import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';
import {Barrido, Pan, Velo} from '../recorrido/Recorrido';
import T from './timeline.json';

/**
 * Reel "2.º año en el Museo de Ciencias Naturales": viaje en el tiempo.
 * Gancho con el perezoso gigante de Florida y Santa Fe, un contador de "hace X años"
 * que retrocede sala por sala, la ciencia de cerca, picnic en Parque Centenario y cierre con el escudo.
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

/** "Hace 66 millones de años": número que corre entre dos valores (en años). */
const formato = (anios: number) => {
	if (anios < 1) return 'Hoy';
	if (anios < 1e6) return `Hace ${Math.round(anios).toLocaleString('es-AR')} años`;
	const m = anios / 1e6;
	return `Hace ${Math.round(m).toLocaleString('es-AR')} millones de años`;
};

const Reloj: React.FC<{size: number; color: string; giro: number}> = ({size, color, giro}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
		<circle cx={12} cy={12} r={9.5} />
		<path d="M12 12 L12 6.5" transform={`rotate(${giro} 12 12)`} />
		<path d="M12 12 L15.5 12" transform={`rotate(${giro / 12} 12 12)`} />
	</svg>
);

const Contador: React.FC<{anios: number; top: number; s?: number; size?: number}> = ({anios, top, s = 1, size = 40}) => {
	const f = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(1, s * 2)}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px 16px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, transform: `scale(${s})`, boxShadow: '0 10px 30px rgba(11,20,64,0.35)', whiteSpace: 'nowrap'}}>
				<Reloj size={size * 1.1} color={C.tinta} giro={-f * 24} />
				{formato(anios)}
			</div>
		</div>
	);
};

// ───────────────────────── escenas ─────────────────────────

/** 0–5 s · "¿Sabías que debajo de Florida y Santa Fe encontraron un perezoso gigante?" */
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	const per = W('m1', 'perezoso');
	const pin = sp(f, W('m1', 'florida') - 2, {damping: 10, stiffness: 180});
	const grande = sp(f, per - 3, {damping: 12, stiffness: 150});
	return (
		<AbsoluteFill>
			<Pan src="img/museo/16.jpg" at={0} dur={170} x={[85, 15]} y={50} zoom={[1.0, 1.08]} />
			<Velo alto={900} />
			<Velo alto={760} abajo />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo
					at={0}
					parts={['¿Sabías que debajo de ', 'Florida y Santa Fe', ' encontraron…']}
					size={92}
					color={C.papel}
					accent={C.sol}
					wordAts={[0, ...Ws('m1', ['que', 'debajo', 'de', 'florida', 'y', 'santa', 'fe', 'encontraron']).map((x) => Math.min(x, 70))]}
				/>
			</div>
			{/* pin de mapa en la esquina */}
			<div style={{position: 'absolute', left: 56, top: 760, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${pin})`, transformOrigin: 'left center', opacity: Math.min(1, pin * 2)}}>
				<svg width={70} height={84} viewBox="-40 -90 80 96">
					<path d="M0 0 C -34 -34, -34 -84, 0 -84 C 34 -84, 34 -34, 0 0 Z" fill={C.bordo} />
					<circle cx={0} cy={-54} r={12} fill={C.papel} />
				</svg>
				<div style={{padding: '10px 26px 12px', borderRadius: 999, background: C.papel, color: C.azul, fontFamily: SANS, fontWeight: 700, fontSize: 34}}>Florida y Av. Santa Fe, CABA</div>
			</div>
			<div style={{position: 'absolute', left: 56, right: 56, top: 1240, opacity: Math.min(1, grande * 2), transform: `scale(${0.8 + 0.2 * grande}) rotate(-3deg)`, transformOrigin: 'left center'}}>
				<div style={{display: 'inline-block', padding: '14px 38px 22px', borderRadius: 28, background: C.bordo, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1}}>un perezoso gigante</div>
			</div>
		</AbsoluteFill>
	);
};

/** 5.2–11.5 s · "Lo descubrimos en el Museo de Ciencias Naturales, en una salida que nos llevó millones de años atrás." */
const Museo: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.museo;
	const mill = W('m2', 'millones');
	const giro = ease(f, a, b, Easing.linear);
	const c = sp(f, mill - 4, {damping: 14});
	const anios = interpolate(f, [mill, W('m2', 'atrás') + 10], [0, 150e6], {...clamp, easing: Easing.in(Easing.cubic)});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<AbsoluteFill style={{transform: `rotate(${giro * 12}deg) scale(${1.25 + giro * 0.2})`}}>
				<Img src={staticFile('img/museo/29.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a} color={C.sol}>2.º AÑO · SECUNDARIA</Volanta>
				<Titulo at={a} parts={['Museo de ', 'Ciencias Naturales']} size={100} color={C.papel} accent={C.sol} wordAts={Ws('m2', ['museo', 'de', 'ciencias', 'naturales'])} />
			</div>
			{c > 0.01 && <Contador anios={anios} top={1280} s={c} size={46} />}
		</AbsoluteFill>
	);
};

type Toma = {src: string; word: [string, number]; caption: string; anios: number; x: [number, number]; y?: number};
const TOMAS: Toma[] = [
	{src: 'img/museo/12.jpg', word: ['dinosaurios', 0], caption: 'Dinosaurios', anios: 66e6, x: [50, 50], y: 45},
	{src: 'img/museo/14.jpg', word: ['enormes', 0], caption: '¡enormes!', anios: 90e6, x: [50, 50], y: 40},
	{src: 'img/museo/09.jpg', word: ['monstruos', 0], caption: 'Monstruos de los mares', anios: 150e6, x: [50, 50], y: 30},
	{src: 'img/museo/10.jpg', word: ['prehistóricos', 0], caption: 'prehistóricos', anios: 150e6, x: [75, 60], y: 50},
	{src: 'img/museo/15.jpg', word: ['mamíferos', 0], caption: 'Mamíferos', anios: 10000, x: [55, 55], y: 55},
	{src: 'img/museo/17.jpg', word: ['gigantes', 0], caption: 'gigantes', anios: 10000, x: [40, 40], y: 50},
	{src: 'img/museo/23.jpg', word: ['corazón', 0], caption: 'El corazón del planeta', anios: 4500e6, x: [30, 30], y: 35},
];

/** 11.5–19.7 s · "Dinosaurios enormes, monstruos de los mares prehistóricos, mamíferos gigantes y hasta el corazón de nuestro planeta." */
const Salas: React.FC = () => {
	const f = useCurrentFrame();
	const [, b] = S.salas;
	const cortes = TOMAS.map((t, i) => (i === 0 ? S.salas[0] : W('m3', t.word[0], t.word[1]) - 3));
	const i = Math.max(0, cortes.filter((c) => f >= c).length - 1);
	const prev = i > 0 ? TOMAS[i - 1].anios : 0;
	const anios = interpolate(f, [cortes[i], cortes[i] + 8], [prev, TOMAS[i].anios], {...clamp, easing: out});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			{TOMAS.map((t, k) => {
				const at = cortes[k];
				const fin = k < TOMAS.length - 1 ? cortes[k + 1] + 8 : b;
				if (f >= fin) return null;
				const s = sp(f, at + 1, {damping: 13, stiffness: 170});
				return (
					<Barrido key={t.src} at={at}>
						<Pan src={t.src} at={at} dur={fin - at + 10} x={t.x} y={t.y ?? 50} zoom={[1.12, 1.02]} />
						<Velo alto={560} />
						<Velo alto={700} abajo />
						<div style={{position: 'absolute', left: 56, right: 56, top: 1310, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.02, color: k % 2 ? C.sol : C.papel, textShadow: '0 6px 30px rgba(11,20,64,0.7)', transform: `translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 2)}}>
							{t.caption}
						</div>
					</Barrido>
				);
			})}
			<Contador anios={anios} top={250} />
		</AbsoluteFill>
	);
};

/** 19.7–23.9 s · "Porque la ciencia se entiende mejor cuando se puede ver de cerca." */
const Ciencia: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.ciencia;
	const cerca = W('m4', 'cerca');
	const lupa = sp(f, W('m4', 'ver') - 4, {damping: 12});
	return (
		<AbsoluteFill>
			<Pan src="img/museo/08.jpg" at={a} dur={b - a} x={[50, 50]} y={62} zoom={[1.05, 1.25]} />
			<Velo alto={900} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a} parts={['La ciencia se entiende mejor cuando se puede ', 'ver de cerca']} size={88} color={C.papel} accent={C.sol} wordAts={Ws('m4', ['la', 'ciencia', 'se', 'entiende', 'mejor', 'cuando', 'se', 'puede', 'ver', 'de', 'cerca'])} />
			</div>
			{/* lupa que se apoya sobre el ictiosaurio */}
			<div style={{position: 'absolute', left: 700, top: 980, width: 260, height: 260, opacity: Math.min(1, lupa * 2), transform: `scale(${lupa}) rotate(${(1 - lupa) * -30 + Math.sin((f - cerca) / 8) * 3}deg)`}}>
				<div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `18px solid ${C.sol}`, background: 'rgba(255,255,255,0.12)', boxShadow: '0 12px 40px rgba(11,20,64,0.5)'}} />
				<div style={{position: 'absolute', left: 205, top: 205, width: 34, height: 130, borderRadius: 17, background: C.bordo, transform: 'rotate(-45deg)', transformOrigin: 'top center'}} />
			</div>
		</AbsoluteFill>
	);
};

/** 23.9–29.3 s · "Y después, un picnic en Parque Centenario para cerrar el día." */
const Picnic: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.picnic;
	const parque = sp(f, W('m5', 'parque') - 3, {damping: 12, stiffness: 170});
	const foto = W('m5', 'cerrar') - 2;
	const chip = sp(f, foto + 10, {damping: 13});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Pan src="img/museo/27.jpg" at={a} dur={foto - a + 10} x={[50, 50]} y={65} zoom={[1.15, 1.05]} />
			<Velo alto={760} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a} parts={['Y después, ', 'un picnic']} size={104} color={C.papel} accent={C.sol} wordAts={Ws('m5', ['y', 'después', 'un', 'picnic'])} />
			</div>
			<div style={{position: 'absolute', left: 56, top: 470, padding: '12px 30px 14px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, transform: `scale(${parque}) rotate(-3deg)`, transformOrigin: 'left center', opacity: Math.min(1, parque * 2)}}>
				en Parque Centenario
			</div>
			<Barrido at={foto}>
				<Pan src="img/museo/24.jpg" at={foto} dur={b - foto + 20} x={[50, 50]} y={60} zoom={[1.02, 1.1]} />
				<Velo alto={560} />
				<div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(1, chip * 2), transform: `scale(${chip})`}}>
					<div style={{padding: '14px 34px 16px', borderRadius: 999, background: C.azul, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52}}>2.º año · Secundaria</div>
				</div>
			</Barrido>
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
			<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, a + 26, a + 44, out)}}>2.º año · Museo de Ciencias Naturales</div>
		</AbsoluteFill>
	);
};

export const MuseoCiencias: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS, color: C.tinta}}>
		<Audio src={staticFile('museo/soundtrack.wav')} />
		<Escena range={S.gancho}>
			<Gancho />
		</Escena>
		<Escena range={S.museo}>
			<Barrido at={S.museo[0]}>
				<Museo />
			</Barrido>
		</Escena>
		<Escena range={S.salas}>
			<Salas />
		</Escena>
		<Escena range={S.ciencia}>
			<Barrido at={S.ciencia[0]}>
				<Ciencia />
			</Barrido>
		</Escena>
		<Escena range={S.picnic}>
			<Barrido at={S.picnic[0]}>
				<Picnic />
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
