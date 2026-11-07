// Browsers (Firefox/Zen especially) keep audio muted unless it starts during a click,
// so one shared context is unlocked on submit and reused when the timer ends.
let ctx: AudioContext | undefined;

export function unlockSound() {
  ctx ??= new AudioContext();
  ctx.resume();
}

// Synthesized with Web Audio, so no sound file needed: two quick rising chirps sound "bubbly".
export function playBubble() {
  ctx ??= new AudioContext();
  const audio = ctx;
  [0, 0.12].forEach(offset => {
    const t = audio.currentTime + offset;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  });
}
