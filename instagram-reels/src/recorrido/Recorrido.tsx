import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, getStaticFiles, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Cursor, Titulo, Volanta} from '../ui';
import T from './timeline.json';

/**
 * Reel "Recorrido por el cole" (inscripciones 2027).
 * Gancho hablado y escrito desde el primer cuadro, recorrido con cortes rápidos por
 * espacios sin chicos, "solo falta que nos vengas a conocer" y llamado a la acción.
 * El último cuadro vuelve a la fachada para que el loop empalme con el principio.
 */

const S = T.scenes;

const W = (id: string, word: string, n = 0) => {
	const v = T.vo.find((x) => x.id === id)!;
	const hits = v.words.filter(([w]) => w === word);
	if (!hits[n]) throw new Error(`Palabra no encontrada: ${id}/${word}/${n}`);
	return v.at + Math.round((hits[n][1] as number) * T.fps);
};

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const out = Easing.out(Easing.cubic);

const Escena: React.FC<{range: number[]; children: React.ReactNode; fade?: number}> = ({range, children, fade = 6}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	const o = fade > 0 ? ease(f, range[1] - fade, range[1]) : 0;
	return <AbsoluteFill style={{opacity: 1 - o}}>{children}</AbsoluteFill>;
};

// ───────────────────────── fotos ─────────────────────────

const existe = (path: string) => getStaticFiles().some((s) => s.name === path);

/** Ilustración de reemplazo mientras falta la foto real (se usa sola si el archivo no existe). */
const DIBUJOS: Record<string, string[]> = {
	biblioteca: ['M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20', 'M8 7h8', 'M8 11h6'],
	computacion: ['M3 4h18v12H3z', 'M8 20h8', 'M12 16v4', 'M7 9l2 2-2 2', 'M11 13h4'],
	escenario: ['M2 3h20', 'M4 3c0 6 2 10 5 12', 'M20 3c0 6-2 10-5 12', 'M2 21h20', 'M5 21v-4h14v4', 'M12 8v2'],
	aula: ['M4 10h16', 'M6 10v10', 'M18 10v10', 'M8 4h8v6H8z', 'M4 20h16'],
};

const Ilustracion: React.FC<{name: string; color: string}> = ({name, color}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.doradoClaro, alignItems: 'center', justifyContent: 'center'}}>
			<div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: C.crema}} />
			<svg width={560} height={560} viewBox="0 0 24 24" fill="none" style={{transform: `rotate(${Math.sin(f / 20) * 2}deg)`}}>
				{DIBUJOS[name].map((d, i) => (
					<path key={i} d={d} stroke={color} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
				))}
			</svg>
		</AbsoluteFill>
	);
};

/**
 * Foto a pantalla completa con paneo horizontal: las fotos son apaisadas, así que en
 * vertical el paneo recorre todo el ancho en lugar de mostrar sólo el centro.
 */
export const Pan: React.FC<{
	src: string;
	fallback?: string;
	at: number;
	dur: number;
	x?: [number, number];
	y?: number;
	zoom?: [number, number];
	color?: string;
}> = ({src, fallback = 'aula', at, dur, x = [30, 70], y = 50, zoom = [1.05, 1.15], color = C.azul}) => {
	const f = useCurrentFrame();
	const p = ease(f, at, at + dur, Easing.inOut(Easing.sin));
	if (!existe(src)) return <Ilustracion name={fallback} color={color} />;
	return (
		<AbsoluteFill style={{overflow: 'hidden', background: C.noche}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: `${x[0] + (x[1] - x[0]) * p}% ${y}%`,
					transform: `scale(${zoom[0] + (zoom[1] - zoom[0]) * p})`,
					filter: 'saturate(1.08) contrast(1.04)',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Degradé oscuro arriba para que el texto blanco se lea sobre cualquier foto. */
export const Velo: React.FC<{alto?: number; abajo?: boolean}> = ({alto = 900, abajo}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			right: 0,
			[abajo ? 'bottom' : 'top']: 0,
			height: alto,
			background: `linear-gradient(${abajo ? '0deg' : '180deg'}, rgba(11,20,64,0.82) 0%, rgba(11,20,64,0.55) 45%, rgba(11,20,64,0) 100%)`,
		}}
	/>
);

/** Corte tipo "barrido": la toma nueva entra de costado con desenfoque de movimiento. */
export const Barrido: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const f = useCurrentFrame();
	if (f < at) return null;
	const s = ease(f, at, at + 8, Easing.out(Easing.quad));
	return <AbsoluteFill style={{transform: `translateX(${(1 - s) * 100}%)`, filter: `blur(${(1 - s) * 18}px)`}}>{children}</AbsoluteFill>;
};

