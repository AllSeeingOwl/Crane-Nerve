/**
 * useAmbientAudio.ts
 * Procedural ambient drone for gameplay — no files, 100% Web Audio API synthesis.
 * Creates a layered low-frequency medical-office drone with periodic EKG beeps.
 */
import { useEffect, useRef } from "react";

export function useAmbientAudio(active: boolean) {
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!active) {
      nodesRef.current?.stop();
      nodesRef.current = null;
      return;
    }

    let stopped = false;
    let ekgTimer: ReturnType<typeof setTimeout>;

    const audioCtx = new AudioContext();

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.45, audioCtx.currentTime + 2.5);
    masterGain.connect(audioCtx.destination);

    // ── Low drone: 55 Hz fundamental ──────────────────────────────
    const drone1 = audioCtx.createOscillator();
    drone1.type = "sine";
    drone1.frequency.value = 55;
    const droneGain1 = audioCtx.createGain();
    droneGain1.gain.value = 0.28;
    drone1.connect(droneGain1);
    droneGain1.connect(masterGain);
    drone1.start();

    // ── Octave overlay: 110 Hz ────────────────────────────────────
    const drone2 = audioCtx.createOscillator();
    drone2.type = "sine";
    drone2.frequency.value = 110;
    const droneGain2 = audioCtx.createGain();
    droneGain2.gain.value = 0.1;
    drone2.connect(droneGain2);
    droneGain2.connect(masterGain);
    drone2.start();

    // ── Slight detuned companion for organic beating ──────────────
    const drone3 = audioCtx.createOscillator();
    drone3.type = "sine";
    drone3.frequency.value = 56.2;
    const droneGain3 = audioCtx.createGain();
    droneGain3.gain.value = 0.06;
    drone3.connect(droneGain3);
    droneGain3.connect(masterGain);
    drone3.start();

    // ── Slow LFO tremolo on drone1 (0.08 Hz) ─────────────────────
    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain1.gain);
    lfo.start();

    // ── Subtle filtered hiss (ventilation ambience) ───────────────
    const bufLen = audioCtx.sampleRate * 3;
    const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const hissLoop = audioCtx.createBufferSource();
    hissLoop.buffer = buf;
    hissLoop.loop = true;
    const hissLp = audioCtx.createBiquadFilter();
    hissLp.type = "lowpass";
    hissLp.frequency.value = 220;
    const hissGain = audioCtx.createGain();
    hissGain.gain.value = 0.04;
    hissLoop.connect(hissLp);
    hissLp.connect(hissGain);
    hissGain.connect(masterGain);
    hissLoop.start();

    // ── Periodic EKG beep ─────────────────────────────────────────
    function scheduleEkg() {
      if (stopped) return;
      const interval = 1600 + Math.random() * 400;
      ekgTimer = setTimeout(() => {
        if (stopped) return;
        const t = audioCtx.currentTime;
        const beepOsc = audioCtx.createOscillator();
        beepOsc.type = "sine";
        beepOsc.frequency.setValueAtTime(880, t);
        beepOsc.frequency.exponentialRampToValueAtTime(660, t + 0.04);
        const beepGain = audioCtx.createGain();
        beepGain.gain.setValueAtTime(0.07, t);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        beepOsc.connect(beepGain);
        beepGain.connect(masterGain);
        beepOsc.start(t);
        beepOsc.stop(t + 0.1);
        scheduleEkg();
      }, interval);
    }
    scheduleEkg();

    nodesRef.current = {
      stop() {
        stopped = true;
        clearTimeout(ekgTimer);
        masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
        setTimeout(() => {
          try {
            drone1.stop();
            drone2.stop();
            drone3.stop();
            lfo.stop();
            hissLoop.stop();
            void audioCtx.close();
          } catch {
            // already stopped
          }
        }, 1400);
      },
    };

    return () => {
      nodesRef.current?.stop();
      nodesRef.current = null;
    };
  }, [active]);
}
