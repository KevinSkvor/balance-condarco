# Claude Showreel — 10 s con Remotion + audio sintetizado en Python

Video final: [`out/claude-showreel.mp4`](out/claude-showreel.mp4) (1920×1080, 30 fps, 10 s).

## Escenas

| Tiempo | Escena | Técnica |
|---|---|---|
| 0.0–1.0 s | Una chispa absorbe energía y se contrae antes de explotar | anticipación, partículas con arrastre, onda expansiva, sacudida de cámara |
| 1.3–4.0 s | El logo se dibuja rayo a rayo + "Hola, soy Claude" tecleado | springs escalonados, tipografía cinética |
| 4.0–7.0 s | "Mis superpoderes": 4 tarjetas con mini animaciones | oscilador amortiguado, órbitas, texto en ola, ecualizador al ritmo del bombo |
| 7.0–8.6 s | Pelota con squash & stretch | caída libre, parábolas, deformación por velocidad, estela, polvo |
| 8.5–10 s | Implosión → BOOM → "Animado 100% con código" | convergencia, overshoot, partículas |

## Audio (Python + numpy, sin samples)

`audio/make_audio.py` sintetiza todo desde cero: bombo, caja, hi-hats, bajo, pad con
sidechain, arpegio, campanas FM-like, whooshes, clicks de teclado, "boings", riser,
crash y una reverb por convolución. Lee la misma `src/timeline.json` que Remotion,
así que cada sonido cae en el frame exacto de su evento visual.

## Uso

```bash
npm install
npm run audio    # genera public/soundtrack.wav
npm run studio   # previsualizar en el navegador
npm run render   # audio + render a out/claude-showreel.mp4
```