const Etiqueta: React.FC<{at: number; lugar: string; nivel: string; bg: string; ink: string}> = ({at, lugar, nivel, bg, ink}) => {
	const f = useCurrentFrame();
	const s = sp(f, at + 4, {damping: 14, stiffness: 160});
	return (
		<div style={{position: 'absolute', left: 56, top: 1330, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, opacity: Math.min(1, s * 2)}}>
			<div style={{padding: '10px 28px 12px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, transform: `scale(${s})`, transformOrigin: 'left center'}}>{nivel}</div>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.papel, textShadow: '0 4px 24px rgba(11,20,64,0.6)', transform: `translateY(${(1 - s) * 30}px)`}}>{lugar}</div>
		</div>
	);
};

// ───────────────────────── escenas ─────────────────────────

/** 0–2.9 s · "¿Ya sabés dónde va a estar tu hijo el año que viene?" */
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	const words = ['ya', 'sabes', 'dónde', 'va', 'a', 'estar', 'tu', 'hijo', 'el', 'año', 'que', 'viene'].map((w, i) => (i === 0 ? 0 : Math.min(W('t1', w) - 3, 60)));
	// al final del gancho la cámara "entra" por la puerta del colegio
	const entra = ease(f, 74, 90, Easing.in(Easing.cubic));
	return (
		<AbsoluteFill style={{transform: `scale(${1 + entra * 1.6})`, transformOrigin: '40% 62%', filter: `blur(${entra * 10}px)`}}>
			<Pan src="img/edificio/fachada.jpg" at={-20} dur={120} x={[78, 60]} y={55} zoom={[1.1, 1.18]} />
			<Velo alto={1000} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={0} parts={['¿Ya sabés dónde va a estar tu hijo ', 'el año que viene?']} size={100} color={C.papel} accent={C.sol} wordAts={words} />
			</div>
		</AbsoluteFill>
	);
};

/** 2.9–5.1 s · "Te mostramos el cole por dentro." */
const Adentro: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.adentro;
	const s = ease(f, a, a + 12, out);
	const words = ['te', 'mostramos', 'el', 'cole', 'por', 'dentro'].map((w) => W('t2', w) - 2);
	return (
		<AbsoluteFill style={{transform: `scale(${1.25 - 0.25 * s})`, filter: `blur(${(1 - s) * 10}px)`}}>
			<Pan src="img/edificio/sum.jpg" at={a} dur={80} x={[20, 55]} y={55} zoom={[1.05, 1.12]} />
			<Velo alto={760} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a} parts={['Te mostramos el cole ', 'por dentro']} size={100} color={C.papel} accent={C.sol} wordAts={words} />
			</div>
		</AbsoluteFill>
	);
};

const TOMAS: {src: string; fallback: string; frase: string[]; lugar: string; nivel: string; bg: string; ink: string; x: [number, number]}[] = [
	{src: 'img/edificio/patio-juegos.jpg', fallback: 'aula', frase: ['Acá juegan ', 'los más chicos'], lugar: 'Patio de juegos', nivel: 'Jardín', bg: C.sol, ink: C.tinta, x: [75, 55]},
	{src: 'img/edificio/biblioteca.jpg', fallback: 'biblioteca', frase: ['Acá descubren ', 'los libros'], lugar: 'Biblioteca', nivel: 'Primaria', bg: C.celeste, ink: C.papel, x: [20, 45]},
	{src: 'img/edificio/computacion.jpg', fallback: 'computacion', frase: ['Acá aprenden ', 'tecnología'], lugar: 'Sala de computación', nivel: 'Secundaria', bg: C.bordo, ink: C.papel, x: [25, 50]},
	{src: 'img/edificio/escenario.jpg', fallback: 'escenario', frase: ['Y acá se animan a subir ', 'al escenario'], lugar: 'Salón de actos', nivel: 'Todo el cole', bg: C.azul, ink: C.papel, x: [38, 50]},
];

