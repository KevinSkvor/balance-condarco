"""Banda sonora del reel "Simulacro de evacuación": piano y cuerdas tranquilos, voz.

Sólo numpy. Lee src/salud/timeline.json (la misma línea de tiempo que usa
Remotion), coloca las voces de audio/vo-simulacro/ y baja la música cuando hay voz.
Sin sirenas ni nada que asuste: la "alarma" es una campanita suave.

Uso:  python3 audio/make_audio_simulacro.py   ->  public/simulacro/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "simulacro" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
TOTAL = N / SR
BPM = 76
BEAT = 60 / BPM
rng = np.random.default_rng(14)

bus = {name: np.zeros((2, N)) for name in ("music", "sfx", "vo", "rev")}


def sec(frame):
    return frame / FPS


def word(vid, w):
    v = next(x for x in T["vo"] if x["id"] == vid)
    return sec(v["at"]) + next(t for x, t in v["words"] if x == w)


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
# Sol mayor: G – D – Em – C, un acorde por compás, sin percusión.

PROG = [
    (43, [55, 59, 62, 66]),  # Gmaj7
    (38, [54, 57, 62, 64]),  # D6
    (40, [55, 59, 62, 64]),  # Em7
    (36, [55, 60, 64, 67]),  # Cmaj7
]
ARP = [0, 2, 1, 3, 2, 1]
end_at = sec(T["scenes"]["cierre"][0])
bar = 0
while bar * 4 * BEAT < end_at - 0.2:
    t0 = bar * 4 * BEAT
    root, chord = PROG[bar % 4]
    place(pad(chord, BEAT * 4), t0, gain=0.34, rev=0.5)
    place(piano(root, 3.5, 0.7), t0, gain=0.33, rev=0.3)
    for s in range(6):
        ts = t0 + s * BEAT * 2 / 3 + rng.uniform(-0.012, 0.012)
        if ts >= end_at - 0.1:
            break
        place(piano(chord[ARP[s]] + 12, 2.2, rng.uniform(0.45, 0.62)), ts, pan=-0.35 + 0.14 * s, gain=0.18, rev=0.4)
    bar += 1
place(pad([55, 59, 62, 66, 69], TOTAL - end_at, attack=0.8, release=0.1), end_at, gain=0.42, rev=0.6)
for i, n in enumerate([43, 55, 62, 66, 69, 74]):
    place(piano(n, TOTAL - end_at, 0.6), end_at + i * 0.09, pan=-0.3 + i * 0.12, gain=0.27, rev=0.5)

# ───────────────────────────── efectos (mínimos) ─────────────────────────────

for i, w in enumerate(["jardín", "primaria", "secundaria"]):
    place(soft_pop(1 + i * 0.12), word("s2", w), gain=0.2, rev=0.3, to="sfx")
al = word("s2", "alarma")
place(chime(79, 1.6), al, gain=0.16, rev=0.5, to="sfx")  # campanita "ding-dong", suave
place(chime(74, 2.0), al + 0.35, gain=0.14, rev=0.5, to="sfx")
for i, w in enumerate(["calma", "seguir", "orden"]):
    place(chime([74, 78, 81][i], 1.4), word("s3", w), gain=0.11, rev=0.5, to="sfx")
place(air(0.8), sec(T["scenes"]["encuentro"][0]) - 0.3, gain=0.14, rev=0.3, to="sfx")
place(soft_pop(0.9), word("s4", "encuentro"), gain=0.18, to="sfx")
for i, n in enumerate([74, 78, 81, 86]):
    place(chime(n, 1.4), word("s4", "todos") + i * 0.07, gain=0.12, rev=0.5, to="sfx")
place(air(0.9), sec(T["scenes"]["cuidarnos"][0]) - 0.2, gain=0.14, rev=0.3, to="sfx")
place(chime(83, 2.4), word("s5", "cuidarnos") + 0.3, gain=0.14, rev=0.6, to="sfx")

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
    p = ROOT / "audio" / "vo-simulacro" / v["file"]
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

out = ROOT / "public" / "simulacro" / "soundtrack.wav"
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
