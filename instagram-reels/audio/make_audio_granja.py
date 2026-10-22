"""Banda sonora del reel "Sala de 3 en la granja": ukelele, xilofón y voz.

Sólo numpy. Lee src/granja/timeline.json (con el tiempo de cada palabra) y
pone un "tin" de xilofón cuando la voz nombra cada animal.

Uso:  python3 audio/make_audio_granja.py   ->  public/granja/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "granja" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
TOTAL = N / SR
rng = np.random.default_rng(3)
bus = {name: np.zeros((2, N)) for name in ("music", "sfx", "vo", "rev")}


def sec(frame):
    return frame / FPS


def W(pid, word, n=0):
    v = next(x for x in T["vo"] if x["id"] == pid)
    return sec(v["at"]) + [t for w, t in v["words"] if w == word][n]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tv(dur):
    return np.arange(int(dur * SR)) / SR


def noise(n):
    return rng.uniform(-1, 1, n)


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


_cache = {}


def uke(note, dur=0.9):
    """Cuerda pulsada (Karplus-Strong): suena a ukelele de nylon."""
    key = (note, dur)
    if key in _cache:
        return _cache[key]
    p = int(SR / midi(note))
    n = int(dur * SR)
    buf = rng.uniform(-1, 1, p)
    buf = lowpass(np.concatenate([buf, buf]), 3)[:p]
    out = np.empty(n)
    for i in range(0, n, p):  # promediado bloque a bloque: rápido y suficiente
        seg = buf.copy()
        out[i : i + p] = seg[: min(p, n - i)]
        buf = 0.996 * 0.5 * (seg + np.roll(seg, -1))
    env = np.minimum(np.arange(n) / 40, 1) * np.clip((n - np.arange(n)) / (0.08 * SR), 0, 1)
    _cache[key] = out * env
    return _cache[key]


def strum(chord, t, down=True, gain=0.18):
    notes = chord if down else chord[::-1]
    for k, n in enumerate(notes):
        place(uke(n), t + k * 0.012, pan=-0.3 + 0.2 * k, gain=gain * (1 if down else 0.7), rev=0.2)


def xylo(note, dur=0.9, vel=1.0):
    t = tv(dur)
    f = midi(note)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18) + 0.15 * np.sin(2 * np.pi * f * 9.8 * t) * np.exp(-t * 30)
    return s * np.minimum(t / 0.002, 1) * vel


def clap():
    t = tv(0.2)
    env = sum(np.exp(-np.clip(t - d, 0, None) * 70) * (t >= d) for d in (0, 0.01, 0.021))
    return (noise(len(t)) - lowpass(noise(len(t)), 3)) * env * np.exp(-t * 10)


def shaker(v=1.0):
    t = tv(0.07)
    return (noise(len(t)) - lowpass(noise(len(t)), 2)) * np.minimum(t / 0.01, 1) * np.exp(-t * 50) * v


def kick():
    t = tv(0.25)
    return np.sin(2 * np.pi * np.cumsum(55 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 12)


def bass(note, dur):
    t = tv(dur)
    return np.sin(2 * np.pi * midi(note) * t) * np.minimum(t / 0.01, 1) * np.exp(-t * 3) * np.clip((dur - t) / 0.04, 0, 1)


def pop(pitch=1.0):
    t = tv(0.12)
    return np.sin(2 * np.pi * np.cumsum((300 + 500 * (1 - np.exp(-t * 60))) * pitch) / SR) * np.exp(-t * 35)


def slide_whistle(dur, up=True):
    t = tv(dur)
    x = t / dur
    f = 600 * (2 ** (x if up else 1 - x))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x) * 0.6


# ───────────────────────────── música ─────────────────────────────
# Do mayor, C–G–Am–F, 112 BPM, ukelele con rasgueo "abajo-abajo-arriba".

BPM = 112
BEAT = 60 / BPM
PROG = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69])]
MELODIA = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 74, 72, 74, 76, 79, 81]
end_music = sec(T["scenes"]["cierre"][0]) + 0.4
bar = 0
while bar * 4 * BEAT < end_music:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    for b, d in ((0, True), (1, True), (1.5, False), (2, True), (3, True), (3.5, False)):
        strum(chord, t0 + b * BEAT, down=d)
    for b in range(4):
        tb = t0 + b * BEAT
        place(bass(root - 12 if b % 2 == 0 else root - 5, BEAT * 0.9), tb, gain=0.4)
        if b in (0, 2):
            place(kick(), tb, gain=0.4)
        if b in (1, 3):
            place(clap(), tb, gain=0.16, rev=0.2)
        for s in range(2):
            place(shaker(0.6 + 0.4 * s), tb + s * BEAT / 2, pan=0.4, gain=0.1)
    if bar >= 2:  # melodía de xilofón, liviana
        for k in range(4):
            place(xylo(MELODIA[(bar * 4 + k) % len(MELODIA)], 0.8, 0.7), t0 + k * BEAT, pan=0.2, gain=0.12, rev=0.3)
    bar += 1
# acorde final (sobre el escudo)
cierre = sec(T["scenes"]["cierre"][0])
strum([60, 64, 67, 72, 76], cierre + 0.3, gain=0.25)
for i, n in enumerate([72, 76, 79, 84]):
    place(xylo(n, 1.6), cierre + 0.3 + i * 0.09, gain=0.2, rev=0.4)

# ───────────────────────────── efectos ─────────────────────────────

place(slide_whistle(0.5), sec(4), gain=0.18, to="sfx")
place(pop(1.2), W("g1", "granja"), gain=0.25, to="sfx")
for i, w in enumerate(["caminamos", "mano", "descubrir"]):
    place(pop(0.9 + i * 0.15), W("g2", w) - 0.1, gain=0.22, to="sfx")
ESCALA = [72, 74, 76, 77, 79, 81, 83, 84]
for i, w in enumerate(["vaca", "cabras", "chancho", "pato", "ovejas", "caballo", "burro", "llamas"]):
    place(xylo(ESCALA[i], 1.0), W("g3", w), pan=-0.4 + 0.1 * i, gain=0.3, rev=0.3, to="sfx")
place(slide_whistle(0.4), W("g3", "hasta"), gain=0.15, to="sfx")
place(pop(1.1), W("g4", "comer"), gain=0.25, to="sfx")
place(xylo(84, 1.2), W("g4", "cuidarlos"), gain=0.25, rev=0.4, to="sfx")
for i, n in enumerate([72, 76, 79, 84, 88]):  # festejo final
    place(xylo(n, 1.0), W("g5", "qué") + i * 0.07, gain=0.18, rev=0.4, to="sfx")

# ───────────────────────────── voz y mezcla ─────────────────────────────


def load_voice(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, "<i2").astype(float) / 32768
    x = x - lowpass(x, int(SR / 90))
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return np.tanh(x * 1.6) / np.tanh(1.6)


for vo in T["vo"]:
    place(load_voice(ROOT / "audio" / "vo-granja" / vo["file"]), sec(vo["at"]) - vo["onset"], rev=0.04, to="vo")


def fft_convolve(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]


ir_t = tv(1.4)
rev = np.zeros((2, N))
for ch in range(2):
    ir = lowpass(noise(len(ir_t)), 4) * np.exp(-ir_t * 4)
    ir[: int(0.012 * SR)] = 0
    rev[ch] = fft_convolve(bus["rev"][ch], ir / np.sqrt(np.sum(ir**2)))

vo_env = lowpass(np.abs(bus["vo"]).sum(0), int(0.05 * SR))
active = (vo_env > 0.02).astype(float)
active = np.maximum(active, np.roll(lowpass(active, int(0.25 * SR)) > 0, -int(0.12 * SR)))
duck = 1 - 0.6 * np.clip(lowpass(active, int(0.2 * SR)), 0, 1)

music = (bus["music"] + rev * 0.5) * duck
mix = music * 0.6 + bus["sfx"] * 0.7 * (0.7 + 0.3 * duck) + bus["vo"] * 0.95
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.02, 1) * np.clip((TOTAL - tt) / 1.0, 0, 1)
mix *= 0.95 / np.max(np.abs(mix))

out = ROOT / "public" / "granja" / "soundtrack.wav"
out.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
