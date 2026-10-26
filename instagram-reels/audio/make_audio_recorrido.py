"""Banda sonora del reel "Recorrido por el cole": ukelele, percusión suave y voz.

Sólo numpy. Lee src/recorrido/timeline.json (la misma línea de tiempo que usa
Remotion), coloca las voces de audio/vo-tour/ y baja la música cuando hay voz.
La música se queda sola en un pad en "solo falta una cosa" y vuelve para el cierre.

Uso:  python3 audio/make_audio_recorrido.py   ->  public/recorrido/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "recorrido" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
TOTAL = N / SR
BPM = 104
BEAT = 60 / BPM
rng = np.random.default_rng(27)

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


PROG = [
    (38, [62, 66, 69, 74]),  # D
    (45, [61, 64, 69, 73]),  # A
    (47, [62, 66, 71, 74]),  # Bm
    (43, [62, 67, 71, 74]),  # G
]
PAT = [(0, 1, 1.0), (1, 1, 0.5), (1.5, 0, 0.55), (2.5, 0, 0.6), (3, 1, 0.8), (3.5, 0, 0.5)]  # (tiempo, abajo, fuerza)
pausa_a = word("t4", "solo") - 0.25
pausa_b = sec(T["scenes"]["cta"][0])
cierre = sec(T["scenes"]["cierre"][0])

bar = 0
while bar * 4 * BEAT < cierre:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(pad(chord, BEAT * 4), t0, gain=0.18, rev=0.4)
    for b, down, v in PAT:
        ts = t0 + b * BEAT + rng.uniform(-0.008, 0.008)
        if pausa_a <= ts < pausa_b or ts >= cierre - 0.05:
            continue
        place(strum(chord, down, v), ts, pan=0.15, gain=0.5, rev=0.2)
    for b in range(8):
        ts = t0 + b * BEAT / 2
        if pausa_a <= ts < pausa_b or ts >= cierre - 0.05:
            continue
        if b in (0, 4):
            place(kick(), ts, gain=0.35)
        place(shaker(), ts + 0.01, pan=0.4, gain=0.07 + 0.04 * (b % 2))
        if b % 4 == 0:
            place(pluck(root, 0.8, 0.2), ts, pan=-0.1, gain=0.35)
    bar += 1
# "solo falta una cosa…": queda un pad abierto y un piano, todo respira
place(pad([62, 66, 69, 73, 76], pausa_b - pausa_a + 0.6, attack=0.6, release=0.6), pausa_a, gain=0.4, rev=0.6)
for i, n in enumerate([74, 78, 81]):
    place(piano(n, 3.0, 0.5), pausa_a + 0.2 + i * 0.5, pan=-0.2 + 0.2 * i, gain=0.16, rev=0.6)
# cierre: acorde final y campanita con el escudo
place(strum([62, 66, 69, 74], True, 1.0, 2.2), cierre, gain=0.55, rev=0.5)
place(pad([50, 62, 66, 69, 74], TOTAL - cierre, attack=0.2, release=0.1), cierre, gain=0.35, rev=0.6)
place(chime(86, 2.0), cierre + 0.15, gain=0.12, rev=0.6, to="sfx")

# ───────────────────────────── efectos ─────────────────────────────

place(whoosh(0.5), sec(74), gain=0.22, rev=0.2, to="sfx")  # la cámara entra por la puerta
for n in range(1, 4):  # barridos entre tomas
    place(whoosh(0.35), word("t3", "acá", n) - 4 / FPS - 0.12, pan=0.3, gain=0.2, to="sfx")
for i, w in enumerate(["acá"] * 4):
    place(soft_pop(1 + i * 0.1), word("t3", "acá", i) + 4 / FPS, gain=0.12, rev=0.3, to="sfx")
place(whoosh(0.7, up=False), word("t4", "solo") - 0.3, gain=0.18, rev=0.4, to="sfx")
place(chime(81, 2.2), word("t4", "conocer") + 0.15, gain=0.13, rev=0.6, to="sfx")
for i in range(3):
    place(soft_pop(1 + i * 0.12), word("t5", "abiertas") + (4 + i * 4) / FPS, gain=0.16, rev=0.2, to="sfx")
tip = word("t5", "albarescondarco")
for i in range(19):
    place(click(), tip + i * 26 / FPS / 19 + rng.uniform(0, 0.01), pan=0.2, gain=0.1, to="sfx")
place(click(), word("t5", "com") + 16 / FPS, gain=0.3, to="sfx")
place(soft_pop(1.3), word("t5", "com") + 17 / FPS, gain=0.15, to="sfx")

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
    p = ROOT / "audio" / "vo-tour" / v["file"]
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
mix = music * 0.6 + bus["sfx"] * 0.7 * (0.6 + 0.4 * duck) + bus["vo"] * 0.95
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.02, 1) * np.clip((TOTAL - tt) / 1.2, 0, 1)
mix *= 0.95 / np.max(np.abs(mix))

out = ROOT / "public" / "recorrido" / "soundtrack.wav"
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
