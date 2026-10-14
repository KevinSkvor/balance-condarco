"""Banda sonora del reel "¿Por qué nos llamamos Álvarez Condarco?".

Sólo numpy. Lee src/condarco/timeline.json (la misma línea de tiempo que usa
Remotion, con el tiempo de cada palabra), coloca la voz y sincroniza música y
efectos con las palabras clave.

Uso:  python3 audio/make_audio_condarco.py   ->  public/condarco/soundtrack.wav
"""

import json
import pathlib
import subprocess
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "condarco" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
TOTAL = N / SR
rng = np.random.default_rng(1817)
bus = {name: np.zeros((2, N)) for name in ("music", "sfx", "vo", "rev")}


def sec(frame):
    return frame / FPS


def W(pid, word, n=0):
    v = next(x for x in T["vo"] if x["id"] == pid)
    hits = [t for w, t in v["words"] if w == word]
    return sec(v["at"]) + hits[n]


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


# ───────────────────────────── instrumentos ─────────────────────────────


def strings(notes, dur, attack=0.8, release=1.2, bright=1.0):
    """Cuerdas: sierras desafinadas con vibrato lento y armónicos suaves."""
    t = tv(dur + release)
    out = np.zeros(len(t))
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t)
    for n in notes:
        for det in (-0.004, 0.0, 0.0045):
            f = midi(n) * (1 + det)
            ph = 2 * np.pi * f * np.cumsum(vib) / SR
            for k in range(1, 9):
                out += np.sin(k * ph + k) / k * np.exp(-k * (0.5 / bright))
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return out * env / (len(notes) * 3)


def piano(note, dur=2.5, vel=1.0):
    t = tv(dur)
    f = midi(note)
    s = sum(a * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * d * (0.8 + note / 120))
            for k, (a, d) in enumerate([(1.0, 1.1), (0.45, 2.0), (0.22, 3.2), (0.1, 4.5)], start=1))
    env = np.minimum(t / 0.006, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return s * env * vel


def timpani(pitch=43, dur=2.2, vel=1.0):
    t = tv(dur)
    f = midi(pitch) * (1 + 0.15 * np.exp(-t * 30))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    s += 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * np.exp(-t * 4)
    s += lowpass(noise(len(t)), 8) * np.exp(-t * 40) * 0.5
    return s * vel


def snare_roll(dur):
    t = tv(dur)
    hits = np.zeros(len(t))
    for h in np.arange(0, dur, 0.055):
        i = int(h * SR)
        hits[i : i + 1] = rng.uniform(0.6, 1.0)
    burst = np.convolve(hits, np.exp(-np.arange(int(0.05 * SR)) / SR * 60))[: len(t)]
    return (noise(len(t)) - lowpass(noise(len(t)), 4)) * burst * (t / dur) ** 1.5


def march_drum(vel=1.0):
    t = tv(0.3)
    return ((noise(len(t)) - lowpass(noise(len(t)), 3)) * np.exp(-t * 22) * 0.7 + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 30) * 0.5) * vel


def wind(dur):
    t = tv(dur)
    n = noise(len(t))
    sweep = 0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 1)
    s = lowpass(n, 40) * (1 - sweep) + (lowpass(n, 10) - lowpass(n, 50)) * sweep
    return s * np.sin(np.pi * t / dur) ** 1.5 * 2.5


def hoof():
    t = tv(0.09)
    return (lowpass(noise(len(t)), 5) * 0.6 + np.sin(2 * np.pi * 220 * t) * 0.5) * np.exp(-t * 60)


def hooves(dur):
    out = np.zeros(int(dur * SR) + SR)
    t = 0.0
    while t < dur:  # galope: ta-ta-tam
        for off, v in ((0, 0.7), (0.11, 0.8), (0.24, 1.0)):
            i = int((t + off) * SR)
            h = hoof() * v * rng.uniform(0.8, 1.0)
            out[i : i + len(h)] += h
        t += 0.62
    return out[: int(dur * SR)]


def quill(dur):
    """Pluma raspando papel: ráfagas de ruido agudo."""
    t = tv(dur)
    n = noise(len(t)) - lowpass(noise(len(t)), 3)
    env = np.clip(np.sin(2 * np.pi * 3.1 * t) + rng.uniform(-0.2, 0.2), 0, 1) ** 2
    return n * env * 0.5


def pop(pitch=1.0):
    t = tv(0.14)
    f = (260 + 320 * (1 - np.exp(-t * 50))) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)


def tick():
    t = tv(0.025)
    return (noise(len(t)) - lowpass(noise(len(t)), 3)) * np.exp(-t * 300)


