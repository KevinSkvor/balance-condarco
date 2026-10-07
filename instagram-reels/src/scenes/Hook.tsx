import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, SANS, T, clamp, sp} from '../lib';
import {Titulo, Volanta} from '../ui';

/** 0–5 s · "Inscripciones abiertas en el Instituto Álvarez Condarco." */
export const Hook: React.FC = () => {
	const f = useCurrentFrame();
	const [, end] = T.scenes.hook;
	const escudo = sp(f, 4, {damping: 11, stiffness: 110});
	const disco = interpolate(f, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const niveles = sp(f, 58);
	const exit = interpolate(f, [end - 16, end], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});

	return (
		<AbsoluteFill style={{alignItems: 'center', transform: `translateY(${-exit * 260}px)`, opacity: 1 - exit}}>
			<div style={{position: 'absolute', top: 300, width: 600, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				<div style={{position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: C.doradoClaro, transform: `scale(${disco})`}} />
				<div style={{position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: `3px solid ${C.dorado}`, transform: `scale(${disco * 1.08})`, opacity: 0.6 * disco}} />
				<Img
					src={staticFile('img/escudo.png')}
					style={{
						width: 360,
						transform: `scale(${0.4 + 0.6 * escudo}) rotate(${(1 - escudo) * -8}deg) translateY(${Math.sin(f / 22) * 6}px)`,
						opacity: Math.min(1, escudo * 2),
					}}
				/>
			</div>

			<div style={{position: 'absolute', top: 960, left: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
				<Volanta at={20} size={34}>CICLO LECTIVO 2027</Volanta>
				<Titulo at={26} parts={['Inscripciones ', 'abiertas']} size={138} align="center" stagger={8} />
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 22,
						fontFamily: SANS,
						fontSize: 40,
						fontWeight: 600,
						color: C.tintaSuave,
						opacity: niveles,
						transform: `translateY(${(1 - niveles) * 24}px)`,
						marginTop: 8,
					}}
				>
					<span>Jardín</span>
					<span style={{width: 10, height: 10, borderRadius: 99, background: C.dorado}} />
					<span>Primaria</span>
					<span style={{width: 10, height: 10, borderRadius: 99, background: C.dorado}} />
					<span>Secundaria</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
