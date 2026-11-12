import { useEffect, useState } from "react";
import { getSongVolume, onSongEnded, playSong, resumeSong, setSongVolume, stopSong } from "./sound.ts";

export type Song = {
  id: string;
  trackLength: number;
  trackName: string;
}

interface MusicPlayerProps {
  playlistName: string;
  queue: Song[];
}

const buttonClass = "flex items-center justify-center border-black border-1 rounded-sm px-2 py-1 cursor-pointer hover:bg-gray-100";

function MusicPlayer({ playlistName, queue }: MusicPlayerProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Changing index plays that song; the cleanup stops the music when the player goes away.
  useEffect(() => {
    if (!queue.length) return;
    playSong(`http://localhost:3000/api/songs/${playlistName}/${queue[index].id}`);
    return stopSong;
  }, [playlistName, queue, index]);

  // When a song finishes, move on to the next one, wrapping back to the first.
  useEffect(() => onSongEnded(() => setIndex(i => (i + 1) % queue.length)), [queue.length]);

  // step is 1 for next, -1 for previous; adding queue.length keeps previous-from-first from going negative.
  function skip(step: number) {
    setIndex(i => (i + step + queue.length) % queue.length);
    setIsPaused(false);
  }

  function togglePause() {
    if (isPaused) resumeSong();
    else stopSong();
    setIsPaused(!isPaused);
  }

  if (!queue.length) return null;

  return (
    <div className="flex flex-col items-center mt-6 gap-2">
      <p className="text-wrapped">Now playing: {queue[index].trackName}</p>
      <div className="flex gap-2">
        <button type="button" className={buttonClass} onClick={() => skip(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 rotate-180">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
          </svg>
        </button>
        <button type="button" className={buttonClass} onClick={togglePause}>{isPaused ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
        : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
        </svg>
        }</button>
        <button type="button" className={buttonClass} onClick={() => skip(1)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="volume">Volume:</label>
        <input type="range" id="volume" min="0" max="1" step="0.01" defaultValue={getSongVolume()} onChange={e => setSongVolume(Number(e.target.value))} />
      </div>
      <div className="flex items-center gap-2">

      </div>
    </div>
  )
}

export default MusicPlayer;
