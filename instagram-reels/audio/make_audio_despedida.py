"""Música de la invitación animada a la despedida de fin de año 2026.

Sólo numpy. 100 BPM (18 cuadros por tiempo a 30 fps), con la misma grilla que
src/despedida/DespedidaAnimada.tsx. Piano en arpegios, cuerdas suaves y celesta;
una campanita en cada dato que aparece y un final brillante con el confeti.

Uso:  python3 audio/make_audio_despedida.py   ->  public/despedida/musica.wav
"""

import pathlib
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
FPS = 30
BEAT_F = 18
BEAT = BEAT_F / FPS
FRAMES = BEAT_F * 28
N = int(SR * FRAMES / FPS)
TOTAL = N / SR
rng = np.random.default_rng(12)
mix = np.zeros((2, N))
rev = np.zeros((2, N))


def tv(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w


def place(sig, t, pan=0.0, gain=1.0, r=0.3):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    lr = np.stack([np.cos(a) * sig, np.sin(a) * sig]) * gain
    mix[:, i : i + len(sig)] += lr
    rev[:, i : i + len(sig)] += lr * r


def piano(note, dur=3.0, vel=1.0):
    t = tv(dur)
    f = midi(note)
    s = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * d) for k, (a, d) in enumerate([(1, 1.0), (0.4, 1.8), (0.18, 3.0), (0.08, 4.5)], 1))
    return s * np.minimum(t / 0.006, 1) * np.clip((dur - t) / 0.4, 0, 1) * vel


def cuerdas(notes, dur, attack=1.0, release=1.2):
    t = tv(dur + release)
    vib = 1 + 0.002 * np.sin(2 * np.pi * 5 * t)
    out = sum(np.sin(2 * np.pi * midi(n) * (1 + det) * k * np.cumsum(vib) / SR) / k**1.6 for n in notes for det in (-0.003, 0.0, 0.003) for k in range(1, 5))
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return lowpass(out, 6) * env / (3 * len(notes))


def celesta(note, dur=1.6):
    t = tv(dur)
    f = midi(note)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 7)) * np.minimum(t / 0.002, 1)


def shimmer(dur=1.2):
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    return (n - lowpass(n, 3)) * np.sin(np.pi * t / dur) ** 2 * 0.6


def kick():
    t = tv(0.3)
    return np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)


# Re mayor: D – Bm – G – A, un acorde por compás de 4 tiempos
PROG = [(38, [62, 66, 69]), (35, [59, 62, 66]), (43, [59, 62, 67]), (45, [61, 64, 69])]
ARP = [0, 1, 2, 1, 2, 1, 0, 1]
fin = BEAT * 18  # "¡Los esperamos!"
ritmo = BEAT * 10  # desde los datos entra un pulso suave
bar = 0
while bar * 4 * BEAT < TOTAL - 0.5:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(cuerdas(chord, 4 * BEAT), t0, gain=0.42, r=0.6)
    place(piano(root - 12, 3.5, 0.6), t0, gain=0.36)
    for s in range(8):
        place(piano(chord[ARP[s]] + 12, 2.2, 0.5 + 0.1 * (s == 0)), t0 + s * BEAT / 2, pan=-0.3 + 0.08 * s, gain=0.2)
        if t0 >= ritmo - 0.01 and s in (0, 4):
            place(kick(), t0 + s * BEAT / 2, gain=0.18, r=0)
    bar += 1

# celesta en cada aparición (marco, escudo, nombre, título, datos)
apariciones = [0, 2, 4, 6, 8, 9, 10, 12, 14, 16, 17]
notas = [74, 78, 81, 86, 85, 88, 83, 86, 81, 85, 90]
for b, n in zip(apariciones, notas):
    place(celesta(n), b * BEAT, pan=0.25, gain=0.16, r=0.6)
place(shimmer(1.4), 2 * BEAT - 0.3, gain=0.1)  # brillo del escudo
# final: acorde abierto, cascada de celesta y brillo con el confeti
place(cuerdas([62, 66, 69, 74], TOTAL - fin, attack=0.3, release=0.2), fin, gain=0.5, r=0.6)
for i, n in enumerate([74, 78, 81, 86, 90, 93, 98]):
    place(celesta(n, 2.2), fin + 0.12 + i * 0.09, pan=-0.4 + i * 0.13, gain=0.13, r=0.7)
place(shimmer(2.0), fin, gain=0.12)

ir_t = tv(2.2)
for ch in range(2):
    ir = lowpass(rng.uniform(-1, 1, len(ir_t)), 5) * np.exp(-ir_t * 2.4)
    ir[: int(0.02 * SR)] = 0
    n = 1 << int(np.ceil(np.log2(N + len(ir))))
    mix[ch] += np.fft.irfft(np.fft.rfft(rev[ch], n) * np.fft.rfft(ir / np.sqrt(np.sum(ir**2)), n), n)[:N] * 0.45
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.05, 1) * np.clip((TOTAL - tt) / 1.5, 0, 1)
mix = np.tanh(mix * 1.1)
mix *= 0.9 / np.max(np.abs(mix))

out = ROOT / "public" / "despedida" / "musica.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
