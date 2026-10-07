"""Banda sonora del reel "Inscripciones 2027": música, efectos y locución.

Todo se sintetiza con numpy (sin samples). Las voces de audio/vo/ se colocan
según src/timeline.json —la misma línea de tiempo que usa Remotion— y la música
baja sola mientras alguien habla (ducking). Si falta el archivo de un bloque de
voz, ese hueco queda sólo con música.

Uso:  python3 audio/make_audio.py   ->  public/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
BEAT = 60 / T["bpm"]
rng = np.random.default_rng(2027)

bus = {name: np.zeros((2, N)) for name in ("music", "sfx", "vo", "rev")}


def sec(frame: float) -> float:
    return frame / FPS


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def tv(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def noise(n: int) -> np.ndarray:
    return rng.uniform(-1, 1, n)


def lowpass(x: np.ndarray, win: int) -> np.ndarray:
    if win <= 1:
        return x
    c = np.cumsum(np.concatenate([np.zeros(win), x]))
    return (c[win:] - c[:-win]) / win


def highpass(x: np.ndarray, win: int = 4) -> np.ndarray:
    return x - lowpass(x, win)


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


# ───────────────────────────── instrumentos ─────────────────────────────


def epiano(note, dur, vel=1.0):
    """Piano eléctrico suave: fundamental + armónicos que se apagan rápido + trémolo leve."""
    t = tv(dur + 0.8)
    f = midi(note)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.4)
         + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t * 3.5)
         + 0.12 * np.sin(2 * np.pi * 7.02 * f * t) * np.exp(-t * 9))
    env = np.minimum(t / 0.004, 1) * np.clip((dur + 0.8 - t) / 0.8, 0, 1)
    return s * env * (1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)) * vel


def marimba(note, vel=1.0):
    t = tv(0.9)
    f = midi(note)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t * 5)
         + 0.4 * np.sin(2 * np.pi * 3.9 * f * t) * np.exp(-t * 16)
         + 0.15 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t * 30))
    return s * np.minimum(t / 0.002, 1) * vel


def soft_kick():
    t = tv(0.4)
    f = 48 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def shaker(accent=1.0):
    t = tv(0.09)
    env = np.minimum(t / 0.012, 1) * np.exp(-t * 45)
    return highpass(noise(len(t)), 2) * env * accent


def clap():
    t = tv(0.25)
    env = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.011, 0.022))
    return lowpass(highpass(noise(len(t)), 3), 2) * env * np.exp(-t * 8)


def bass(note, dur):
    t = tv(dur)
    f = midi(note)
    env = np.minimum(t / 0.01, 1) * np.exp(-t * 1.6) * np.clip((dur - t) / 0.05, 0, 1)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * env


def pad(notes, dur, attack=0.6, release=0.8):
    t = tv(dur + release)
    out = np.zeros(len(t))
    for n in notes:
        for det in (-0.002, 0.0021):
            f = midi(n) * (1 + det)
            for k in range(1, 7):
                out += np.sin(2 * np.pi * f * k * t + k) / k * np.exp(-k * 0.6)
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return out * env / (len(notes) * 2)


def chime(note, dur=1.4):
    t = tv(dur)
    f = midi(note)
    parts = [(1, 1.0, 2.5), (2.0, 0.45, 4), (3.01, 0.2, 6), (4.2, 0.12, 9)]
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in parts) * np.minimum(t / 0.003, 1) * 0.5


def pop(pitch=1.0):
    t = tv(0.12)
    f = (300 + 500 * (1 - np.exp(-t * 60))) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)


def whoosh(dur=0.45, up=True):
    t = tv(dur)
    n = noise(len(t))
    x = t / dur
    sweep = x if up else 1 - x
    s = lowpass(n, 20) * (1 - sweep) * 1.4 + (lowpass(n, 4) - lowpass(n, 30)) * sweep * 1.8
    return s * np.sin(np.pi * x) ** 2


def key_click():
    t = tv(0.03)
    return highpass(noise(len(t)), 2) * np.exp(-t * 450) + np.sin(2 * np.pi * rng.uniform(1600, 2300) * t) * np.exp(-t * 300) * 0.3


def mouse_click():
    t = tv(0.05)
    s = highpass(noise(len(t)), 2) * np.exp(-t * 600)
    s += np.sin(2 * np.pi * 2800 * t) * np.exp(-t * 400) * 0.5
    return s


def tick():
    t = tv(0.25)
    return (np.sin(2 * np.pi * midi(93) * t) + 0.3 * np.sin(2 * np.pi * midi(100) * t)) * np.exp(-t * 18)


# ───────────────────────────── música ─────────────────────────────
# Re mayor, I–V–vi–IV (D–A–Bm–G), un acorde por compás de 4 tiempos.

PROG = [
    (38, [62, 66, 69, 74]),  # D
    (33, [61, 64, 69, 73]),  # A
    (35, [62, 66, 71, 74]),  # Bm
    (31, [62, 67, 71, 74]),  # G
]
D_PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86]

total = sec(T["durationInFrames"])
end_music = total - 0.15
bars = int(np.ceil(total / (BEAT * 4)))
perc_from = sec(T["scenes"]["niveles"][0]) - BEAT  # la percusión entra con los niveles
for bar in range(bars):
    t0 = bar * 4 * BEAT
    if t0 >= end_music:
        break
    root, chord = PROG[bar % 4]
    place(pad(chord, BEAT * 4), t0, gain=0.35, rev=0.4)
    for i, n in enumerate(chord[:3]):  # acorde de piano con un leve rasgueo
        place(epiano(n, BEAT * 1.6, vel=0.8), t0 + i * 0.012, pan=-0.2 + i * 0.2, gain=0.22, rev=0.3)
    place(epiano(chord[1], BEAT * 1.2, vel=0.6), t0 + BEAT * 2.5, pan=0.2, gain=0.18, rev=0.3)
    for b in range(4):
        tb = t0 + b * BEAT
        if tb < perc_from:
            continue
        place(bass(root, BEAT * 0.9), tb, gain=0.5)
        if b in (0, 2):
            place(soft_kick(), tb, gain=0.55)
        if b in (1, 3):
            place(clap(), tb, gain=0.18, rev=0.25)
        for s in range(2):
            place(shaker(1.0 if s else 0.55), tb + s * BEAT / 2, pan=0.35, gain=0.12)
        # marimba: arpegio ascendente en corcheas
        for s in range(2):
            idx = (bar * 8 + b * 2 + s) % 6
            note = sorted(chord)[[0, 1, 2, 3, 2, 1][idx]] + 12
            place(marimba(note, 0.7), tb + s * BEAT / 2, pan=-0.4 + 0.8 * (idx / 5), gain=0.14, rev=0.25)

# acorde final que queda sonando
place(pad([62, 66, 69, 74, 78], 1.4, attack=0.05, release=0.6), sec(T["cierreIn"] + 60), gain=0.25, rev=0.5)

# ───────────────────────────── efectos ─────────────────────────────

place(pop(1.0), sec(6), gain=0.5, to="sfx")
place(chime(86), sec(8), gain=0.25, rev=0.5, to="sfx")
for i, f in enumerate([28, 36]):  # palabras del título
    place(pop(1.3 + i * 0.2), sec(f), gain=0.25, to="sfx")
for i, f in enumerate(T["cards"]):
    place(whoosh(0.35), sec(f - 4), pan=(-0.5, 0.5, -0.5)[i], gain=0.35, to="sfx")
    place(marimba([74, 78, 81][i], 1.0), sec(f + 4), gain=0.35, rev=0.4, to="sfx")
place(whoosh(0.5, up=True), sec(T["scenes"]["facil"][0] - 6), gain=0.5, rev=0.2, to="sfx")
place(chime(81), sec(T["scenes"]["facil"][0] + 30), gain=0.2, rev=0.5, to="sfx")
place(whoosh(0.45, up=False), sec(T["scenes"]["facil"][1] - 10), gain=0.4, to="sfx")
for i, f in enumerate([T["step1"], T["step2"], T["step3"]]):  # cambio de paso
    place(chime([78, 81, 86][i], 1.0), sec(f + 6), gain=0.22, rev=0.4, to="sfx")
url = "alvarezcondarco.com"
for i, ch in enumerate(url):
    place(key_click(), sec(T["urlTypeStart"] + i * T["urlCharFrames"]), pan=rng.uniform(-0.2, 0.2), gain=0.35, to="sfx")
place(pop(0.8), sec(T["hint"]), gain=0.35, to="sfx")
place(mouse_click(), sec(T["admClick"]), gain=0.6, to="sfx")
place(whoosh(0.3), sec(T["formIn"] - 4), gain=0.25, to="sfx")
for f in T["fields"]:
    place(tick(), sec(f + 10), gain=0.18, rev=0.3, to="sfx")
place(mouse_click(), sec(T["sendClick"]), gain=0.6, to="sfx")
for i, n in enumerate([74, 78, 81, 86]):  # éxito
    place(chime(n, 1.2), sec(T["sent"]) + i * 0.07, pan=-0.3 + i * 0.2, gain=0.22, rev=0.5, to="sfx")
place(whoosh(0.55, up=True), sec(T["cierreIn"] - 8), gain=0.45, rev=0.2, to="sfx")
place(chime(74, 2.0), sec(T["cierreIn"] + 40), gain=0.2, rev=0.6, to="sfx")

# ───────────────────────────── locución ─────────────────────────────


def load_voice(path: pathlib.Path) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    x = np.frombuffer(raw, "<i2").astype(float) / 32768
    x = x - lowpass(x, int(SR / 90))  # quita rumble (<90 Hz)
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return np.tanh(x * 1.8) / np.tanh(1.8)  # compresión suave: voz pareja


missing = []
for v in T["vo"]:
    p = ROOT / "audio" / "vo" / v["file"]
    if not p.exists():
        missing.append(v["id"])
        continue
    place(load_voice(p), sec(v["at"]) - v["onset"], gain=1.0, rev=0.04, to="vo")

# ───────────────────────────── mezcla ─────────────────────────────


def fft_convolve(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]


ir_t = tv(1.6)
rev = np.zeros((2, N))
for ch in range(2):
    ir = lowpass(noise(len(ir_t)), 4) * np.exp(-ir_t * 3.5)
    ir[: int(0.015 * SR)] = 0
    rev[ch] = fft_convolve(bus["rev"][ch], ir / np.sqrt(np.sum(ir**2)))

# Ducking: la música baja ~10 dB mientras hay voz, con ataque y liberación suaves
vo_env = lowpass(np.abs(bus["vo"]).sum(0), int(0.05 * SR))
active = (vo_env > 0.02).astype(float)
active = np.maximum(active, np.roll(lowpass(active, int(0.25 * SR)) > 0, -int(0.12 * SR)))  # anticipa el ataque
duck = 1 - 0.68 * np.clip(lowpass(active, int(0.18 * SR)), 0, 1)

music = (bus["music"] + rev * 0.5) * duck
mix = music * 0.55 + bus["sfx"] * 0.6 * (0.6 + 0.4 * duck) + bus["vo"] * 0.95
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.01, 1) * np.clip((total - tt) / 0.6, 0, 1)
mix *= 0.95 / np.max(np.abs(mix))

out = ROOT / "public" / "soundtrack.wav"
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({N / SR:.1f}s)")
if missing:
    print("Bloques de voz sin archivo (quedan con música):", ", ".join(missing))
