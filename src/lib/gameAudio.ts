/**
 * gameAudio.ts
 * All sounds synthesized via Web Audio API — no audio files, fully copyright-free.
 */

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") void _ctx.resume();
  return _ctx;
}

function master(): GainNode {
  const c = ctx();
  if (!_master) {
    _master = c.createGain();
    _master.gain.value = 0.55;
    _master.connect(c.destination);
  }
  return _master;
}

/** Resume context after a user gesture (call once on first interaction). */
export function resumeAudio() {
  ctx();
}

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────

function sine(
  freq: number,
  gainVal: number,
  duration: number,
  startTime?: number,
  freqEnd?: number,
) {
  const c = ctx();
  const t = startTime ?? c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 1),
      t + duration,
    );
  }
  g.gain.setValueAtTime(gainVal, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g);
  g.connect(master());
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function square(
  freq: number,
  gainVal: number,
  duration: number,
  startTime?: number,
) {
  const c = ctx();
  const t = startTime ?? c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gainVal, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g);
  g.connect(master());
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function noise(
  gainVal: number,
  duration: number,
  lpFreq: number,
  startTime?: number,
) {
  const c = ctx();
  const t = startTime ?? c.currentTime;
  const bufLen = Math.ceil(c.sampleRate * duration);
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = lpFreq;
  const g = c.createGain();
  g.gain.setValueAtTime(gainVal, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(lp);
  lp.connect(g);
  g.connect(master());
  src.start(t);
  src.stop(t + duration + 0.01);
}

// ─────────────────────────────────────────────────────────────
// Level 1 — Olfactory
// ─────────────────────────────────────────────────────────────

/** Satisfying click when all four fingers grip the vial */
export function playGrip() {
  const c = ctx();
  const t = c.currentTime;
  sine(900, 0.25, 0.06, t);
  sine(1200, 0.15, 0.04, t + 0.01);
}

/** Glass-drop: falling pitch + noise burst */
export function playDrop() {
  const c = ctx();
  const t = c.currentTime;
  sine(600, 0.3, 0.35, t, 80);
  noise(0.18, 0.25, 2000, t);
}

/** Vial successfully delivered to patient's nose */
export function playVialSuccess() {
  playWinChime(0.5);
}

// ─────────────────────────────────────────────────────────────
// Level 4 — Trigeminal
// ─────────────────────────────────────────────────────────────

/** Gentle cotton-puff touch */
export function playSoftTouch() {
  noise(0.15, 0.12, 700, ctx().currentTime);
}

/** Sharp pin — short buzzy zap */
export function playSharpPoke() {
  const c = ctx();
  const t = c.currentTime;
  square(1400, 0.18, 0.05, t);
  square(800, 0.12, 0.08, t + 0.03);
}

/** Missed face entirely */
export function playMiss() {
  const c = ctx();
  const t = c.currentTime;
  sine(300, 0.15, 0.18, t, 150);
}

// ─────────────────────────────────────────────────────────────
// Level 5 — Facial Nerve
// ─────────────────────────────────────────────────────────────

/** Muscle group toggled on */
export function playMuscleOn() {
  sine(660, 0.08, 0.07);
}

/** Expression fully matched */
export function playExpressionMatch() {
  const c = ctx();
  const t = c.currentTime;
  sine(440, 0.2, 0.12, t);
  sine(550, 0.18, 0.12, t + 0.08);
  sine(660, 0.22, 0.18, t + 0.16);
}

/** Time running out — metronome tick */
export function playTimerTick() {
  sine(680, 0.12, 0.04);
}

/** Timer expired — stress penalty */
export function playTimerExpire() {
  const c = ctx();
  const t = c.currentTime;
  sine(220, 0.22, 0.3, t, 110);
  noise(0.08, 0.3, 400, t);
}

// ─────────────────────────────────────────────────────────────
// Level 7 — Gag Reflex
// ─────────────────────────────────────────────────────────────

/** Tongue depressor reaches back of throat — wet thud */
export function playThroatHit() {
  const c = ctx();
  const t = c.currentTime;
  sine(90, 0.35, 0.2, t, 40);
  noise(0.12, 0.15, 500, t);
}

/** Mouth snaps shut — chomp */
export function playBite() {
  const c = ctx();
  const t = c.currentTime;
  noise(0.35, 0.08, 3000, t);
  sine(180, 0.3, 0.12, t, 60);
  sine(80, 0.25, 0.15, t + 0.03, 40);
}

/** Mouth starting to close — warning rumble */
export function playMouthWarning() {
  const c = ctx();
  const t = c.currentTime;
  sine(110, 0.1, 0.4, t);
}

// ─────────────────────────────────────────────────────────────
// Level 9 — Hypoglossal
// ─────────────────────────────────────────────────────────────

/** Tongue hits a target position — rubbery boink */
export function playTongueHit() {
  const c = ctx();
  const t = c.currentTime;
  sine(520, 0.28, 0.22, t, 180);
}

/** Tongue released — slimy spring-back whoosh */
export function playTongueRelease() {
  noise(0.07, 0.18, 1200, ctx().currentTime);
}

// ─────────────────────────────────────────────────────────────
// Global / Shared
// ─────────────────────────────────────────────────────────────

/** Stress penalty sting — high sharp zap */
export function playStress() {
  const c = ctx();
  const t = c.currentTime;
  sine(2200, 0.14, 0.08, t, 800);
}

/** Generic win fanfare — ascending arpeggio */
export function playWinFanfare() {
  playWinChime(0);
}

function playWinChime(offsetSec: number) {
  const c = ctx();
  const t = c.currentTime + offsetSec;
  const notes = [262, 330, 392, 523, 659];
  notes.forEach((freq, i) => {
    sine(freq, 0.22, 0.3, t + i * 0.13);
  });
}

/** Dialogue bubble appears — paper rustle */
export function playDialogue() {
  noise(0.06, 0.1, 1800, ctx().currentTime);
}
