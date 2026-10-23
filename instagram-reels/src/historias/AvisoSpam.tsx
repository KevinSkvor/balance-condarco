import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS, SHADOW} from '../lib';

/**
 * Historia 1080×1920: aviso a las familias para que revisen la carpeta de spam.
 * Zonas libres de la interfaz de Instagram: arriba ~250 px, abajo ~340 px.
 */

const Icono: React.FC<{d: string[]; size: number; color: string; width?: number}> = ({d, size, color, width = 1.8}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		{d.map((p, i) => (
			<path key={i} d={p} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
		))}
	</svg>
);
const SOBRE = ['M3 6h18v12H3z', 'M3 7l9 6 9-6'];
const ALERTA = ['M12 3l9 16H3z', 'M12 10v4', 'M12 17h.01'];
const CURSOR = ['M5 3l14 8-6 2-2 6z'];

export const AvisoSpam: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		{/* marca */}
		<div style={{position: 'absolute', top: 260, left: 72, display: 'flex', alignItems: 'center', gap: 16}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 76}} />
			<div style={{fontFamily: DISPLAY, fontSize: 32, fontWeight: 700, color: C.azul}}>Álvarez Condarco</div>
		</div>

		{/* sobre dibujado */}
		<div style={{position: 'absolute', top: 236, right: 72, width: 150, height: 150, borderRadius: '50%', background: C.sol, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-8deg)'}}>
			<Icono d={SOBRE} size={86} color={C.tinta} width={1.7} />
		</div>

		<div style={{position: 'absolute', top: 430, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 22}}>
			<div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>AVISO PARA FAMILIAS</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.azul}}>
				¿Pediste una entrevista? Revisá tu <span style={{color: C.bordo}}>spam</span>
			</h1>
			<div style={{fontSize: 40, lineHeight: 1.4, color: C.tintaSuave}}>
				Estamos respondiendo todas las solicitudes. Algunas respuestas están llegando a la carpeta de <b style={{color: C.tinta}}>Spam</b> o <b style={{color: C.tinta}}>Correo no deseado</b>.
			</div>
		</div>

		{/* bandeja de correo genérica */}
		<div style={{position: 'absolute', top: 1080, left: 72, right: 72, borderRadius: 28, background: C.papel, boxShadow: SHADOW, border: `2px solid ${C.linea}`, overflow: 'hidden'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '22px 30px', borderBottom: `2px solid ${C.linea}`, background: C.crema}}>
				<Icono d={ALERTA} size={38} color={C.bordo} />
				<div style={{fontSize: 32, fontWeight: 700, color: C.tinta}}>Spam</div>
				<div style={{marginLeft: 'auto', fontSize: 26, color: C.tintaSuave}}>1 mensaje</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '26px 30px', background: C.doradoClaro}}>
				<div style={{width: 76, height: 76, borderRadius: '50%', background: C.papel, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
					<Img src={staticFile('img/escudo.png')} style={{height: 56}} />
				</div>
				<div style={{flex: 1, minWidth: 0}}>
					<div style={{fontSize: 32, fontWeight: 700, color: C.tinta}}>Instituto Álvarez Condarco</div>
					<div style={{fontSize: 28, color: C.tintaSuave, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>Respuesta a tu solicitud de entrevista</div>
				</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '20px 30px'}}>
				<div style={{position: 'relative', padding: '14px 32px', borderRadius: 999, border: `3px solid ${C.celeste}`, color: C.celeste, fontSize: 30, fontWeight: 700}}>
					No es spam
					<div style={{position: 'absolute', right: -26, bottom: -40, transform: 'rotate(-10deg)'}}>
						<Icono d={CURSOR} size={58} color={C.noche} width={1.6} />
					</div>
				</div>
			</div>
		</div>

		<div style={{position: 'absolute', top: 1470, left: 72, right: 72, fontSize: 32, lineHeight: 1.4, color: C.tintaSuave}}>
			Marcalo como <b style={{color: C.celeste}}>“No es spam”</b> para recibir bien nuestros próximos mensajes.
		</div>

		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
