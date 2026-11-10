import { useEffect, useState } from 'react';
import { playBubble } from './sound.ts';
import MusicPlayer, { type Song } from './music.tsx';

interface TimeProps {
  minutes: number;
  seconds: number;
  playlistName: string;
  disableTimerCallback: () => void;
}

function Timer({minutes, seconds, playlistName, disableTimerCallback} : TimeProps) {
  const [remainingMinutes, setRemainingMinutes] = useState(minutes);
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  const [isRinging, setIsRinging] = useState(false);
  const [musicQueue, setMusicQueue] = useState<Song[]>([]);

  async function getSongQueue() {
    const res = await fetch(`http://localhost:3000/api/playlists/${playlistName}/songs`);
    const songQueueJSON = await res.json();

    setMusicQueue(songQueueJSON);
  }

  // create the song queue
  useEffect(() => {
    getSongQueue();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else if (remainingMinutes > 0) {
        setRemainingMinutes(remainingMinutes - 1);
        setRemainingSeconds(59);
      } else {
        setIsRinging(true);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [remainingMinutes, remainingSeconds]);

  // Bubble every second until dismissed; dismissing unmounts Timer, and the cleanup stops the interval.
  useEffect(() => {
    if (!isRinging) return;
    playBubble();
    const id = setInterval(playBubble, 1000);
    return () => clearInterval(id);
  }, [isRinging]);

  // Disable the timer at the app level
  function disableTimer() {
    disableTimerCallback();
  }

  return(
    <>
      <div className="flex min-h-screen justify-center items-center flex-col border-full bg-gray-200">
        <div className="border-full border-black border-1 p-12 rounded-md bg-white">
          <div>
            <h1 className="text-4xl">Pomodoro Timer</h1>
          </div>
          <div className="pt-10">
            <p className="text-8xl text-center">
              {Math.floor(remainingMinutes)}:{String(remainingSeconds % 60).padStart(2, '0')}
            </p>
          </div>
          {/* Hiding the player once ringing starts stops the music, so the bubbles can be heard. */}
          {playlistName && !isRinging && <MusicPlayer playlistName={playlistName} queue={musicQueue} />}
          {isRinging && <p className="text-xl text-center mt-6">TIMER WEEWOOWEEWOO</p>}
          <div className='flex justify-center items-center flex-col'>
            <input type="submit" value={isRinging ? "Dismiss" : "Stop Timer"} className="border-full border-black border-1 p-1 rounded-sm cursor-pointer mt-10 hover:bg-gray-100" onClick={disableTimer}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default Timer;
