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

const buttonClass = "border-black border-1 rounded-sm px-2 py-1 cursor-pointer hover:bg-gray-100";

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
      <p>Now playing: {queue[index].trackName}</p>
      <div className="flex gap-2">
        <button type="button" className={buttonClass} onClick={() => skip(-1)}>Previous</button>
        <button type="button" className={buttonClass} onClick={togglePause}>{isPaused ? "Play" : "Pause"}</button>
        <button type="button" className={buttonClass} onClick={() => skip(1)}>Next</button>
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
