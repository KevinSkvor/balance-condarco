"""Música del resumen en video de la Muestra 2026 (~16 s): ukelele, glockenspiel y percusión suave.

Sólo numpy. Re mayor, 112 BPM, con la misma grilla que src/muestra/ResumenMuestra.tsx:
dos tiempos de entrada, video del circuito, 3 fotos de tres tiempos, video de la ronda, 2 fotos más y placa final.
Arranca con el glockenspiel, entra el rasguido, la ronda tiene un puente más abierto y cierra con acorde y campanita.

Uso:  python3 audio/make_audio_resumen_muestra.py   ->  public/muestra/musica-resumen.wav
"""

import pathlib
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
FPS = 30
BEAT = 60 / 112
en_tiempo = lambda n: round((2 * BEAT + n * BEAT) * FPS)
T_FOTOS_A, T_RONDA, T_FOTOS_B, T_FINAL = 5, 14, 20, 26  # tiempos, iguales a ResumenMuestra.tsx
PASO = 3  # tiempos por foto
FINAL = en_tiempo(T_FINAL)  # cuadro en que aparece la placa con el escudo
FRAMES = FINAL + 45
N = int(SR * FRAMES / FPS)
TOTAL = N / SR
rng = np.random.default_rng(7)
mix = np.zeros((2, N))
rev = np.zeros((2, N))


def tv(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, w):
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w


def place(sig, t, pan=0.0, gain=1.0, r=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    lr = np.stack([np.cos(a) * sig, np.sin(a) * sig]) * gain
    mix[:, i : i + len(sig)] += lr
    rev[:, i : i + len(sig)] += lr * r


def pluck(note, dur=1.0, bright=0.4):
    f = midi(note)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p) * bright + lowpass(rng.uniform(-1, 1, p + 8), 4)[:p] * (1 - bright)
    n = int(dur * SR)
    out = np.zeros(n)
    for i in range(0, n, p):
        k = min(p, n - i)
        out[i : i + k] = buf[:k]
        buf = 0.996 * 0.5 * (buf + np.roll(buf, -1))
    return out * np.clip((dur - tv(dur)) / 0.1, 0, 1)


def strum(chord, down=True, vel=1.0, dur=0.8):
    out = np.zeros(int((dur + 0.06) * SR))
    for i, n in enumerate(chord if down else chord[::-1]):
        s = pluck(n, dur, 0.3 + 0.2 * vel)
        j = int(i * 0.012 * SR)
        out[j : j + len(s)] += s[: len(out) - j] * vel
    return out / len(chord)


def glock(note, dur=1.4):
    t = tv(dur)
    f = midi(note)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)
    return s * np.minimum(t / 0.002, 1)


def pad(notes, dur, attack=0.6, release=0.8):
    t = tv(dur + release)
    out = sum(np.sin(2 * np.pi * midi(n) * (1 + d) * t) for n in notes for d in (-0.002, 0.002))
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return out * env / (2 * len(notes))


def kick():
    t = tv(0.3)
    return np.sin(2 * np.pi * np.cumsum(50 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 10)


def shaker():
    t = tv(0.08)
    n = rng.uniform(-1, 1, len(t))
    return (n - lowpass(n, 3)) * np.exp(-t * 60)


def bass(note, dur):
    t = tv(dur)
    f = midi(note)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 2) * np.clip((dur - t) / 0.05, 0, 1)


PROG = [(38, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (43, [62, 67, 71, 74])]  # D A Bm G
PUENTE = [(43, [62, 67, 71, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (45, [61, 64, 69, 73])]  # G A Bm A
MELODIA = [78, 76, 74, 76, 78, 78, 78, None, 76, 76, 76, None, 78, 81, 81, None]  # en corcheas
PAT = [(0, 1, 1.0), (1, 1, 0.5), (1.5, 0, 0.55), (2.5, 0, 0.6), (3, 1, 0.8), (3.5, 0, 0.5)]
fin = FINAL / FPS
intro = BEAT * 2  # dos tiempos sólo de glockenspiel

bar = 0
while True:
    t0 = intro + bar * 4 * BEAT
    if t0 >= fin - 0.05:
        break
    puente = en_tiempo(T_RONDA) / FPS - 0.05 <= t0 < en_tiempo(T_FOTOS_B) / FPS - 0.05
    root, chord = (PUENTE if puente else PROG)[bar % 4]
    place(pad(chord, BEAT * 4), t0, gain=0.2 if puente else 0.12, r=0.5)
    for b, down, v in PAT:
        ts = t0 + b * BEAT + rng.uniform(-0.006, 0.006)
        if ts < fin - 0.05:
            place(strum(chord, down, v), ts, pan=0.2, gain=0.45, r=0.2)
    for k in range(8):
        ts = t0 + k * BEAT / 2
        if ts >= fin - 0.05:
            break
        if k in (0, 4):
            place(kick(), ts, gain=0.28)
        place(shaker(), ts, pan=0.4, gain=0.05 + 0.03 * (k % 2))
        if k in (0, 3, 4):
            place(bass(root, BEAT * 0.9), ts, gain=0.3)
        n = MELODIA[(bar % 2) * 8 + k]
        if n:
            place(glock(n), ts, pan=-0.3, gain=0.16, r=0.4)
    bar += 1
cortes = [en_tiempo(T_FOTOS_A + PASO * k) for k in range(3)] + [en_tiempo(T_RONDA)] + [en_tiempo(T_FOTOS_B + PASO * k) for k in range(2)]
for k, c in enumerate(cortes):  # golpe suave en cada corte
    tc = c / FPS
    place(glock(86 + [0, 2, 4, 2, 4, 7, 9][k % 7], 0.8), tc, pan=0.3, gain=0.07, r=0.5)
    t = tv(0.25)
    place((rng.uniform(-1, 1, len(t)) - lowpass(rng.uniform(-1, 1, len(t)), 6)) * np.sin(np.pi * t / 0.25) ** 2, tc - 0.18, gain=0.06)
for i, n in enumerate([74, 78, 81]):  # entrada
    place(glock(n), i * BEAT * 0.66, pan=-0.3, gain=0.15, r=0.4)
place(strum([62, 66, 69, 74], True, 1.0, 2.0), fin, gain=0.55, r=0.5)
place(pad([50, 62, 66, 69, 74], TOTAL - fin, attack=0.2, release=0.1), fin, gain=0.3, r=0.6)
for i, n in enumerate([86, 90, 93]):
    place(glock(n, 1.8), fin + 0.15 + i * 0.08, gain=0.12, r=0.6)

ir_t = tv(1.8)
for ch in range(2):
    ir = lowpass(rng.uniform(-1, 1, len(ir_t)), 5) * np.exp(-ir_t * 3)
    ir[: int(0.02 * SR)] = 0
    n = 1 << int(np.ceil(np.log2(N + len(ir))))
    mix[ch] += np.fft.irfft(np.fft.rfft(rev[ch], n) * np.fft.rfft(ir / np.sqrt(np.sum(ir**2)), n), n)[:N] * 0.4
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.05, 1) * np.clip((TOTAL - tt) / 0.8, 0, 1)
mix = np.tanh(mix * 1.1)
mix *= 0.9 / np.max(np.abs(mix))

out = ROOT / "public" / "muestra" / "musica-resumen.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
