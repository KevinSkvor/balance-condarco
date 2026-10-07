import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, DISPLAY, NIVELES, SANS, SHADOW, T, clamp, sp} from '../lib';
import {Check, Cursor, Titulo, Volanta} from '../ui';

const URL = 'alvarezcondarco.com';
const CARD = {x: 64, y: 560, w: 952, h: 860};
const BAR = 96; // alto de la barra del navegador
const ADM = {x: 834, y: 146}; // centro del ítem "Admisiones" (coords. de la tarjeta)
const BTN = {x: 476, y: 776}; // centro del botón "Enviar"

const STEPS = [
	{at: T.step1, parts: ['Entrá a la ', 'web']},
	{at: T.step2, parts: ['Andá a ', 'Admisiones']},
	{at: T.step3, parts: ['Completá tus datos y ', 'envialo']},
];

const lerp = (f: number, a: number, b: number, from: number, to: number, ease = Easing.inOut(Easing.cubic)) =>
	interpolate(f, [a, b], [from, to], {...clamp, easing: ease});

/** "Texto" abstracto que se va escribiendo dentro de un campo (sin inventar datos personales). */
const Escribiendo: React.FC<{f: number; at: number; seed: string}> = ({f, at, seed}) => {
	const widths = [150, 210, 120].map((w, i) => w * (0.7 + 0.5 * random(`${seed}${i}`)));
	let acc = 0;
	const total = widths.reduce((a, b) => a + b, 0);
	const typed = lerp(f, at, at + 12, 0, total, Easing.linear);
	return (
		<div style={{display: 'flex', gap: 12, alignItems: 'center', height: '100%'}}>
			{widths.map((w, i) => {
				const vis = Math.max(0, Math.min(w, typed - acc));
				acc += w;
				return <div key={i} style={{width: vis, height: 16, borderRadius: 8, background: C.tinta, opacity: 0.72}} />;
			})}
			{f >= at && f < at + 16 && <div style={{width: 3, height: 34, background: C.celeste, opacity: Math.floor(f / 4) % 2 ? 1 : 0.2}} />}
		</div>
	);
};

const Campo: React.FC<{f: number; at: number; label: string; top: number; children: React.ReactNode}> = ({f, at, label, top, children}) => {
	const ok = lerp(f, at + 10, at + 18, 0, 1, Easing.out(Easing.cubic));
	const focus = f >= at - 2 && f < at + 14;
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top}}>
			<div style={{fontSize: 24, fontWeight: 600, color: C.tintaSuave, marginBottom: 10}}>{label}</div>
			<div style={{position: 'relative', height: 72}}>
				{children}
				<div style={{position: 'absolute', right: 18, top: 16, opacity: ok}}>
					<Check size={40} color={C.celeste} progress={ok} />
				</div>
				{focus && <div style={{position: 'absolute', inset: -5, borderRadius: 13, border: `3px solid ${C.celeste}`, pointerEvents: 'none'}} />}
			</div>
		</div>
	);
};

