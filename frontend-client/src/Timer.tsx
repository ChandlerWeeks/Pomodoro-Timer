import { useEffect, useState } from 'react';
import { playBubble } from './sound.ts';
import MusicPlayer, { type Song } from './Music.tsx';

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
  const totalTime = minutes * 60 + seconds;
  const remainingTime = remainingMinutes * 60 + remainingSeconds;
  const percentageReamining = remainingTime / totalTime;
  const circumference = 2 * Math.PI * 50;

  async function getSongQueue() {
    if (!playlistName) return;
    const res = await fetch(`/api/playlists/${playlistName}/songs`);
    const songQueueJSON: Song[] = await res.json();

    // Fisher–Yates shuffle: swap each song with a random one at or before it, so every order is equally likely.
    for (let i = songQueueJSON.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songQueueJSON[i], songQueueJSON[j]] = [songQueueJSON[j], songQueueJSON[i]];
    }

    setMusicQueue(songQueueJSON);
  }

  // create the song queue
  useEffect(() => {
    getSongQueue();
  }, []);

  // update when the remaining seconds goes brr
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
      <div className="flex flex-1 justify-center items-center flex-col border-full bg-gray-100">
        <div className="border-full border-black border-1 p-12 rounded-md bg-white w-120">
          <div className='w-full'>
            <h1 className="text-4xl text-center w-full">Pomodoro Timer</h1>
          </div>
          <div className="pt-10">
            <div className="aspect-square relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="-4 -4 108 108">
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  className="stroke-red-800 fill-none"
                  stroke-width="8"
                />
                <circle
                  id="progress-ring"
                  cx="50"
                  cy="50"
                  r="50"
                  className="stroke-red-400 fill-none"
                  stroke-width="8"
                  stroke-dasharray={circumference}
                  stroke-dashoffset={ circumference * (1 - percentageReamining)}
                  stroke-linecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-8xl text-center suse-mono">
                  {Math.floor(remainingMinutes)}:{String(remainingSeconds % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
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