def chime(note, dur=2.0):
    t = tv(dur)
    f = midi(note)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 1.8), (2, 0.35, 3), (3.01, 0.15, 5)]) * 0.5


def whoosh(dur=0.6):
    t = tv(dur)
    n = noise(len(t))
    x = t / dur
    return (lowpass(n, 18) * (1 - x) + (lowpass(n, 4) - lowpass(n, 30)) * x * 1.6) * np.sin(np.pi * x) ** 2


def stamp():
    t = tv(0.5)
    return (np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14) + lowpass(noise(len(t)), 4) * np.exp(-t * 35) * 0.8)


# ───────────────────────────── música ─────────────────────────────
# Re menor (Dm–B♭–F–C) que crece hacia 1817; con "Hoy" pasa a Fa mayor, cálido.

BPM = 80
BEAT = 60 / BPM
PROG_MIN = [(38, [50, 57, 62, 65]), (34, [46, 53, 58, 62]), (41, [48, 53, 57, 60]), (36, [48, 52, 55, 60])]
PROG_MAY = [(41, [53, 57, 60, 64]), (36, [52, 55, 60, 64]), (38, [50, 57, 62, 65]), (34, [50, 53, 58, 62])]

t_p2 = sec(T["vo"][1]["at"])
t_1817 = W("p3", "1817")
t_hoy = W("p3", "hoy")
t_end = sec(T["cierre"])

bar = 0
while bar * 4 * BEAT < t_end:
    t0 = bar * 4 * BEAT
    mayor = t0 >= t_hoy - 0.3
    root, chord = (PROG_MAY if mayor else PROG_MIN)[bar % 4]
    intensidad = 0.5 if t0 < t_p2 else (0.8 if t0 < t_1817 - 1 else 1.0)
    if mayor:
        intensidad = 0.65
    place(strings(chord, BEAT * 4, bright=0.8 + 0.6 * intensidad), t0, gain=0.25 * intensidad + 0.08, rev=0.45)
    place(strings([root, root + 12], BEAT * 4, attack=0.3), t0, gain=0.18 * intensidad, rev=0.2)
    # piano: notas sueltas en la intro, arpegio a partir de la misión
    if t0 < t_p2:
        place(piano(chord[3] + 12, 3, 0.6), t0 + BEAT, pan=0.2, gain=0.18, rev=0.5)
    else:
        for s in range(8):
            n = chord[[0, 1, 2, 3, 2, 1, 2, 3][s]] + 12
            place(piano(n, 1.6, rng.uniform(0.4, 0.6)), t0 + s * BEAT / 2, pan=-0.3 + 0.08 * s, gain=0.14 if not mayor else 0.16, rev=0.4)
    # pulso de timbal suave que empuja la misión
    if t_p2 <= t0 < t_1817 - 0.5 and not mayor:
        place(timpani(root - 12 + 12, 1.4, 0.35), t0, gain=0.35, rev=0.3)
        place(timpani(root - 12 + 12, 1.0, 0.22), t0 + BEAT * 2.5, gain=0.3, rev=0.3)
    bar += 1

# crescendo hacia 1817 y golpe
place(snare_roll(2.2), t_1817 - 2.2, gain=0.22, rev=0.3)
place(timpani(38, 3.0, 1.0), t_1817, gain=0.8, rev=0.5)
place(strings([50, 57, 62, 65, 69], 2.6, attack=0.05, bright=1.6), t_1817, gain=0.4, rev=0.5)
# marcha mientras cruza el ejército
t_cruzo = W("p3", "cruzó")
for k in range(10):
    place(march_drum(0.8 if k % 2 else 1.0), t_cruzo - 0.6 + k * BEAT / 2, pan=(-0.3, 0.3)[k % 2], gain=0.25, rev=0.2)
# acorde final sobre el escudo
place(strings([53, 57, 60, 65, 69], TOTAL - t_end, attack=0.6, release=0.2), t_end, gain=0.4, rev=0.6)
for i, n in enumerate([41, 53, 60, 65, 69, 72]):
    place(piano(n, TOTAL - t_end, 0.55), t_end + i * 0.09, pan=-0.3 + i * 0.12, gain=0.25, rev=0.5)

# ───────────────────────────── efectos ─────────────────────────────

pregunta = sec(4)
place(quill(1.2), pregunta, gain=0.12, to="sfx")
v = W("p1", "viajar")
for k in range(14):  # contador 2026 → 1816
    place(tick(), v - 0.2 + k * 0.07, gain=0.25, to="sfx")