export const Pasos: React.FC = () => {
	const f = useCurrentFrame();
	const [start, end] = T.scenes.pasos;

	// tarjeta del navegador
	const cardIn = sp(f, start + 2, {damping: 18, stiffness: 110});
	const cardOut = lerp(f, end - 14, end, 0, 1, Easing.in(Easing.cubic));
	const urlChars = Math.max(0, Math.min(URL.length, Math.floor((f - T.urlTypeStart) / T.urlCharFrames) + 1));
	const urlDone = T.urlTypeStart + URL.length * T.urlCharFrames;
	const loading = lerp(f, urlDone + 2, urlDone + 14, 0, 1, Easing.out(Easing.quad));
	const site = sp(f, urlDone + 10, {damping: 20});
	const formP = lerp(f, T.formIn, T.formIn + 14, 0, 1);
	const admActive = sp(f, T.admClick, {damping: 12, stiffness: 200});
	const sent = sp(f, T.sent, {damping: 12, stiffness: 160});

	// cursor: entra, va a Admisiones, se esconde mientras se completa el formulario, va a "Enviar"
	const cIn = lerp(f, T.step2 + 8, T.cursorArrive, 0, 1);
	const cToBtn = lerp(f, T.sendClick - 18, T.sendClick - 2, 0, 1);
	let cx = interpolate(cIn, [0, 1], [CARD.w + 40, ADM.x]);
	let cy = interpolate(cIn, [0, 1], [CARD.h - 120, ADM.y]) - Math.sin(cIn * Math.PI) * 60;
	if (f >= T.formIn) {
		cx = interpolate(cToBtn, [0, 1], [CARD.w - 140, BTN.x + 60]);
		cy = interpolate(cToBtn, [0, 1], [CARD.h - 40, BTN.y]);
	}
	const cursorVis =
		f >= T.step2 + 8 && f < T.sent + 18
			? f < T.formIn + 6
				? 1
				: lerp(f, T.sendClick - 18, T.sendClick - 12, 0, 1) * lerp(f, T.sent + 8, T.sent + 18, 1, 0)
			: 0;
	const press = Math.max(
		interpolate(f, [T.admClick, T.admClick + 3, T.admClick + 8], [0, 1, 0], clamp),
		interpolate(f, [T.sendClick, T.sendClick + 3, T.sendClick + 8], [0, 1, 0], clamp),
	);
	const ripple = (at: number) => (f >= at && f < at + 16 ? lerp(f, at, at + 16, 0, 1, Easing.out(Easing.cubic)) : null);
	const r1 = ripple(T.admClick);
	const r2 = ripple(T.sendClick);

	const hint = sp(f, T.hint, {damping: 12, stiffness: 160});
	const hintOut = lerp(f, T.step2 - 10, T.step2, 0, 1);
	const stepIdx = f >= T.step3 ? 2 : f >= T.step2 ? 1 : 0;

	return (
		<AbsoluteFill>
			{/* encabezado: volanta + indicador de pasos + título del paso */}
			<div style={{position: 'absolute', top: 236, left: 64, right: 64, opacity: 1 - cardOut}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<Volanta at={start}>CÓMO INSCRIBIRTE</Volanta>
					<div style={{display: 'flex', alignItems: 'center'}}>
						{STEPS.map((s, i) => {
							const on = sp(f, s.at, {damping: 12, stiffness: 180});
							const done = i < stepIdx;
							return (
								<React.Fragment key={i}>
									{i > 0 && (
										<div style={{width: 44, height: 4, background: C.linea, position: 'relative'}}>
											<div style={{position: 'absolute', inset: 0, background: C.azul, transform: `scaleX(${on})`, transformOrigin: 'left'}} />
										</div>
									)}
									<div
										style={{
											width: 60,
											height: 60,
											borderRadius: 99,
											border: `3px solid ${on > 0.5 ? C.azul : C.linea}`,
											background: on > 0.5 ? C.azul : C.papel,
											color: C.papel,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: 28,
											fontWeight: 700,
											transform: `scale(${1 + 0.18 * Math.sin(Math.min(on, 1) * Math.PI)})`,
										}}
									>
										{done ? <Check size={34} color={C.papel} /> : <span style={{color: on > 0.5 ? C.papel : C.tintaSuave}}>{i + 1}</span>}
									</div>
								</React.Fragment>
							);
						})}
					</div>
				</div>
				<div style={{position: 'relative', marginTop: 34, height: 190}}>
					{STEPS.map((s, i) => {
						const next = STEPS[i + 1]?.at ?? end + 100;
						if (f < s.at - 2 || f >= next) return null;
						const out = lerp(f, next - 8, next, 0, 1, Easing.in(Easing.cubic));
						return (
							<div key={i} style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
								<Titulo at={s.at + 2} parts={s.parts} size={86} stagger={3} />
							</div>
						);
					})}
				</div>
			</div>

			{/* ventana del navegador */}
			<div
				style={{
					position: 'absolute',
					left: CARD.x,
					top: CARD.y,
					width: CARD.w,
					height: CARD.h,
					borderRadius: 28,
					background: C.papel,
					border: `2px solid ${C.linea}`,
					boxShadow: SHADOW,
					overflow: 'hidden',
					transform: `translateY(${(1 - cardIn) * 700 + cardOut * 120}px) scale(${1 - cardOut * 0.06})`,
					opacity: Math.min(1, cardIn * 2) * (1 - cardOut),
				}}
			>
				<div style={{height: BAR, background: C.crema, borderBottom: `2px solid ${C.linea}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px'}}>
					<div style={{display: 'flex', gap: 10}}>
						{[0, 1, 2].map((i) => (
							<div key={i} style={{width: 16, height: 16, borderRadius: 99, background: C.linea}} />
						))}
					</div>
					<div
						style={{
							flex: 1,
							height: 60,
							borderRadius: 999,
							background: C.papel,
							border: `2px solid ${f >= T.urlTypeStart - 6 && f < urlDone + 4 ? C.celeste : C.linea}`,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							padding: '0 24px',
							fontSize: 32,
							fontWeight: 600,
							color: C.tinta,
						}}
					>
						<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={C.tintaSuave} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
						</svg>
						<span>{URL.slice(0, urlChars)}</span>
						{f >= T.urlTypeStart - 6 && f < urlDone + 8 && (
							<span style={{width: 3, height: 36, marginLeft: -10, background: C.celeste, opacity: Math.floor(f / 5) % 2 ? 1 : 0}} />
						)}
						{f < T.urlTypeStart && <span style={{color: C.tintaSuave, opacity: 0.6, fontWeight: 400}}>Buscá o escribí una dirección</span>}
					</div>
				</div>
				<div style={{position: 'absolute', top: BAR, left: 0, height: 4, width: `${loading * 100}%`, background: C.celeste, opacity: 1 - lerp(f, urlDone + 14, urlDone + 20, 0, 1)}} />

				{/* sitio */}
				<div style={{position: 'absolute', top: BAR, left: 0, right: 0, bottom: 0, opacity: site, transform: `translateY(${(1 - site) * 30}px)`}}>
					<div style={{height: 100, borderBottom: `2px solid ${C.linea}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14}}>
						<Img src={staticFile('img/escudo.png')} style={{height: 60}} />
						<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: C.azul, flex: 1}}>Álvarez Condarco</div>
						<div style={{fontSize: 24, fontWeight: 600, color: C.tinta, padding: '10px 12px'}}>Institución</div>
						<div style={{fontSize: 24, fontWeight: 600, color: C.tinta, padding: '10px 12px'}}>Niveles</div>
						<div
							style={{
								width: 172,
								textAlign: 'center',
								fontSize: 24,
								fontWeight: 700,
								padding: '12px 0',
								borderRadius: 999,
								color: admActive > 0.5 ? C.papel : C.bordo,
								background: admActive > 0.05 ? C.azul : 'transparent',
								border: `2px solid ${f >= T.cursorArrive - 4 ? C.azul : 'transparent'}`,
								transform: `scale(${1 + 0.08 * Math.sin(Math.min(admActive, 1) * Math.PI)})`,
							}}
						>
							Admisiones
						</div>
					</div>

					{/* inicio del sitio */}
					<div style={{position: 'absolute', top: 132, left: 32, right: 32, transform: `translateX(${-formP * 110}%)`}}>
						<div style={{position: 'relative', height: 400, borderRadius: 16, overflow: 'hidden'}}>
							<Img
								src={staticFile('img/fachada.jpg')}
								style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '32% 50%', transform: `scale(${1.12 - 0.08 * lerp(f, urlDone, T.formIn, 0, 1, Easing.linear)})`}}
							/>
							<div style={{position: 'absolute', inset: 0, background: 'rgba(11,20,64,0.55)'}} />
							<div style={{position: 'absolute', left: 36, bottom: 32, color: C.papel}}>
								<div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', color: C.doradoClaro}}>INSCRIPCIONES 2027</div>
								<div style={{fontFamily: DISPLAY, fontSize: 54, fontWeight: 700, lineHeight: 1.05, marginTop: 8}}>Instituto Álvarez Condarco</div>
							</div>
						</div>
						<div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 36}}>
							{[0.92, 0.78, 0.55].map((w, i) => (
								<div key={i} style={{width: `${w * 100}%`, height: 18, borderRadius: 9, background: C.linea}} />
							))}
						</div>
					</div>

					{/* página de Admisiones con el formulario */}
					<div style={{position: 'absolute', top: 100, left: 0, right: 0, bottom: 0, transform: `translateX(${(1 - formP) * 110}%)`}}>
						<div style={{position: 'absolute', left: 40, top: 30}}>
							<div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.12em', color: C.bordo}}>ADMISIONES · CICLO LECTIVO 2027</div>
							<div style={{fontFamily: DISPLAY, fontSize: 50, fontWeight: 700, color: C.azul, marginTop: 6}}>Solicitud de inscripción</div>
						</div>
						<Campo f={f} at={T.fields[0]} label="Nombre y apellido del alumno" top={128}>
							<div style={{height: '100%', borderRadius: 8, border: `2px solid ${C.linea}`, padding: '0 22px', background: C.papel}}>
								<Escribiendo f={f} at={T.fields[0]} seed="nombre" />
							</div>
						</Campo>
						<Campo f={f} at={T.fields[1]} label="Nivel" top={250}>
							<div style={{display: 'flex', gap: 14, height: '100%', alignItems: 'center'}}>
								{NIVELES.map((n, i) => {
									const sel = i === 1 ? sp(f, T.fields[1] + 4, {damping: 11, stiffness: 200}) : 0;
									return (
										<div
											key={n.name}
											style={{
												padding: '14px 30px',
												borderRadius: 999,
												fontSize: 26,
												fontWeight: 700,
												border: `2px solid ${sel > 0.3 ? n.color : C.linea}`,
												background: sel > 0.3 ? n.color : C.papel,
												color: sel > 0.3 ? n.ink : C.tintaSuave,
												transform: `scale(${1 + 0.1 * Math.sin(Math.min(sel, 1) * Math.PI)})`,
											}}
										>
											{n.name}
										</div>
									);
								})}
							</div>
						</Campo>
						<Campo f={f} at={T.fields[2]} label="Email o teléfono de contacto" top={372}>
							<div style={{height: '100%', borderRadius: 8, border: `2px solid ${C.linea}`, padding: '0 22px', background: C.papel}}>
								<Escribiendo f={f} at={T.fields[2]} seed="contacto" />
							</div>
						</Campo>

						{/* botón enviar */}
						<div
							style={{
								position: 'absolute',
								left: 40,
								right: 40,
								top: BTN.y - BAR - 100 - 44,
								height: 88,
								borderRadius: 999,
								background: sent > 0.5 ? C.celeste : C.azul,
								color: C.papel,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 16,
								fontSize: 34,
								fontWeight: 700,
								transform: `scale(${1 - press * 0.04 + 0.05 * Math.sin(Math.min(sent, 1) * Math.PI)})`,
							}}
						>
							{sent > 0.5 ? (
								<>
									<Check size={44} color={C.papel} progress={lerp(f, T.sent + 2, T.sent + 12, 0, 1)} />
									Solicitud enviada
								</>
							) : (
								'Enviar solicitud'
							)}
						</div>
					</div>
				</div>
			</div>

			{/* papelitos al enviar */}
			{f >= T.sent && f < T.sent + 40 && (
				<svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
					{Array.from({length: 36}, (_, i) => {
						const t = f - T.sent;
						const a = -Math.PI / 2 + (random(`cf-a${i}`) - 0.5) * 2.2;
						const v = 14 + random(`cf-v${i}`) * 22;
						const x = CARD.x + BTN.x + Math.cos(a) * v * t;
						const y = CARD.y + BTN.y + Math.sin(a) * v * t + 0.9 * t * t;
						const col = [C.sol, C.celeste, C.bordo, C.dorado][i % 4];
						return (
							<rect
								key={i}
								x={x}
								y={y}
								width={14}
								height={22}
								rx={3}
								fill={col}
								opacity={1 - t / 40}
								transform={`rotate(${t * (random(`cf-r${i}`) * 30 - 15)} ${x + 7} ${y + 11})`}
							/>
						);
					})}
				</svg>
			)}

			{/* pista: link en la descripción */}
			<div
				style={{
					position: 'absolute',
					top: CARD.y + CARD.h + 36,
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					opacity: hint * (1 - hintOut),
					transform: `translateY(${(1 - hint) * 30}px)`,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						padding: '16px 32px',
						borderRadius: 999,
						background: C.bordo,
						color: C.papel,
						fontSize: 32,
						fontWeight: 700,
					}}
				>
					o tocá el link de la descripción
					<svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={C.papel} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{transform: `translateY(${Math.abs(Math.sin(f / 5)) * 8}px)`}}>
						<path d="M12 5v14M6 13l6 6 6-6" />
					</svg>
				</div>
			</div>

			{[r1, r2].map((r, i) =>
				r === null ? null : (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: CARD.x + (i ? BTN.x + 60 : ADM.x) - 60,
							top: CARD.y + (i ? BTN.y : ADM.y) - 60,
							width: 120,
							height: 120,
							borderRadius: 99,
							border: `4px solid ${C.celeste}`,
							transform: `scale(${0.3 + r})`,
							opacity: 1 - r,
						}}
					/>
				),
			)}
			{cursorVis > 0 && (
				<div style={{opacity: cursorVis}}>
					<Cursor x={CARD.x + cx - 13} y={CARD.y + cy - 8} press={press} />
				</div>
			)}
		</AbsoluteFill>
	);
};
