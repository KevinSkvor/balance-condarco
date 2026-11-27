"""Música original de festejo (house, 124 BPM) para el reel "Último día · Egresados 2026".

Sólo numpy. Composición propia: progresión Am – F – C – G, bombo, bajo en contratiempo, palmas,
hi-hat, acordes de sintetizador y arpegio de piano. Sigue la grilla de src/egresados/Egresados.tsx:
la previa (aulas y egresados) ya bailable pero contenida, subida mientras las familias esperan afuera,
"drop" con todo cuando arranca la espuma, final abierto con el escudo.

Uso:  python3 audio/make_audio_egresados.py   ->  public/egresados/soundtrack.wav
"""

import pathlib
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100
FPS = 30
BPM = 124
BEAT = 60 / BPM
# grilla en tiempos, igual que Egresados.tsx
RISER, DROP_B, FIN_B, CIERRE_B = 42, 48, 84, 8
FRAMES = round((FIN_B + CIERRE_B) * BEAT * FPS)
N = int(SR * FRAMES / FPS)
TOTAL = N / SR
DROP = DROP_B * BEAT  # arranca la espuma
FIN = FIN_B * BEAT  # escudo
rng = np.random.default_rng(124)
mix = np.zeros((2, N))
rev = np.zeros((2, N))
side = np.zeros(N)  # envolvente del bombo para el "sidechain"


def tv(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, w):
    w = max(1, int(w))
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w


def place(sig, t, pan=0.0, gain=1.0, r=0.2, duck=True):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    sig = sig[: N - i]
    a = (pan + 1) * np.pi / 4
    lr = np.stack([np.cos(a) * sig, np.sin(a) * sig]) * gain
    if duck:
        lr = lr * (1 - 0.55 * side[i : i + len(sig)])
    mix[:, i : i + len(sig)] += lr
    rev[:, i : i + len(sig)] += lr * r


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def supersaw(notes, dur, bright=1.0):
    t = tv(dur)
    out = np.zeros(len(t))
    for n in notes:
        for det in (-0.012, -0.005, 0.0, 0.006, 0.013):
            out += saw(midi(n) * (1 + det), t + rng.uniform(0, 1))
    out = lowpass(out, 14 - 9 * bright)[: len(t)]
    env = np.minimum(t / 0.03, 1) * np.clip((dur - t) / 0.08, 0, 1)
    return out * env / (5 * len(notes))


def piano(note, dur=1.2, vel=1.0):
    t = tv(dur)
    f = midi(note)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d) for k, (a, d) in enumerate([(1, 3), (0.5, 5), (0.2, 8)], 1))
    return s * np.minimum(t / 0.004, 1) * vel


def kick():
    t = tv(0.35)
    return np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 35)) / SR) * np.exp(-t * 7))


def clap():
    t = tv(0.25)
    n = rng.uniform(-1, 1, len(t))
    env = sum(np.exp(-np.maximum(t - d, 0) * 40) * (t >= d) for d in (0, 0.01, 0.02))
    return (n - lowpass(n, 8)) * env * 0.6


def hat(open_=False):
    t = tv(0.25 if open_ else 0.06)
    n = rng.uniform(-1, 1, len(t))
    return (n - lowpass(n, 2)) * np.exp(-t * (14 if open_ else 70))


def bass(note, dur):
    t = tv(dur)
    f = midi(note)
    s = np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + 0.4 * saw(f, t)))
    return lowpass(s, 10)[: len(t)] * np.minimum(t / 0.005, 1) * np.clip((dur - t) / 0.03, 0, 1)


def riser(dur):
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    w = np.linspace(40, 3, len(t)).astype(int)
    out = np.array([0.0])
    hp = n - lowpass(n, 6)
    return hp * (t / dur) ** 2 * 0.8


def chime(note, dur=1.4):
    t = tv(dur)
    f = midi(note)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 8)) * np.minimum(t / 0.002, 1)


PROG = [(45, [69, 72, 76]), (41, [69, 72, 77]), (48, [67, 72, 76]), (43, [67, 71, 74])]  # Am F C G
ARP = [0, 1, 2, 1, 0, 2, 1, 2]  # patrón propio de corcheas