place(whoosh(0.8), W("p1", "1816") + 0.9, gain=0.3, rev=0.3, to="sfx")
sm = W("p1", "san")
place(quill(2.4), sm - 0.4, gain=0.14, pan=-0.2, to="sfx")
place(wind(6.0), sm, gain=0.18, rev=0.3, to="sfx")
place(wind(4.0), W("p1", "faltaba") - 0.5, gain=0.16, rev=0.3, to="sfx")
place(pop(0.8), W("p1", "mapa"), gain=0.2, rev=0.3, to="sfx")
place(whoosh(0.7), W("p2", "misión") - 0.6, gain=0.3, rev=0.3, to="sfx")
place(chime(74, 2.2), W("p2", "álvarez"), gain=0.16, rev=0.6, to="sfx")
place(pop(1.1), W("p2", "ingeniero"), gain=0.18, to="sfx")
place(pop(1.25), W("p2", "ingeniero") + 0.27, gain=0.16, to="sfx")
place(hooves(W("p2", "acta") + 0.6 - W("p2", "viajó")), W("p2", "viajó") + 0.1, gain=0.22, pan=-0.2, to="sfx")
place(whoosh(0.5), W("p2", "acta") - 0.1, gain=0.2, to="sfx")
place(pop(0.7), W("p2", "gobernador") - 0.2, gain=0.2, to="sfx")
place(pop(1.0), W("p2", "previsto") - 0.3, gain=0.18, to="sfx")
place(stamp(), W("p2", "expulsaron"), gain=0.3, to="sfx")
place(hooves(W("p2", "mendoza") - W("p2", "expulsaron") - 0.2), W("p2", "expulsaron") + 0.25, gain=0.16, pan=0.2, to="sfx")
for i, w in enumerate(["valle", "río", "cumbre"]):
    place(chime([77, 81, 84][i], 1.6), W("p2", w), gain=0.14, rev=0.5, to="sfx")
place(pop(0.9), W("p2", "tomar") - 0.1, gain=0.18, to="sfx")
place(chime(86, 2.0), W("p2", "mendoza") + 0.1, gain=0.14, rev=0.6, to="sfx")
place(quill(2.2), W("p2", "dibujó") - 0.05, gain=0.22, to="sfx")
place(stamp(), W("p3", "1817"), gain=0.45, rev=0.3, to="sfx")
for i, w in enumerate(["estudiar", "observar", "trabajar"]):
    place(pop(1 + i * 0.12), W("p3", w), gain=0.2, rev=0.3, to="sfx")
    place(chime([72, 76, 79][i], 1.5), W("p3", w) + 0.05, gain=0.1, rev=0.5, to="sfx")
place(chime(84, 2.4), W("p3", "lejos"), gain=0.16, rev=0.6, to="sfx")
place(whoosh(0.6), W("p3", "busto") - 0.5, gain=0.25, rev=0.3, to="sfx")

# ───────────────────────────── voz y mezcla ─────────────────────────────


def load_voice(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, "<i2").astype(float) / 32768
    x = x - lowpass(x, int(SR / 90))
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    return np.tanh(x * 1.6) / np.tanh(1.6)


for vo in T["vo"]:
    p = ROOT / "audio" / "vo-condarco" / vo["file"]
    place(load_voice(p), sec(vo["at"]) - vo["onset"], rev=0.05, to="vo")


def fft_convolve(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]


ir_t = tv(2.6)
rev = np.zeros((2, N))
for ch in range(2):
    ir = lowpass(noise(len(ir_t)), 5) * np.exp(-ir_t * 2.4)
    ir[: int(0.02 * SR)] = 0
    rev[ch] = fft_convolve(bus["rev"][ch], ir / np.sqrt(np.sum(ir**2)))

vo_env = lowpass(np.abs(bus["vo"]).sum(0), int(0.05 * SR))
active = (vo_env > 0.02).astype(float)
active = np.maximum(active, np.roll(lowpass(active, int(0.3 * SR)) > 0, -int(0.15 * SR)))
duck = 1 - 0.6 * np.clip(lowpass(active, int(0.3 * SR)), 0, 1)

music = (bus["music"] + rev * 0.55) * duck
mix = music * 0.6 + bus["sfx"] * 0.75 * (0.65 + 0.35 * duck) + bus["vo"] * 0.95
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
tt = np.arange(N) / SR
mix *= np.minimum(tt / 0.02, 1) * np.clip((TOTAL - tt) / 1.2, 0, 1)
mix *= 0.95 / np.max(np.abs(mix))

out = ROOT / "public" / "condarco" / "soundtrack.wav"
out.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({TOTAL:.1f}s)")
