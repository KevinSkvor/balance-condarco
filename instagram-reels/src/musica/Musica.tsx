import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';
import {Barrido, Pan, Velo} from '../recorrido/Recorrido';
import {Medalla} from './PostMusica';
import T from './timeline.json';

/**
 * Reel "Olimpíadas de Música": las dos bandas de Secundaria, subcampeonas.
 * Sin voz: la música (120 BPM, bombo legüero) lleva el ritmo y cada corte cae en un golpe.
 * Un tiempo = 15 cuadros; un compás = 60.
 */

const S = T.scenes;
const BEAT = 15;

const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [0, 1], {...clamp, easing: e});
const out = Easing.out(Easing.cubic);

const Escena: React.FC<{range: number[]; children: React.ReactNode}> = ({range, children}) => {
	const f = useCurrentFrame();
	if (f < range[0] || f >= range[1]) return null;
	return <AbsoluteFill>{children}</AbsoluteFill>;
};

/** Pulso del bombo: la foto "late" un poco en cada tiempo fuerte. */
const pulso = (f: number) => {
	const k = (f % (BEAT * 2)) / (BEAT * 2);
	return 1 + 0.025 * Math.exp(-k * 8);
};

/** Ondas de sonido que salen hacia los costados. */
const Ondas: React.FC<{top: number}> = ({top}) => {
	const f = useCurrentFrame();
	return (
		<svg width={1080} height={200} style={{position: 'absolute', left: 0, top}}>
			{[0, 1, 2].map((i) => {
				const k = ((f + i * 10) % 30) / 30;
				return (
					<g key={i} opacity={1 - k} stroke={C.sol} strokeWidth={8} fill="none" strokeLinecap="round">
						<path d={`M ${120 - k * 80} 40 Q ${80 - k * 80} 100 ${120 - k * 80} 160`} />
						<path d={`M ${960 + k * 80} 40 Q ${1000 + k * 80} 100 ${960 + k * 80} 160`} />
					</g>
				);
			})}
		</svg>
	);
};

const Grande: React.FC<{at: number; children: React.ReactNode; color?: string; top: number; size?: number}> = ({at, children, color = C.papel, top, size = 150}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 11, stiffness: 190});
	if (f < at) return null;
	return (
		<div style={{position: 'absolute', left: 56, right: 56, top, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.98, letterSpacing: '-0.02em', color, textShadow: '0 8px 40px rgba(11,20,64,0.6)', transform: `scale(${0.6 + 0.4 * Math.min(s, 1.15)})`, transformOrigin: 'left center', opacity: Math.min(1, s * 3)}}>
			{children}
		</div>
	);
};

// ───────────────────────── escenas ─────────────────────────

/** 0–3 s · "Dos bandas. Dos medallas." */
const Gancho: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{transform: `scale(${pulso(f)})`}}>
			<Pan src="img/musica/banda-cerca.jpg" at={0} dur={90} x={[30, 60]} y={60} zoom={[1.15, 1.05]} />
			<Velo alto={1100} />
			<Velo alto={500} abajo />
			<Grande at={0} top={300}>Dos bandas.</Grande>
			<Grande at={BEAT * 3} top={470} color={C.sol}>
				Dos medallas.
			</Grande>
		</AbsoluteFill>
	);
};

/** 3–7 s · Olimpíadas de Música de Malvinas Argentinas. */
const Muni: React.FC = () => {
	const f = useCurrentFrame();
	const [a, b] = S.muni;
	const z = ease(f, a, b, Easing.linear);
	const chip = sp(f, a + BEAT * 4, {damping: 12, stiffness: 170});
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Img src={staticFile('img/musica/muni.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.55)', transform: 'scale(1.2)'}} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56, display: 'flex', flexDirection: 'column', gap: 18}}>
				<Volanta at={a} color={C.sol}>SECUNDARIA</Volanta>
				<Titulo at={a + 4} parts={['Olimpíadas de ', 'Música']} size={120} color={C.papel} accent={C.sol} stagger={BEAT / 2} />
			</div>
			<div style={{position: 'absolute', left: 40, right: 40, top: 700, height: 750, borderRadius: 32, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', transform: `scale(${pulso(f)})`}}>
				<Img src={staticFile('img/musica/muni.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.0 + 0.1 * z})`, transformOrigin: '50% 75%'}} />
			</div>
			<div style={{position: 'absolute', left: 56, top: 1490, padding: '12px 30px 14px', borderRadius: 999, background: C.sol, color: C.tinta, fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, opacity: Math.min(1, chip * 2), transform: `scale(${chip})`, transformOrigin: 'left center'}}>
				Malvinas Argentinas
			</div>
		</AbsoluteFill>
	);
};

const Cortes: React.FC<{start: number; fotos: [string, string][]; texto: React.ReactNode}> = ({start, fotos, texto}) => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{background: C.noche}}>
			{fotos.map(([src, pos], i) => {
				const at = start + i * BEAT * 2;
				const fin = at + BEAT * 2 + 8;
				if (f >= fin) return null;
				const [x, y] = pos.split(' ').map((v) => parseFloat(v));
				return (
					<Barrido key={src} at={at}>
						<AbsoluteFill style={{transform: `scale(${pulso(f)})`}}>
							<Pan src={src} at={at} dur={BEAT * 2 + 10} x={[x - 4, x + 4]} y={y} zoom={[1.12, 1.04]} />
						</AbsoluteFill>
					</Barrido>
				);
			})}
			<Velo alto={700} abajo />
			<div style={{position: 'absolute', left: 56, right: 56, top: 1360}}>{texto}</div>
		</AbsoluteFill>
	);
};

