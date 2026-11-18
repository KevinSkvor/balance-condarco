"""Banda sonora del reel del concert (Mamma Mia!) de la Muestra Anual 2026 de Secundaria.

Toma el audio limpio de cada video (audio/concert/c*-limpio.wav, sin bullicio), lo corta con los
mismos tiempos que src/concert/Concert.tsx, con fundidos de 8 cuadros, y suma una música de fondo
suave (piano y cuerdas): más presente en las escenas habladas y casi muda bajo las canciones.

Uso:  python3 audio/make_audio_concert.py   ->  public/concert/soundtrack.wav
"""

import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
FPS = 30
XF = 8
# igual que CORTES en Concert.tsx: [video, desde (s), duración (s), hablada]
CORTES = [
    ("c3", 0, 8, False),
    ("c1", 29.3, 11, True),
    ("c1", 58.3, 5.5, True),
    ("c2", 28.6, 6.6, True),
    ("c3", 20, 7.5, False),
    ("c3", 52, 8, False),
    ("c4", 0, 9, False),
    ("c4", 26, 9, False),
]
inicios = []
for i, (_, _, d, _) in enumerate(CORTES):
    inicios.append(0 if i == 0 else inicios[-1] + round(CORTES[i - 1][2] * FPS) - XF)
FIN = inicios[-1] + round(CORTES[-1][2] * FPS)
FRAMES = FIN + 60
N = int(SR * FRAMES / FPS)
TOTAL = N / SR
rng = np.random.default_rng(5)


def cargar(src, desde, dur):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(desde), "-t", str(dur), "-i", str(ROOT / "audio" / "concert" / f"{src}-limpio.wav"), "-ac", "2", "-ar", str(SR), "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, "<i2").astype(float).reshape(-1, 2).T / 32768


voz = np.zeros((2, N))
hablada = np.zeros(N)
for i, (src, desde, dur, hab) in enumerate(CORTES):
    x = cargar(src, desde, dur)
    n = x.shape[1]
    env = np.ones(n)
    k = int(XF / FPS * SR)
    if i > 0:
        env[:k] = np.linspace(0, 1, k)
    env[-k:] = np.minimum(env[-k:], np.linspace(1, 0, k))
    if i == len(CORTES) - 1:
        f = int(0.8 * SR)
        env[-f:] = np.minimum(env[-f:], np.linspace(1, 0, f))
    a = int(inicios[i] / FPS * SR)
    m = min(n, N - a)
    # cada corte normalizado a un nivel parejo
    g = 0.25 / (np.sqrt(np.mean(x**2)) + 1e-9)
    voz[:, a : a + m] += x[:, :m] * env[:m] * min(g, 4)
    if hab:
        hablada[a : a + m] = np.maximum(hablada[a : a + m], env[:m])

# ───────── música de fondo: piano y cuerdas, La mayor, 80 BPM ─────────


def tv(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w


def piano(note, dur=3.0, vel=1.0):
    t = tv(dur)
    f = midi(note)
    s = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * d) for k, (a, d) in enumerate([(1, 1.0), (0.4, 1.8), (0.18, 3.0), (0.08, 4.5)], 1))
    return s * np.minimum(t / 0.006, 1) * np.clip((dur - t) / 0.4, 0, 1) * vel


def cuerdas(notes, dur, attack=1.0, release=1.2):
    t = tv(dur + release)
    out = np.zeros(len(t))
    for n in notes:
        for det in (-0.003, 0.0, 0.003):
            f = midi(n) * (1 + det)
            vib = 1 + 0.002 * np.sin(2 * np.pi * 5 * t)
            out += sum(np.sin(2 * np.pi * f * k * np.cumsum(vib) / SR) / k**1.6 for k in range(1, 5))
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return lowpass(out, 6) * env / (3 * len(notes))


mus = np.zeros((2, N))


def place(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    mus[0, i : i + len(sig)] += np.cos(a) * sig * gain
    mus[1, i : i + len(sig)] += np.sin(a) * sig * gain


BEAT = 60 / 80
PROG = [(45, [61, 64, 69]), (42, [61, 66, 69]), (38, [62, 66, 69]), (40, [59, 64, 68])]  # A F#m D E
ARP = [0, 1, 2, 1, 2, 1, 0, 1]
bar = 0
while bar * 4 * BEAT < TOTAL:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(cuerdas(chord, 4 * BEAT), t0, gain=0.5)
    place(piano(root - 12, 3.5, 0.6), t0, gain=0.4)
    for s in range(8):
        place(piano(chord[ARP[s]] + 12, 2.0, 0.5), t0 + s * BEAT / 2, pan=-0.3 + 0.08 * s, gain=0.22)
    bar += 1

# reverb sencilla para la música
ir_t = tv(2.0)
for ch in range(2):
    ir = lowpass(rng.uniform(-1, 1, len(ir_t)), 5) * np.exp(-ir_t * 2.5)
    ir[: int(0.02 * SR)] = 0
    n2 = 1 << int(np.ceil(np.log2(N + len(ir))))
    mus[ch] += np.fft.irfft(np.fft.rfft(mus[ch], n2) * np.fft.rfft(ir / np.sqrt(np.sum(ir**2)), n2), n2)[:N] * 0.35
mus *= 0.25 / (np.sqrt(np.mean(mus**2)) + 1e-9)

# nivel de la música: presente bajo lo hablado, casi muda bajo las canciones, sube en el cierre
nivel = 0.07 + 0.33 * lowpass(hablada, int(0.4 * SR))[:N] if len(hablada) else np.full(N, 0.07)
nivel = np.pad(nivel, (0, N - len(nivel)), constant_values=nivel[-1])[:N]
fin = int(FIN / FPS * SR)
nivel[fin - int(0.8 * SR) :] = np.maximum(nivel[fin - int(0.8 * SR) :], np.linspace(0.07, 0.6, N - fin + int(0.8 * SR)))
tt = np.arange(N) / SR
mix = voz * 0.95 + mus * nivel
mix *= np.minimum(tt / 0.05, 1) * np.clip((TOTAL - tt) / 1.0, 0, 1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix *= 0.92 / np.max(np.abs(mix))

out = ROOT / "public" / "concert" / "soundtrack.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