/** 5.1–13.3 s · "Acá juegan los más chicos, acá descubren los libros, acá aprenden tecnología y acá se animan a subir al escenario." */
const Recorrido: React.FC = () => {
	const [a, b] = S.recorrido;
	const cortes = [0, 1, 2, 3].map((n) => (n === 0 ? a : W('t3', 'acá', n) - 4));
	const t3 = T.vo.find((v) => v.id === 't3')!.words.map(([w]) => w as string);
	// frames de cada palabra de cada frase, para que el texto siga a la voz
	const rangos = [
		[0, 5],
		[5, 9],
		[9, 12],
		[12, 20],
	];
	return (
		<AbsoluteFill style={{background: C.noche}}>
			{TOMAS.map((t, i) => {
				const at = cortes[i];
				const fin = i < 3 ? cortes[i + 1] + 8 : b;
				const [r0, r1] = rangos[i];
				const v = T.vo.find((x) => x.id === 't3')!;
				const wordAts = t3.slice(r0, r1).map((_, k) => v.at + Math.round((v.words[r0 + k][1] as number) * T.fps) - 2);
				return (
					<Barrido key={t.src} at={at}>
						<Escena range={[at, fin]} fade={0}>
							<Pan src={t.src} fallback={t.fallback} at={at} dur={fin - at + 10} x={t.x} y={55} color={t.bg === C.sol ? C.azul : t.bg} />
							<Velo alto={760} />
							<Velo alto={700} abajo />
							<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
								<Titulo at={at} parts={t.frase} size={96} color={C.papel} accent={C.sol} wordAts={wordAts} />
							</div>
							<Etiqueta at={at} lugar={t.lugar} nivel={t.nivel} bg={t.bg} ink={t.ink} />
						</Escena>
					</Barrido>
				);
			})}
		</AbsoluteFill>
	);
};

/** 13.3–19.5 s · "Todo está listo para 2027. Solo falta una cosa: que nos vengas a conocer." */
const Listo: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.listo;
	const solo = W('t4', 'solo');
	const cortina = ease(f, solo - 6, solo + 14, Easing.inOut(Easing.cubic));
	const subrayado = ease(f, W('t4', 'conocer') + 6, W('t4', 'conocer') + 26, out);
	return (
		<AbsoluteFill>
			<Pan src="img/edificio/aula.jpg" fallback="aula" at={a} dur={200} x={[40, 55]} y={50} zoom={[1.05, 1.2]} />
			<Velo alto={760} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, opacity: 1 - cortina}}>
				<Titulo at={a} parts={['Todo está listo para ', '2027']} size={100} color={C.papel} accent={C.sol} wordAts={['todo', 'está', 'listo', 'para', '2027'].map((w) => W('t4', w) - 2)} />
			</div>
			{/* el círculo crema se abre desde el centro y deja la frase sola */}
			<AbsoluteFill style={{background: C.crema, clipPath: `circle(${cortina * 120}% at 50% 55%)`}}>
				<div style={{position: 'absolute', top: 560, left: 64, right: 64}}>
					<Titulo at={solo} parts={['Solo falta una cosa:']} size={80} color={C.tintaSuave} wordAts={['solo', 'falta', 'una', 'cosa'].map((w) => W('t4', w) - 2)} />
					<div style={{height: 30}} />
					<Titulo at={solo} parts={['', 'que nos vengas a conocer']} size={128} accent={C.bordo} wordAts={['que', 'nos', 'vengas', 'a', 'conocer'].map((w) => W('t4', w) - 2)} />
					<svg width={620} height={40} viewBox="0 0 620 40" style={{position: 'absolute', left: 0, top: 'calc(100% + 6px)'}}>
						<path d="M6 26 C 160 6, 420 6, 614 22" stroke={C.sol} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - subrayado} />
					</svg>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** 19.4–24.8 s · "Inscripciones abiertas. Pedí tu entrevista en alvarezcondarco.com." */