# ── bombo primero (define el sidechain) ──
t = DROP
k = 0
while t < FIN - 0.01:
    s = kick()
    i = int(t * SR)
    m = min(len(s), N - i)
    env = np.exp(-np.arange(m) / SR * 9)
    side[i : i + m] = np.maximum(side[i : i + m], env)
    place(s, t, gain=0.85, r=0, duck=False)
    t += BEAT
    k += 1

# ── previa: acordes, bombo en blancas, palmas y piano (ya alegre, sin el bajo todavía) ──
bar = 0
while bar * 4 * BEAT < DROP - 0.01:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    build = t0 >= RISER * BEAT - 0.01
    place(supersaw(chord, 4 * BEAT, bright=0.45), t0, gain=0.34, r=0.5)
    for k in range(4):
        tb = t0 + k * BEAT
        if tb >= DROP - 0.01:
            break
        if k in (0, 2) or build:
            place(kick(), tb, gain=0.55 if not build else 0.4, r=0, duck=False)
        if k in (1, 3):
            place(clap(), tb, gain=0.25, r=0.3, duck=False)
        place(hat(), tb + BEAT / 2, pan=0.3, gain=0.06, r=0, duck=False)
    for s8 in range(8):
        ts = t0 + s8 * BEAT / 2
        if ts < DROP - 0.01:
            place(piano(chord[ARP[s8]] + 12, 1.0, 0.7), ts, pan=-0.2 + 0.05 * s8, gain=0.18, r=0.4)
    bar += 1
place(riser((DROP_B - RISER) * BEAT), RISER * BEAT, gain=0.45, r=0.3, duck=False)

# ── cuerpo (desde el drop hasta "¡Los esperamos!") ──
bar = 0
while DROP + bar * 4 * BEAT < FIN - 0.05:
    t0 = DROP + bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(supersaw(chord + [chord[0] + 12], 4 * BEAT, bright=0.9), t0, gain=0.42, r=0.4)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb >= FIN - 0.05:
            break
        place(bass(root - 12, BEAT * 0.45), tb + BEAT / 2, gain=0.45, r=0)  # contratiempo
        if b in (1, 3):
            place(clap(), tb, gain=0.35, r=0.3, duck=False)
        place(hat(True), tb + BEAT / 2, pan=0.3, gain=0.12, r=0.1, duck=False)
        for h in (0.25, 0.75):
            place(hat(), tb + h * BEAT, pan=-0.3, gain=0.07, r=0, duck=False)
    for s in range(8):
        ts = t0 + s * BEAT / 2
        if ts >= FIN - 0.05:
            break
        place(piano(chord[ARP[s]] + 12, 1.0, 0.8), ts, pan=-0.2 + 0.05 * s, gain=0.2, r=0.4)
    bar += 1

# golpe de platillo en el drop
t = tv(2.5)
n = rng.uniform(-1, 1, len(t))
place((n - lowpass(n, 3)) * np.exp(-t * 1.6), DROP, gain=0.25, r=0.4, duck=False)

# ── final: acorde abierto y largo ──
place(supersaw([57, 64, 69, 72, 76], TOTAL - FIN, bright=0.6) * np.clip((TOTAL - FIN - tv(TOTAL - FIN)) / (TOTAL - FIN), 0, 1), FIN, gain=0.5, r=0.7, duck=False)
place(kick(), FIN, gain=0.8, r=0, duck=False)
for i, n in enumerate([81, 84, 88, 93, 96]):
    place(chime(n, 2.0), FIN + 0.1 + i * 0.09, pan=-0.4 + i * 0.2, gain=0.1, r=0.7, duck=False)

ir_t = tv(1.8)
for ch in range(2):
    ir = lowpass(rng.uniform(-1, 1, len(ir_t)), 5)[: len(ir_t)] * np.exp(-ir_t * 3)
    ir[: int(0.02 * SR)] = 0
    n2 = 1 << int(np.ceil(np.log2(N + len(ir))))
    mix[ch] += np.fft.irfft(np.fft.rfft(rev[ch], n2) * np.fft.rfft(ir / np.sqrt(np.sum(ir**2)), n2), n2)[:N] * 0.4
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.05, 1) * np.clip((TOTAL - tt) / 1.5, 0, 1)
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
mix *= 0.92 / np.max(np.abs(mix))

out = ROOT / "public" / "egresados" / "soundtrack.wav"
out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix.T, -1, 1) * 32767).astype("<i2").tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
