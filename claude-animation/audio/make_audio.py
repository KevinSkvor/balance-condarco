"""Sintetiza la banda sonora y los efectos de la animación, sólo con numpy.

Lee src/timeline.json (la misma línea de tiempo que usa Remotion), así que
cada golpe, click y "boing" cae exactamente en el frame de la animación.

Uso:  python3 audio/make_audio.py   ->  public/soundtrack.wav
"""

import json
import pathlib
import wave

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = json.loads((ROOT / "src" / "timeline.json").read_text())

SR = 44100
FPS = T["fps"]
N = int(SR * T["durationInFrames"] / FPS)
BEAT = 60 / T["bpm"]  # segundos por negra
rng = np.random.default_rng(7)

# Buses estéreo: "main" (seco), "pad" (se le aplica sidechain del bombo) y "rev" (envío a reverb)
bus = {name: np.zeros((2, N)) for name in ("main", "pad", "rev")}
kick_times: list[float] = []


def sec(frame: float) -> float:
    return frame / FPS


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def tv(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def noise(n: int) -> np.ndarray:
    return rng.uniform(-1, 1, n)


def lowpass(x: np.ndarray, win: int) -> np.ndarray:
    """Media móvil = pasa-bajos barato."""
    if win <= 1:
        return x
    c = np.cumsum(np.concatenate([np.zeros(win), x]))
    return (c[win:] - c[:-win]) / win


def highpass(x: np.ndarray, win: int = 4) -> np.ndarray:
    return x - lowpass(x, win)


def place(sig, t, pan=0.0, gain=1.0, rev=0.0, to="main"):
    """Suma `sig` en el instante `t` (s). `pan` puede ser escalar o array (-1..1)."""
    i = int(round(t * SR))
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    sig = sig[: N - i]
    pan = np.asarray(pan, dtype=float)
    if pan.ndim:
        pan = pan[: len(sig)]
    ang = (pan + 1) * np.pi / 4
    lr = np.stack([np.cos(ang) * sig, np.sin(ang) * sig]) * gain
    bus[to][:, i : i + len(sig)] += lr
    if rev:
        bus["rev"][:, i : i + len(sig)] += lr * rev


# ───────────────────────────── instrumentos ─────────────────────────────


def kick(dur=0.5, punch=1.0):
    t = tv(dur)
    f = 45 + 120 * punch * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    click = highpass(noise(len(t))) * np.exp(-t * 350) * 0.35
    return np.tanh((body + click) * 1.6)


def snare():
    t = tv(0.32)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 28) * 0.5
    sn = highpass(noise(len(t)), 3) * np.exp(-t * 16) * 0.8
    return tone + sn


def hat(open_=False):
    t = tv(0.22 if open_ else 0.06)
    return highpass(noise(len(t)), 2) * np.exp(-t * (14 if open_ else 85))


def bass(note, dur):
    t = tv(dur)
    f = midi(note)
    env = np.minimum(t / 0.008, 1) * np.exp(-t * 3.2)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return np.tanh(s * env * 1.4)


def pad(notes, dur, attack=0.25, release=0.5):
    t = tv(dur + release)
    out = np.zeros(len(t))
    for n in notes:
        for det in (-0.0018, 0.0, 0.0021):
            f = midi(n) * (1 + det)
            for k in range(1, 11):  # sierra suave aditiva
                out += np.sin(2 * np.pi * f * k * t + k * 1.3) / k * np.exp(-k * 0.38)
    env = np.minimum(t / attack, 1) * np.clip((dur + release - t) / release, 0, 1)
    return out * env / (len(notes) * 3)


def pluck(note, dur=0.7, bright=1.0):
    t = tv(dur)
    f = midi(note)
    s = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (3 + k * 4 / bright)) for k in range(1, 7))
    return s * np.minimum(t / 0.002, 1)


def bell(note, dur=1.6):
    t = tv(dur)
    f = midi(note)
    parts = [(1, 1.0, 2.2), (2.0, 0.5, 3.4), (2.76, 0.4, 5.0), (4.07, 0.25, 7.0), (5.4, 0.15, 9.5)]
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in parts)
    return s * np.minimum(t / 0.003, 1) * 0.5


def whoosh(dur=0.35, up=True):
    t = tv(dur)
    n = noise(len(t))
    lo, hi = lowpass(n, 24), lowpass(n, 5) - lowpass(n, 40)
    x = t / dur
    sweep = x if up else 1 - x
    s = lo * (1 - sweep) * 1.5 + hi * sweep * 2.2
    env = np.sin(np.pi * x) ** 2
    return s * env