const Cta: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.cta;
	const url = 'alvarezcondarco.com';
	const tipeo = W('t5', 'albarescondarco');
	const letras = Math.round(interpolate(f, [tipeo, tipeo + 26], [0, url.length], clamp));
	const card = sp(f, W('t5', 'pedid') - 6, {damping: 16});
	const clic = W('t5', 'com') + 16;
	const cx = interpolate(f, [clic - 22, clic], [900, 640], {...clamp, easing: out});
	const cy = interpolate(f, [clic - 22, clic], [1500, 1176], {...clamp, easing: out});
	const press = ease(f, clic, clic + 4) * (1 - ease(f, clic + 6, clic + 10));
	const boton = sp(f, clic, {damping: 10, stiffness: 200});
	const comparti = sp(f, b - 52, {damping: 16});
	return (
		<AbsoluteFill style={{background: C.crema}}>
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a}>CICLO LECTIVO 2027</Volanta>
				<Titulo at={a} parts={['Inscripciones ', 'abiertas']} size={120} wordAts={[W('t5', 'inscripciones') - 4, W('t5', 'abiertas') - 2]} />
			</div>
			<div style={{position: 'absolute', top: 640, left: 56, display: 'flex', gap: 16}}>
				{[
					['Jardín', C.sol, C.tinta],
					['Primaria', C.celeste, C.papel],
					['Secundaria', C.bordo, C.papel],
				].map(([t, bg, ink], i) => {
					const s = sp(f, W('t5', 'abiertas') + 4 + i * 4, {damping: 12, stiffness: 170});
					return (
						<div key={t} style={{padding: '12px 30px', borderRadius: 999, background: bg, color: ink, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, opacity: Math.min(1, s * 2), transform: `scale(${s})`}}>
							{t}
						</div>
					);
				})}
			</div>
			{/* "navegador": se tipea la web y se toca Admisiones */}
			<div style={{position: 'absolute', top: 820, left: 56, right: 56, borderRadius: 32, background: C.papel, boxShadow: '0 24px 60px rgba(19,32,90,0.16)', border: `2px solid ${C.linea}`, overflow: 'hidden', opacity: card, transform: `translateY(${(1 - card) * 60}px)`}}>
				<div style={{padding: '30px 36px 10px', fontFamily: SANS, fontSize: 34, fontWeight: 600, color: C.tintaSuave}}>Pedí tu entrevista en</div>
				<div style={{margin: '10px 36px 0', padding: '22px 30px', borderRadius: 999, background: C.crema, border: `2px solid ${C.linea}`, fontFamily: SANS, fontSize: 46, fontWeight: 700, color: C.azul, minHeight: 58}}>
					{url.slice(0, letras)}
					<span style={{opacity: letras < url.length && Math.floor(f / 8) % 2 === 0 ? 1 : 0}}>|</span>
				</div>
				<div style={{display: 'flex', justifyContent: 'flex-end', padding: '28px 36px 34px'}}>
					<div style={{padding: '18px 44px', borderRadius: 999, background: f >= clic ? C.bordo : C.azul, color: C.papel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, transform: `scale(${f >= clic ? 0.94 + 0.06 * boton : 1})`}}>Admisiones</div>
				</div>
			</div>
			{f > clic - 24 && <Cursor x={cx} y={cy} press={press} />}
			<div style={{position: 'absolute', top: 1300, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', opacity: Math.min(1, comparti * 1.5), transform: `translateY(${(1 - comparti) * 30}px)`}}>
				<div style={{padding: '12px 30px', borderRadius: 999, background: C.azul, color: C.papel, fontFamily: SANS, fontWeight: 700, fontSize: 34}}>Link en la bio</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: 36, fontWeight: 600, color: C.tinta}}>
					<svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.bordo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
						<path d="M22 2L11 13" />
						<path d="M22 2l-7 20-4-9-9-4z" />
					</svg>
					Mandáselo a quien esté buscando colegio
				</div>
			</div>
		</AbsoluteFill>
	);
};

/** 24.8–26.7 s · Escudo en silencio y vuelta a la fachada (loop). */
const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.cierre;
	const disco = ease(f, a, a + 18, out);
	const vuelta = ease(f, b - 14, b);
	return (
		<AbsoluteFill style={{background: C.crema, alignItems: 'center'}}>
			<div style={{position: 'absolute', top: 560, width: 440, height: 440, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${0.9 + 0.1 * disco})`, opacity: disco, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 280}} />
			</div>
			<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 64, fontWeight: 700, color: C.azul, opacity: ease(f, a + 8, a + 24, out)}}>Instituto Álvarez Condarco</div>
			<AbsoluteFill style={{opacity: vuelta}}>
				{/* mismo encuadre que el cuadro 0 */}
				<Pan src="img/edificio/fachada.jpg" at={-20 + b} dur={120} x={[78, 60]} y={55} zoom={[1.1, 1.18]} />
				<Velo alto={1000} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const RecorridoCole: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.noche, fontFamily: SANS, color: C.tinta}}>
			<Audio src={staticFile('recorrido/soundtrack.wav')} />
			<Escena range={S.gancho} fade={0}>
				<Gancho />
			</Escena>
			<Escena range={S.adentro} fade={0}>
				<Adentro />
			</Escena>
			<Escena range={S.recorrido} fade={0}>
				<Recorrido />
			</Escena>
			<Escena range={S.listo} fade={0}>
				<Listo />
			</Escena>
			<Escena range={S.cta} fade={6}>
				<Cta />
			</Escena>
			<Escena range={S.cierre} fade={0}>
				<Cierre />
			</Escena>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
				{[C.sol, C.celeste, C.bordo].map((c) => (
					<div key={c} style={{flex: 1, background: c}} />
				))}
			</div>
			{/* barra de progreso fina: ayuda a que se mire hasta el final */}
			<div style={{position: 'absolute', left: 0, top: 0, height: 6, width: `${(f / T.durationInFrames) * 100}%`, background: C.sol, opacity: 0.9}} />
		</AbsoluteFill>
	);
};
