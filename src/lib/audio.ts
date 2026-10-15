// Lightweight Web Audio helpers — no external assets required.
// All sounds are synthesized at runtime so there's nothing to fetch.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

// Some browsers create the context suspended until a user gesture.
export function resumeAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playBeep(freq = 660, duration = 0.25, gain = 0.2) {
  resumeAudio();
  tone(freq, 0, duration, 'triangle', gain);
}

// Count down: 3 → 2 → 1 with an ascending bright tick each beat.
export function playCountTick(step: number) {
  resumeAudio();
  const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
  const f = freqs[step] ?? 523.25;
  tone(f, 0, 0.35, 'triangle', 0.22);
  tone(f * 2, 0.02, 0.2, 'sine', 0.08);
}

// A triumphant chord + little flourish when the countdown ends.
export function playCelebrationFanfare() {
  resumeAudio();
  const c = getCtx();
  if (!c) return;
  // C major chord
  tone(523.25, 0, 0.6, 'triangle', 0.2);
  tone(659.25, 0, 0.6, 'triangle', 0.18);
  tone(783.99, 0, 0.6, 'triangle', 0.18);
  // flourish
  const notes = [659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, 0.5 + i * 0.12, 0.3, 'sine', 0.16));
}

// "Happy Birthday" melody (first phrase) looped gently.
const HAPPY_BIRTHDAY: Array<[number, number]> = [
  // [freq, duration in beats]
  [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [523.25, 1], [493.88, 2],
  [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [587.33, 1], [523.25, 2],
  [392.0, 0.75], [392.0, 0.25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440.0, 2],
  [698.46, 0.75], [698.46, 0.25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2],
];

let melodyTimer: number | null = null;

export function playBirthdayMusic() {
  resumeAudio();
  stopBirthdayMusic();
  const beat = 0.42;
  const playLoop = () => {
    let t = 0;
    HAPPY_BIRTHDAY.forEach(([freq, dur]) => {
      tone(freq, t, dur * beat * 0.92, 'triangle', 0.14);
      // soft harmony an octave below
      tone(freq / 2, t, dur * beat * 0.9, 'sine', 0.06);
      t += dur * beat;
    });
    melodyTimer = window.setTimeout(playLoop, (t + 0.8) * 1000);
  };
  playLoop();
}

export function stopBirthdayMusic() {
  if (melodyTimer !== null) {
    clearTimeout(melodyTimer);
    melodyTimer = null;
  }
}
