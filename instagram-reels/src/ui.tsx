import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, DISPLAY, SANS, clamp, sp} from './lib';

/** Volanta: mayúsculas, Figtree 700, bordó. Las letras se abren al entrar. */
export const Volanta: React.FC<{at: number; children: string; color?: string; size?: number}> = ({at, children, color = C.bordo, size = 32}) => {
	const f = useCurrentFrame();
	const s = sp(f, at, {damping: 20});
	return (
		<div
			style={{
				fontFamily: SANS,
				fontSize: size,
				lineHeight: 1.2,
				fontWeight: 700,
				letterSpacing: `${0.28 - 0.14 * s}em`,
				color,
				opacity: s,
			}}
		>
			{children}
		</div>
	);
};

/**
 * Título en Bricolage. `parts` alterna texto normal y acentuado: ['Inscripciones ', 'abiertas'].
 * Cada palabra sube desde una máscara, escalonada.
 */
export const Titulo: React.FC<{
	at: number;
	parts: string[];
	size: number;
	color?: string;
	accent?: string;
	align?: 'left' | 'center';
	stagger?: number;
}> = ({at, parts, size, color = C.azul, accent = C.bordo, align = 'left', stagger = 3}) => {
	const f = useCurrentFrame();
	let w = 0;
	return (
		<h1
			style={{
				margin: 0,
				fontFamily: DISPLAY,
				fontWeight: 700,
				fontSize: size,
				lineHeight: 1.04,
				letterSpacing: '-0.02em',
				color,
				textAlign: align,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				columnGap: size * 0.26,
			}}
		>
			{parts.flatMap((part, pi) =>
				part
					.split(' ')
					.filter(Boolean)
					.map((word) => {
						const s = sp(f, at + w++ * stagger, {damping: 16, stiffness: 140});
						return (
							<span key={`${pi}-${word}-${w}`} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08}}>
								<span
									style={{
										display: 'inline-block',
										color: pi % 2 ? accent : color,
										transform: `translateY(${(1 - s) * 110}%)`,
									}}
								>
									{word}
								</span>
							</span>
						);
					}),
			)}
		</h1>
	);
};

/** Franja tricolor de los niveles (sol / celeste / bordó), como en el feed. */
export const Tricolor: React.FC<{at: number; height?: number}> = ({at, height = 18}) => {
	const f = useCurrentFrame();
	return (
		<div style={{display: 'flex', height, width: '100%'}}>
			{[C.sol, C.celeste, C.bordo].map((c, i) => {
				const s = interpolate(f, [at + i * 4, at + i * 4 + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
				return <div key={c} style={{flex: 1, background: c, transform: `scaleX(${s})`, transformOrigin: 'left'}} />;
			})}
		</div>
	);
};

/** Puntero de mouse. */
export const Cursor: React.FC<{x: number; y: number; press?: number}> = ({x, y, press = 0}) => (
	<svg
		width={64}
		height={64}
		viewBox="0 0 24 24"
		style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: '20% 15%', filter: 'drop-shadow(0 4px 8px rgba(11,20,64,0.35))'}}
	>
		<path d="M5 3 L5 19 L9.5 14.8 L12.6 21 L15.2 19.8 L12.2 13.7 L18.4 13.4 Z" fill={C.noche} stroke={C.papel} strokeWidth={1.4} strokeLinejoin="round" />
	</svg>
);

/** Ícono de tilde, estilo Lucide (trazo 1.75, puntas redondeadas). */
export const Check: React.FC<{size: number; color: string; progress?: number}> = ({size, color, progress = 1}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M5 12.5 L10 17.5 L19 7"
			stroke={color}
			strokeWidth={2.4}
			strokeLinecap="round"
			strokeLinejoin="round"
			pathLength={1}
			strokeDasharray={1}
			strokeDashoffset={1 - progress}
		/>
	</svg>
);