/** 7–11 s · Ensayo antes de salir. */
const Ensayo: React.FC = () => (
	<Cortes
		start={S.ensayo[0]}
		fotos={[
			['img/musica/ensayo.jpg', '50 45'],
			['img/musica/ensayo2.jpg', '50 40'],
			['img/musica/banderas.jpg', '50 60'],
			['img/musica/monumento.jpg', '50 50'],
		]}
		texto={<Grande at={S.ensayo[0] + 4} top={0} size={110}>Último ensayo…</Grande>}
	/>
);

/** 11–15 s · Arriba del escenario. */
const Escenario: React.FC = () => (
	<Cortes
		start={S.escenario[0]}
		fotos={[
			['img/musica/banda.jpg', '50 50'],
			['img/musica/banda-cerca.jpg', '45 60'],
			['img/musica/banda.jpg', '80 50'],
			['img/musica/escenario2.jpg', '50 62'],
		]}
		texto={
			<>
				<Grande at={S.escenario[0] + 4} top={0} size={130} color={C.sol}>
					¡A tocar!
				</Grande>
				<Ondas top={-240} />
			</>
		}
	/>
);

/** 15–18 s · La medalla cae en el golpe del platillo. */
const Medallas: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.medalla;
	const m1 = sp(f, a, {damping: 9, stiffness: 140});
	const m2 = sp(f, a + 6, {damping: 9, stiffness: 140});
	const flash = 1 - ease(f, a, a + 12, out);
	return (
		<AbsoluteFill style={{background: C.noche}}>
			<Pan src="img/musica/escenario.jpg" at={a} dur={90} x={[50, 50]} y={60} zoom={[1.05, 1.15]} />
			<AbsoluteFill style={{background: 'rgba(11,20,64,0.55)'}} />
			<div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
				<div style={{transform: `translateY(${(1 - m1) * -700}px)`}}>
					<Medalla size={320} rot={-10 + Math.sin(f / 6) * 3} />
				</div>
				<div style={{transform: `translateY(${(1 - m2) * -700}px)`}}>
					<Medalla size={320} rot={10 - Math.sin(f / 6) * 3} />
				</div>
			</div>
			<Grande at={a + BEAT} top={1000} color={C.papel} size={124}>
				¡Subcampe<span style={{color: C.sol}}>ones</span>!
			</Grande>
			<Grande at={a + BEAT * 2} top={1160} size={52}>
				Medalla de plata para nuestras dos bandas
			</Grande>
			<AbsoluteFill style={{background: C.papel, opacity: flash * 0.85}} />
		</AbsoluteFill>
	);
};

/** 18–21 s · Orgullosos. */
const Grupo: React.FC = () => {
	const [a, b] = S.grupo;
	return (
		<AbsoluteFill>
			<Pan src="img/musica/grupo.jpg" at={a} dur={b - a + 20} x={[50, 50]} y={45} zoom={[1.02, 1.12]} />
			<Velo alto={760} />
			<div style={{position: 'absolute', top: 250, left: 56, right: 56}}>
				<Titulo at={a + 2} parts={['¡Orgullosos de ', 'ustedes!']} size={112} color={C.papel} accent={C.sol} stagger={BEAT / 2} />
			</div>
		</AbsoluteFill>
	);
};

const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const [a] = S.cierre;
	const disco = ease(f, a, a + 18, out);
	return (
		<AbsoluteFill style={{background: C.crema, alignItems: 'center', opacity: ease(f, a, a + 6)}}>
			<div style={{position: 'absolute', top: 540, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, opacity: disco, transform: `scale(${0.9 + 0.1 * disco})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<Img src={staticFile('img/escudo.png')} style={{width: 290, opacity: ease(f, a + 4, a + 20, out)}} />
			</div>
			<div style={{position: 'absolute', top: 1060, fontFamily: DISPLAY, fontSize: 66, fontWeight: 700, color: C.azul, opacity: ease(f, a + 10, a + 26, out)}}>Instituto Álvarez Condarco</div>
			<div style={{position: 'absolute', top: 1150, fontFamily: SANS, fontSize: 36, color: C.tintaSuave, opacity: ease(f, a + 18, a + 34, out)}}>Olimpíadas de Música · Malvinas Argentinas</div>
		</AbsoluteFill>
	);
};

export const MusicaOlimpiadas: React.FC = () => (
	<AbsoluteFill style={{background: C.noche, fontFamily: SANS, color: C.tinta}}>
		<Audio src={staticFile('musica/soundtrack.wav')} />
		<Escena range={S.gancho}>
			<Gancho />
		</Escena>
		<Escena range={S.muni}>
			<Barrido at={S.muni[0]}>
				<Muni />
			</Barrido>
		</Escena>
		<Escena range={S.ensayo}>
			<Ensayo />
		</Escena>
		<Escena range={S.escenario}>
			<Escenario />
		</Escena>
		<Escena range={S.medalla}>
			<Medallas />
		</Escena>
		<Escena range={S.grupo}>
			<Barrido at={S.grupo[0]}>
				<Grupo />
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
