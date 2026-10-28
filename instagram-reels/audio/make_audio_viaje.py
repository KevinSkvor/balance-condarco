"""Banda sonora del reel "Viaje a Nueva Atlantis": ukelele de fogón, olas y voz.

Sólo numpy. Lee src/viaje/timeline.json (la misma línea de tiempo que usa
Remotion), coloca las voces de audio/vo-viaje/ y baja la música cuando hay voz.
Olas de fondo todo el tiempo, clic de cámara en cada polaroid y fuego en el fogón.

Uso:  python3 audio/make_audio_viaje.py   ->  public/viaje/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "viaje" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
TOTAL = N / SR
BPM = 96
BEAT = 60 / BPM
rng = np.random.default_rng(33)

bus = {name: np.zeros((2, N)) for name in ("music", "sfx", "vo", "rev")}


def sec(frame):
    return frame / FPS


def word(vid, w, n=0):
    v = next(x for x in T["vo"] if x["id"] == vid)
    return sec(v["at"]) + [t for x, t in v["words"] if x == w][n]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tv(dur):
    return np.arange(int(dur * SR)) / SR


def lowpass(x, win):
    if win <= 1:
        return x
    c = np.cumsum(np.concatenate([np.zeros(win), x]))
    return (c[win:] - c[:-win]) / win


def place(sig, t, pan=0.0, gain=1.0, rev=0.0, to="music"):
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i]
    ang = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    lr = np.stack([np.cos(ang) * sig, np.sin(ang) * sig]) * gain
    bus[to][:, i : i + len(sig)] += lr
    if rev:
        bus["rev"][:, i : i + len(sig)] += lr * rev


def piano(note, dur=2.5, vel=1.0):
    """Piano suave: parciales levemente inarmónicos que se apagan a distinto ritmo."""
    t = tv(dur)
    f = midi(note)
    s = np.zeros(len(t))
    for k, (a, d) in enumerate([(1.0, 1.1), (0.45, 2.0), (0.22, 3.2), (0.1, 4.5), (0.05, 6.0)], start=1):
        fk = f * k * (1 + 0.0004 * k * k)
        s += a * np.sin(2 * np.pi * fk * t) * np.exp(-t * d * (0.8 + note / 120))
    hammer = lowpass(rng.uniform(-1, 1, len(t)), 6) * np.exp(-t * 90) * 0.08
    env = np.minimum(t / 0.006, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return (s + hammer) * env * vel


def pad(notes, dur, attack=1.2, release=1.5):
    t = tv(dur + release)
    out = np.zeros(len(t))
    for n in notes:
        for det in (-0.0018, 0.0022):
            f = midi(n) * (1 + det)
            for k in range(1, 5):
                out += np.sin(2 * np.pi * f * k * t + k) / k ** 1.4
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return out * env / (len(notes) * 2)


def chime(note, dur=2.0):
    t = tv(dur)
    f = midi(note)
    parts = [(1, 1.0, 1.8), (2.0, 0.35, 3), (3.01, 0.15, 5)]
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in parts) * np.minimum(t / 0.004, 1) * 0.5


def soft_pop(pitch=1.0):
    t = tv(0.14)
    f = (260 + 320 * (1 - np.exp(-t * 50))) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * np.minimum(t / 0.004, 1)


def air(dur=0.8):
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    return (lowpass(n, 10) - lowpass(n, 60)) * np.sin(np.pi * t / dur) ** 2 * 1.5


# ───────────────────────────── música ─────────────────────────────
# Sol mayor, aire de fogón: G – D – Em – C rasgueado, bajo y shaker; sin bombo.
# Re mayor: D – A – Bm – G, rasguido de ukelele en corcheas, bombo y shaker suaves.


def pluck(note, dur=1.2, bright=0.5):
    """Cuerda pulsada (Karplus-Strong): suena a ukelele."""
    f = midi(note)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p) * bright + lowpass(rng.uniform(-1, 1, p + 8), 4)[:p] * (1 - bright)
    n = int(dur * SR)
    out = np.zeros(n)
    for i in range(0, n, p):
        k = min(p, n - i)
        out[i : i + k] = buf[:k]
        buf = 0.996 * 0.5 * (buf + np.roll(buf, -1))
    return out * np.minimum(tv(dur) / 0.002, 1) * np.clip((dur - tv(dur)) / 0.1, 0, 1)


def strum(chord, down=True, vel=1.0, dur=0.9):
    notes = chord if down else chord[::-1]
    out = np.zeros(int((dur + 0.06) * SR))
    for i, n in enumerate(notes):
        s = pluck(n, dur, 0.35 + 0.2 * vel)
        j = int(i * 0.012 * SR)
        out[j : j + len(s)] += s[: len(out) - j] * vel
    return out / len(notes)


def kick():
    t = tv(0.35)
    f = 48 + 90 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * np.minimum(t / 0.002, 1)


def shaker(dur=0.09):
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    return (n - lowpass(n, 3)) * np.exp(-t * 55) * np.minimum(t / 0.01, 1)


def whoosh(dur=0.45, up=True):
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    env = np.sin(np.pi * (t / dur) ** (0.6 if up else 1.6)) ** 2
    return (lowpass(n, 4) - lowpass(n, 40)) * env * 1.6


def click():
    t = tv(0.03)
    return rng.uniform(-1, 1, len(t)) * np.exp(-t * 300)




def waves(dur):
    """Olas: ruido grave con oleaje lento y espuma aguda en cada rompiente."""
    t = tv(dur)
    n = rng.uniform(-1, 1, len(t))
    swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 6.5 + 1.0) ** 2
    body = lowpass(n, 40) * 6
    foam = (n - lowpass(n, 6)) * np.clip(np.sin(2 * np.pi * t / 6.5 + 1.0), 0, 1) ** 6
    return (body * swell + foam * 0.5) * 0.5


def crackle(dur):
    t = tv(dur)
    out = np.zeros(len(t))
    for _ in range(int(dur * 18)):
        i = rng.integers(0, len(t) - 400)
        out[i : i + 400] += rng.uniform(-1, 1, 400) * np.exp(-np.arange(400) / rng.uniform(20, 80)) * rng.uniform(0.2, 1)
    return out + lowpass(rng.uniform(-1, 1, len(t)), 30) * 0.6


def shutter():
    t = tv(0.12)
    n = rng.uniform(-1, 1, len(t))
    return (n - lowpass(n, 4)) * (np.exp(-t * 120) + 0.6 * np.exp(-np.maximum(t - 0.06, 0) * 140) * (t > 0.06))


def motor(dur):
    t = tv(dur)
    f = 55 + 12 * np.sin(2 * np.pi * t / dur)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + lowpass(rng.uniform(-1, 1, len(t)), 20) * 2
    return lowpass(s, 12) * np.sin(np.pi * t / dur) ** 2


PROG = [
    (43, [55, 59, 62, 67]),  # G
    (38, [57, 62, 66, 69]),  # D
    (40, [55, 59, 64, 67]),  # Em
    (36, [55, 60, 64, 67]),  # C
]
PAT = [(0, 1, 1.0), (1, 1, 0.5), (1.5, 0, 0.55), (2.5, 0, 0.6), (3, 1, 0.8), (3.5, 0, 0.5)]
cierre = sec(T["scenes"]["cierre"][0])
aula = sec(T["scenes"]["aula"][0])

bar = 0
while bar * 4 * BEAT < cierre:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(pad(chord, BEAT * 4), t0, gain=0.16, rev=0.4)
    for b, down, v in PAT:
        ts = t0 + b * BEAT + rng.uniform(-0.01, 0.01)
        if ts >= cierre - 0.05:
            continue
        place(strum(chord, down, v), ts, pan=0.15, gain=0.5, rev=0.25)
    for b in range(8):
        ts = t0 + b * BEAT / 2
        if ts >= cierre - 0.05:
            continue
        if ts >= sec(T["scenes"]["ruta"][0]):
            place(shaker(), ts + 0.01, pan=0.4, gain=0.06 + 0.04 * (b % 2))
        if b % 4 == 0:
            place(pluck(root, 0.9, 0.2), ts, pan=-0.1, gain=0.38)
    # en "lo que no se aprende en el aula" entra una melodía de piano arriba
    if t0 >= aula - 0.1:
        for i, n in enumerate([chord[-1] + 12, chord[-2] + 12]):
            place(piano(n, 2.0, 0.5), t0 + i * BEAT * 2, pan=-0.25, gain=0.16, rev=0.5)
    bar += 1
place(strum([55, 59, 62, 67], True, 1.0, 2.4), cierre, gain=0.55, rev=0.5)
place(pad([43, 55, 59, 62, 67], TOTAL - cierre, attack=0.2, release=0.1), cierre, gain=0.35, rev=0.6)
place(chime(86, 2.2), cierre + 0.2, gain=0.12, rev=0.6, to="sfx")

# ───────────────────────────── efectos ─────────────────────────────

place(waves(TOTAL), 0, gain=0.09, to="sfx")
for i in range(4):
    place(soft_pop(1 + i * 0.08), word("v1", "cuatro") + (4 + i * 3) / FPS, gain=0.1, rev=0.3, to="sfx")
for i in range(3):
    place(chime(79 + i * 3, 1.2), word("v1", "tres") + (4 + i * 3) / FPS, gain=0.07, rev=0.5, to="sfx")
place(shutter(), word("v1", "grupo") - 4 / FPS, gain=0.35, to="sfx")
for k, w in enumerate(["turno", "turno"]):
    place(soft_pop(1.1 + k * 0.1), word("v2", w, k) - 2 / FPS, gain=0.16, to="sfx")
ini, fin = word("v2", "está") - 4 / FPS, word("v2", "atlantis") + 6 / FPS
place(motor(fin - ini), ini, gain=0.12, to="sfx")
place(chime(84, 1.6), fin - 4 / FPS, gain=0.13, rev=0.5, to="sfx")
for w, d in [("carpas", 2), ("mar", 3), ("partidos", 3), ("charlas", 3)]:
    place(whoosh(0.3), word("v3", w) - d / FPS - 0.2, gain=0.12, to="sfx")
    place(shutter(), word("v3", w) - d / FPS + 0.05, gain=0.3, to="sfx")
place(crackle(3.2), word("v3", "charlas"), gain=0.12, rev=0.1, to="sfx")
for i, w in enumerate(["convivir", "cuidarnos", "ser"]):
    place(chime([79, 83, 86][i], 1.6), word("v4", w), gain=0.11, rev=0.5, to="sfx")

# ───────────────────────────── locución ─────────────────────────────


def load_voice(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    x = np.frombuffer(raw, "<i2").astype(float) / 32768
    x = x - lowpass(x, int(SR / 90))
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return np.tanh(x * 1.6) / np.tanh(1.6)


missing = []
for v in T["vo"]:
    p = ROOT / "audio" / "vo-viaje" / v["file"]
    if not p.exists():
        missing.append(v["id"])
        continue
    place(load_voice(p), sec(v["at"]) - v["onset"], rev=0.05, to="vo")

# ───────────────────────────── mezcla ─────────────────────────────


def fft_convolve(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]


ir_t = tv(2.4)
rev = np.zeros((2, N))
for ch in range(2):
    ir = lowpass(rng.uniform(-1, 1, len(ir_t)), 5) * np.exp(-ir_t * 2.6)
    ir[: int(0.02 * SR)] = 0
    rev[ch] = fft_convolve(bus["rev"][ch], ir / np.sqrt(np.sum(ir**2)))

vo_env = lowpass(np.abs(bus["vo"]).sum(0), int(0.05 * SR))
active = (vo_env > 0.02).astype(float)
active = np.maximum(active, np.roll(lowpass(active, int(0.3 * SR)) > 0, -int(0.15 * SR)))
duck = 1 - 0.6 * np.clip(lowpass(active, int(0.25 * SR)), 0, 1)

music = (bus["music"] + rev * 0.55) * duck
mix = music * 0.75 + bus["sfx"] * 0.7 * (0.6 + 0.4 * duck) + bus["vo"] * 0.95
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.02, 1) * np.clip((TOTAL - tt) / 1.2, 0, 1)
mix *= 0.95 / np.max(np.abs(mix))

out = ROOT / "public" / "viaje" / "soundtrack.wav"
out.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
if missing:
    print("Bloques de voz sin archivo:", ", ".join(missing))