def boing(pitch=1.0):
    t = tv(0.38)
    f = (170 + 260 * np.exp(-t * 11)) * pitch * (1 + 0.07 * np.sin(2 * np.pi * 17 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    thud = kick(0.25, punch=0.6) * 0.5
    s[: len(thud)] += thud
    return s


def click(pitch):
    t = tv(0.03)
    s = highpass(noise(len(t)), 2) * np.exp(-t * 420)
    s += np.sin(2 * np.pi * pitch * t) * np.exp(-t * 260) * 0.35
    return s


def riser(dur):
    t = tv(dur)
    x = t / dur
    f = 220 * (12 ** x)  # 220 Hz -> 2.6 kHz
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    nz = (lowpass(noise(len(t)), 6) - lowpass(noise(len(t)), 60)) * 1.6
    return (tone + nz) * x ** 2.2


def reverse_cymbal(dur):
    t = tv(dur)
    s = highpass(noise(len(t)), 3) * np.exp(-t * 3.2)
    return s[::-1]


def crash(dur=2.2):
    t = tv(dur)
    return highpass(noise(len(t)), 3) * np.exp(-t * 2.4) * np.minimum(t / 0.002, 1)


def sub_boom(dur=1.6):
    t = tv(dur)
    f = 32 + 40 * np.exp(-t * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)


# ───────────────────────────── partitura ─────────────────────────────

A_MINOR_PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88, 91]
CHORDS = [  # Am, F, C, G  (raíz del bajo, notas del pad)
    (45, [57, 60, 64, 71]),
    (41, [53, 57, 60, 64]),
    (48, [55, 60, 64, 67]),
    (43, [55, 59, 62, 67]),
]

# 1) Intro: respiración que crece hacia la explosión
burst = sec(T["burst"])
place(reverse_cymbal(burst), 0, gain=0.35, rev=0.3)
t = tv(burst)
gliss = np.sin(2 * np.pi * np.cumsum(110 * 4 ** (t / burst)) / SR) * (t / burst) ** 2 * 0.25
place(gliss, 0, pan=0.0, rev=0.4)

# 2) Explosión de la chispa
place(kick(0.6, punch=1.3), burst, gain=1.0)
place(sub_boom(1.4), burst, gain=0.8)
place(crash(1.8), burst, gain=0.35, rev=0.5)
for i in range(14):  # destellos de partículas
    dt = rng.uniform(0.02, 0.9)
    place(bell(rng.choice(A_MINOR_PENTA[6:]), 0.9), burst + dt, pan=rng.uniform(-0.9, 0.9), gain=0.12, rev=0.6)
place(pad(CHORDS[0][1], 0.5, attack=0.4, release=0.6), burst, gain=0.5, rev=0.4, to="pad")

# 3) Logo: cada rayo que se dibuja suena como una nota del arpegio
for i in range(12):
    place(pluck(A_MINOR_PENTA[i], 0.6, bright=1.5), sec(T["logoIn"] + 4 + i * 1.2),
          pan=np.sin(i) * 0.6, gain=0.25, rev=0.45)
place(whoosh(0.4, up=True), sec(T["logoIn"]), gain=0.5, rev=0.2)

# 4) Tecleo
for i, ch in enumerate(T["typeText"]):
    if ch != " ":
        place(click(rng.uniform(1700, 2600)), sec(T["typeStart"] + i * T["charFrames"]),
              pan=rng.uniform(-0.3, 0.3), gain=0.45, rev=0.1)

# 5) Groove (120 BPM) desde beatStart hasta beatEnd
beat_frames = BEAT * FPS
b = 0
while T["beatStart"] + b * beat_frames < T["beatEnd"]:
    tb = sec(T["beatStart"] + b * beat_frames)
    root, chord = CHORDS[(b // 2) % 4]
    place(kick(), tb, gain=0.9)
    kick_times.append(tb)
    if b % 2 == 1:
        place(snare(), tb, gain=0.45, rev=0.25, pan=0.05)
    place(hat(open_=(b % 4 == 3)), tb + BEAT / 2, gain=0.22, pan=0.35)
    place(hat(), tb + BEAT * 0.75, gain=0.10, pan=-0.35)
    place(bass(root, BEAT * 0.45), tb, gain=0.45)
    place(bass(root + 12 if b % 2 else root, BEAT * 0.4), tb + BEAT / 2, gain=0.35)
    if b % 2 == 0:
        place(pad(chord, BEAT * 2), tb, gain=0.55, rev=0.35, to="pad")
    b += 1

# 6) Arpegio durante las habilidades (semicorcheas)
t0, t1 = sec(T["skillsIn"]), sec(T["bounceIn"])
step = BEAT / 4
k = 0
while t0 + k * step < t1:
    tt = t0 + k * step
    beat_idx = int((tt - sec(T["beatStart"])) / BEAT)
    chord = CHORDS[(beat_idx // 2) % 4][1]
    note = chord[[0, 1, 2, 3, 2, 1][k % 6]] + 12
    place(pluck(note, 0.35, bright=0.8), tt, pan=0.5 if k % 2 else -0.5, gain=0.12, rev=0.3)
    k += 1

# 7) Tarjetas: whoosh al entrar + campana al aterrizar (escala ascendente)
for i, f in enumerate(T["cards"]):
    place(whoosh(0.3), sec(f - 3), pan=np.linspace(-0.6, 0.6, int(0.3 * SR)), gain=0.55, rev=0.2)
    place(bell([76, 79, 81, 84][i], 1.4), sec(f + 7), pan=[-0.5, -0.17, 0.17, 0.5][i], gain=0.32, rev=0.5)
place(whoosh(0.4, up=False), sec(T["bounceIn"] - 8), gain=0.5, rev=0.2)

# 8) Pelota: un "boing" por contacto, cada vez más agudo (rebote más corto)
for i, f in enumerate(T["contacts"]):
    xpan = [-0.35, 0.05, 0.3][i]
    place(boing(1.0 + i * 0.18), sec(f), pan=xpan, gain=0.55, rev=0.25)
place(whoosh(0.35, up=True), sec(T["contacts"][-1] + 1), gain=0.45, rev=0.3)

# 9) Riser + silencio + BOOM final
pop = sec(T["pop"])
r0 = sec(T["beatEnd"])
place(riser(pop - r0), r0, gain=0.6, rev=0.3)
place(reverse_cymbal(pop - r0 + 0.05), r0 - 0.05, gain=0.35)
place(kick(0.8, punch=1.5), pop, gain=1.1)
place(sub_boom(1.8), pop, gain=1.0)
place(crash(2.5), pop, gain=0.45, rev=0.6)
final_chord = [48, 55, 60, 64, 67, 71, 74]  # Cmaj9: final luminoso
place(pad(final_chord, sec(T["end"]) - pop, attack=0.02, release=0.3), pop, gain=0.9, rev=0.5, to="pad")
for i, n in enumerate([72, 76, 79, 83, 86, 88]):
    place(bell(n, 1.2), pop + 0.05 + i * 0.06, pan=-0.6 + i * 0.24, gain=0.2, rev=0.7)
# brillos del título
for i in range(10):
    place(bell(rng.choice([84, 86, 88, 91, 93]), 0.7), sec(T["pop"] + 4) + i * 0.07,
          pan=rng.uniform(-0.8, 0.8), gain=0.07, rev=0.7)

# ───────────────────────────── mezcla ─────────────────────────────


def fft_convolve(x, h):
    n = 1 << int(np.ceil(np.log2(len(x) + len(h))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(h, n), n)[: len(x)]


# Sidechain: el pad "respira" con el bombo
tt = np.arange(N) / SR
duck = np.ones(N)
for kt in kick_times:
    m = tt >= kt
    duck[m] -= 0.55 * np.exp(-(tt[m] - kt) * 9)
duck = np.clip(duck, 0.35, 1)

# Reverb: respuesta al impulso de ruido con caída exponencial (distinta por canal)
ir_t = tv(2.0)
rev = np.zeros((2, N))
for ch in range(2):
    ir = lowpass(noise(len(ir_t)), 3) * np.exp(-ir_t * 3.0)
    ir[: int(0.012 * SR)] = 0  # pre-delay
    rev[ch] = fft_convolve(bus["rev"][ch], ir / np.sqrt(np.sum(ir**2)))

mix = bus["main"] + bus["pad"] * duck + rev * 0.45
mix /= np.max(np.abs(mix))
mix = np.tanh(mix * 1.35) / np.tanh(1.35)  # saturación suave tipo "glue"

fade_in = np.minimum(tt / 0.005, 1)
fade_out = np.clip((tt[-1] - tt) / 0.35, 0, 1)
mix *= fade_in * fade_out * 0.92

out = ROOT / "public" / "soundtrack.wav"
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"OK -> {out.relative_to(ROOT)}  ({N / SR:.2f}s, {SR} Hz, estéreo)")
