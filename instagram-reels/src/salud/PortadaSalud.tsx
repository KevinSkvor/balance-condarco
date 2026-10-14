import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, DISPLAY, SANS} from '../lib';
import {Signo} from './Salud';

/**
 * Portada del reel "Salud y Adolescencia" (1080×1920). Lo importante queda dentro
 * del recorte 3:4 de la grilla del perfil (franja central: y 240–1680).
 */
export const PortadaSalud: React.FC = () => (
	<AbsoluteFill style={{background: C.crema, fontFamily: SANS}}>
		<div style={{position: 'absolute', top: 290, left: 72, right: 72, display: 'flex', flexDirection: 'column', gap: 20}}>
			<div style={{fontSize: 30, fontWeight: 700, letterSpacing: '0.14em', color: C.bordo}}>4.º AÑO · SALUD Y ADOLESCENCIA</div>
			<h1 style={{margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.azul}}>
				Crecer viene
				<br />
				con <span style={{color: C.bordo}}>preguntas</span>
			</h1>
		</div>

		{/* signos de pregunta, ya dibujados (at negativo) */}
		<Signo x={950} y={420} size={100} color={C.sol} at={-100} seed={2} />
		<Signo x={870} y={320} size={64} color={C.celeste} at={-100} seed={1} />

		<div style={{position: 'absolute', top: 640, left: 72, right: 72, height: 640, borderRadius: 28, overflow: 'hidden'}}>
			<Img src={staticFile('img/salud/charla-2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '30% 50%'}} />
		</div>
		<Signo x={985} y={690} size={96} color={C.bordo} at={-100} seed={4} />

		<div style={{position: 'absolute', top: 1330, left: 72, right: 72, display: 'flex', gap: 16}}>
			{[
				['Preguntar', C.bordo],
				['Escuchar', C.celeste],
				['Cuidarse', C.azul],
			].map(([t, c]) => (
				<div key={t} style={{padding: '14px 30px', borderRadius: 999, background: c, color: C.papel, fontSize: 38, fontWeight: 700}}>
					{t}
				</div>
			))}
		</div>

		<div style={{position: 'absolute', top: 1470, left: 72, display: 'flex', alignItems: 'center', gap: 18}}>
			<Img src={staticFile('img/escudo.png')} style={{height: 84}} />
			<div>
				<div style={{fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: C.azul}}>Instituto Álvarez Condarco</div>
				<div style={{fontSize: 24, color: C.tintaSuave}}>Un estilo en pos de la excelencia</div>
			</div>
		</div>

		<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', height: 20}}>
			{[C.sol, C.celeste, C.bordo].map((c) => (
				<div key={c} style={{flex: 1, background: c}} />
			))}
		</div>
	</AbsoluteFill>
);
