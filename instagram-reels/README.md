# Reels de Instagram — Instituto Álvarez Condarco

Videos verticales 1080×1920 (9:16) hechos con Remotion, con el sistema de diseño
"Álvarez Condarco" de Claude Design: colores, Bricolage Grotesque + Figtree,
escudo y fotos reales del colegio. La música y los efectos se sintetizan en Python.

## Reel "Inscripciones 2027" (30 s)

Video: [`out/inscripciones-2027.mp4`](out/inscripciones-2027.mp4)

| Tiempo | Escena | Voz |
|---|---|---|
| 0–5 s | Escudo + "Inscripciones abiertas" | b1 |
| 5–10 s | Jardín / Primaria / Secundaria con fotos | b2 *(falta grabar)* |
| 10–13 s | "Inscribirte es muy fácil" | b3 |
| 13–18 s | Paso 1: se escribe alvarezcondarco.com + "link de la descripción" | b4 |
| 18–21 s | Paso 2: clic en Admisiones | b5 |
| 21–25 s | Paso 3: se completa y envía el formulario | b6 |
| 25–30 s | Cierre con la fachada, web y lema | b7 *(falta grabar)* |

Contenido fuera de las zonas que tapa Instagram (arriba ~220 px, abajo ~420 px).

## Cambiar o agregar voces

Las locuciones están en `audio/vo/` (`b1_inscripciones.wav` … `b7_cierre.wav`).
Para sumar un bloque que falta, guardá el audio con ese nombre (cualquier formato
que lea ffmpeg sirve) y volvé a renderizar. En `src/timeline.json`, `at` es el
frame donde empieza a hablar y `onset` los segundos de silencio al inicio del archivo.

## Uso

```bash
npm install
npm run studio   # previsualizar
npm run render   # mezcla el audio y renderiza out/inscripciones-2027.mp4
```
