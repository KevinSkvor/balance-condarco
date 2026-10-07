import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, T, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';

/** 25–30 s · "Te esperamos. Un estilo en pos de la excelencia." Composición del post "Nuestra historia". */
export const Cierre: React.FC = () => {
	const f = useCurrentFrame();
	const at = T.cierreIn;
	const foto = sp(f, at, {damping: 20, stiffness: 90});
	const reveal = interpolate(f, [at, at + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const escudo = sp(f, at + 30, {damping: 11, stiffness: 140});
	const url = sp(f, at + 38, {damping: 13, stiffness: 150});
	const lema = sp(f, at + 40, {damping: 20});

	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 220,
					left: 64,
					right: 64,
					height: 640,
					borderRadius: 28,
					overflow: 'hidden',
					transform: `translateY(${(1 - foto) * 120}px)`,
					clipPath: `inset(${(1 - reveal) * 50}% 0 ${(1 - reveal) * 50}% 0 round 28px)`,
				}}
			>
				<Img
					src={staticFile('img/fachada.jpg')}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: '32% 50%',
						transform: `scale(${1.2 - 0.12 * interpolate(f, [at, T.durationInFrames], [0, 1], clamp)})`,
					}}
				/>
			</div>

			<div style={{position: 'absolute', top: 920, left: 64, right: 64, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
					<Volanta at={at + 14}>INSCRIPCIONES ABIERTAS · 2027</Volanta>
					<Titulo at={at + 18} parts={['Te ', 'esperamos']} size={116} stagger={6} />
				</div>
				<Img
					src={staticFile('img/escudo.png')}
					style={{width: 128, transform: `scale(${escudo}) rotate(${(1 - escudo) * 20}deg)`, opacity: Math.min(1, escudo * 2), marginBottom: 6}}
				/>
			</div>

			<div style={{position: 'absolute', top: 1170, left: 64, right: 64, display: 'flex', flexDirection: 'column', gap: 30}}>
				<div
					style={{
						alignSelf: 'flex-start',
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: '22px 40px',
						borderRadius: 999,
						background: C.azul,
						color: C.papel,
						fontFamily: SANS,
						fontSize: 46,
						fontWeight: 700,
						transform: `scale(${url})`,
						transformOrigin: 'left center',
					}}
				>
					<svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.dorado} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
						<circle cx="12" cy="12" r="9" />
						<path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
					</svg>
					alvarezcondarco.com
				</div>
				<div style={{opacity: lema, transform: `translateY(${(1 - lema) * 20}px)`}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 600, fontSize: 44, color: C.azul}}>
						Un estilo en pos de la <span style={{color: C.bordo}}>excelencia</span>
					</div>
					<div style={{fontSize: 30, color: C.tintaSuave, marginTop: 10}}>Ricardo Güiraldes 35 · Ing. Adolfo Sourdeaux</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
