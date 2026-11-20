import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';

/**
 * Carrusel de feed 3:4 (1080×1440): alumnos del Instituto Álvarez Condarco rindieron el
 * Oxford Test of English (OTE). Texto del centro examinador, sin fechas ni otros colegios.
 */

const Base: React.FC<{n: string; children: React.ReactNode}> = ({n, children}) => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<div style={{position: 'absolute', top: 54, left: 56, right: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
			<div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>INGLÉS · OXFORD TEST OF ENGLISH</div>
			<div style={{fontSize: 24, fontWeight: 700, color: C.tintaSuave}}>{n}</div>
		</div>
		{children}
		<div style={{position: 'absolute', top: 1350, left: 56, display: 'flex', alignItems: 'center', gap: 14}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 54}} />
			<div style={{fontFamily: DISPLAY, fontSize: 28, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
		</div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 16}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);

const Foto: React.FC<{src: string; top: number; alto: number; pos?: string; rot?: number}> = ({src, top, alto, pos = '50% 50%', rot = 0}) => (
	<div style={{position: 'absolute', top, left: 40, right: 40, height: alto, padding: 12, background: C.papel, borderRadius: 28, boxShadow: '0 20px 50px rgba(19,32,90,0.18)', transform: `rotate(${rot}deg)`}}>
		<div style={{width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden'}}>
			<Img src={staticFile(`img/ote/${src}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, display: 'block'}} />
		</div>
	</div>
);

const Texto: React.FC<{top: number; size?: number; children: React.ReactNode}> = ({top, size = 38, children}) => (
	<div style={{position: 'absolute', top, left: 64, right: 64, fontFamily: SANS, fontSize: size, lineHeight: 1.38, color: C.tinta}}>{children}</div>
);
const B: React.FC<{children: React.ReactNode}> = ({children}) => <b style={{color: C.bordo}}>{children}</b>;

/** 1 · Portada: la foto con los logos del centro examinador y el escudo del cole. */
export const PostOte: React.FC = () => (
	<Base n="1/4">
		{/* la foto entera (con los logos del centro examinador), en su proporción */}
		<div style={{position: 'absolute', top: 100, left: 540 - 402, width: 804, height: 1004, padding: 12, background: C.papel, borderRadius: 28, boxShadow: '0 20px 50px rgba(19,32,90,0.18)'}}>
			<div style={{width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden'}}>
				<Img src={staticFile('img/ote/portada.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
			</div>
		</div>
		<div style={{position: 'absolute', top: 1000, right: 70, width: 170, height: 170, borderRadius: '50%', background: C.papel, boxShadow: '0 14px 34px rgba(19,32,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('img/escudo.png')} style={{width: 120}} />
		</div>
		<div style={{position: 'absolute', top: 1140, left: 56, right: 260, display: 'flex', flexDirection: 'column', gap: 8}}>
			<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1.0, letterSpacing: '-0.02em', color: C.azul}}>
				Oxford Test of <span style={{color: C.bordo}}>English</span>
			</div>
			<div style={{fontSize: 30, color: C.tintaSuave}}>Nuestros alumnos rindieron el OTE</div>
		</div>
	</Base>
);

/** 2 · Las sesiones del examen. */
export const PostOte2: React.FC = () => (
	<Base n="2/4">
		<Foto src="computadoras" top={120} alto={720} pos="50% 30%" rot={-0.8} />
		<Texto top={900}>
			Se llevaron a cabo <B>tres sesiones del Oxford Test of English (OTE)</B> para estudiantes del <B>Instituto Álvarez Condarco</B>, en la sede Pilar, Centro examinador autorizado del Centro de Idiomas de la Escuela de Lenguas Modernas.
		</Texto>
	</Base>
);

/** 3 · La grabación de Oxford University Press. */
export const PostOte3: React.FC = () => (
	<Base n="3/4">
		<Foto src="grabacion" top={120} alto={760} pos="50% 55%" rot={0.8} />
		<Texto top={930} size={36}>
			Coincidió con la <B>grabación de video</B> para difusión institucional del equipo de <B>OUP (Oxford University Press)</B>, que vino a nuestro país especialmente desde el Reino Unido, con motivo del <B>décimo aniversario del OTE</B>.
		</Texto>
	</Base>
);

/** 4 · Qué es el OTE. */
export const PostOte4: React.FC = () => (
	<Base n="4/4">
		<div style={{position: 'absolute', left: 540 - 230, top: 170, width: 460, height: 460, borderRadius: '50%', background: C.doradoClaro, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
			<Img src={staticFile('img/escudo.png')} style={{width: 290}} />
		</div>
		<div style={{position: 'absolute', top: 700, left: 64, right: 64, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.05, color: C.azul}}>
			¿Qué es el <span style={{color: C.bordo}}>OTE</span>?
		</div>
		<Texto top={820} size={40}>
			<div style={{textAlign: 'center'}}>
				El Oxford Test of English es un examen <B>adaptativo</B> de dominio de inglés general en <B>modalidad online</B>, más flexible, más económico y más rápido.
			</div>
		</Texto>
	</Base>
);
