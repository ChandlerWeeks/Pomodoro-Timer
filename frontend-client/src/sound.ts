// Browsers (Firefox/Zen especially) keep audio muted unless it starts during a click,
// so one shared context is unlocked on submit and reused when the timer ends.
let ctx: AudioContext | undefined;

export function unlockSound() {
  ctx ??= new AudioContext();
  ctx.resume();
}

// One shared player for the whole app, so settings like volume carry over from one timer to the next.
const song = new Audio();

// Switching songs before the last one finishes loading cancels its play() with an AbortError.
// That's expected (skipping quickly, or React's double effects in dev), so only real errors are rethrown.
function startPlaying() {
  song.play().catch((error: DOMException) => {
    if (error.name !== "AbortError") throw error;
  });
}

export function playSong(url: string) {
  song.src = url;
  startPlaying();
}

export function stopSong() {
  song.pause();
}

export function resumeSong() {
  startPlaying();
}

// Returns a function that removes the listener, so it works directly as an effect cleanup.
export function onSongEnded(callback: () => void) {
  song.addEventListener("ended", callback);
  return () => song.removeEventListener("ended", callback);
}

// Volume is 0 (silent) to 1 (full); it stays on the shared song, so it carries over to the next timer.
export function getSongVolume() {
  return song.volume;
}

export function setSongVolume(volume: number) {
  song.volume = volume;
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
