import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Starburst} from '../Fx';
import {C, T, clamp} from '../lib';

const TEXT = T.typeText;
const ACCENT_FROM = TEXT.indexOf('Claude');

/** El logo se dibuja rayo a rayo y se presenta con un texto tecleado. */
export const Logo: React.FC = () => {
	const f = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const typeAt = T.typeStart - T.logoIn;

	const ray = (i: number) => spring({frame: f - 4 - i * 1.2, fps, config: {damping: 11, stiffness: 140, mass: 0.6}});
	const spin = spring({frame: f - 4, fps, config: {damping: 18, stiffness: 55}});
	const rotation = interpolate(spin, [0, 1], [-140, 0]) + f * 0.35;

	const lift = spring({frame: f - (typeAt - 8), fps, config: {damping: 15}});
	const typed = Math.floor((f - typeAt) / T.charFrames) + 1;
	const typing = typed > 0 && typed <= TEXT.length;
	const cursorOn = typing || Math.floor(f / 8) % 2 === 0;

	const sub = spring({frame: f - 62, fps, config: {damping: 14}});
	const exit = interpolate(f, [durationInFrames - 12, durationInFrames], [0, 1], clamp);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				opacity: 1 - exit,
				transform: `scale(${1 + exit * 0.18})`,
				filter: `blur(${exit * 14}px)`,
			}}
		>
			<div style={{transform: `translateY(${interpolate(lift, [0, 1], [0, -170])}px) scale(${interpolate(lift, [0, 1], [1.25, 0.8])})`}}>
				<Starburst size={340} progress={ray} rotation={rotation} glow={1 + 0.4 * Math.sin(f / 6)} />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 600,
					fontSize: 128,
					fontWeight: 800,
					letterSpacing: -3,
					color: C.cream,
					display: 'flex',
					alignItems: 'center',
				}}
			>
				{TEXT.split('').map((ch, i) => {
					const p = spring({frame: f - typeAt - i * T.charFrames, fps, config: {damping: 10, stiffness: 220}});
					const cursorHere = i === Math.min(Math.max(typed, 1), TEXT.length) - 1;
					return (
						<span
							key={i}
							style={{
								position: 'relative',
								display: 'inline-block',
								whiteSpace: 'pre',
								color: i >= ACCENT_FROM ? C.orange : C.cream,
							}}
						>
							<span
								style={{
									display: 'inline-block',
									opacity: i < typed ? 1 : 0,
									transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`,
								}}
							>
								{ch}
							</span>
							{cursorHere && (
								<span
									style={{
										position: 'absolute',
										left: typed > 0 ? '100%' : 0,
										top: 18,
										width: 10,
										height: 118,
										marginLeft: 8,
										background: C.orange,
										borderRadius: 4,
										opacity: f >= typeAt - 6 && cursorOn ? 1 : 0,
									}}
								/>
							)}
						</span>
					);
				})}
			</div>
			<div
				style={{
					position: 'absolute',
					top: 770,
					fontSize: 46,
					fontWeight: 400,
					color: C.sand,
					opacity: sub,
					letterSpacing: 1,
					transform: `translateY(${(1 - sub) * 30}px)`,
				}}
			>
				…y esto es lo que sé animar.
			</div>
		</AbsoluteFill>
	);
};
