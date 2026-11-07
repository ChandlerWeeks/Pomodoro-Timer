import { useEffect, useState } from 'react';
import { playBubble } from './sound.ts';

interface TimeProps {
  minutes: number;
  seconds: number;
  disableTimerCallback: () => void;
}

function Timer({minutes, seconds, disableTimerCallback} : TimeProps) {
  const [remainingMinutes, setRemainingMinutes] = useState(minutes);
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);
  const [isRinging, setIsRinging] = useState(false);

  
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
      <div className="flex min-h-screen justify-center items-center flex-col border-full">
        <div className="border-full border-black border-1 p-12 rounded-md">
          <div>
            <h1 className="text-4xl">Pomodoro Timer</h1>
          </div>
          <div className="pt-10">
            <p className="text-8xl text-center">
              {Math.floor(remainingMinutes)}:{String(remainingSeconds % 60).padStart(2, '0')}
            </p>
          </div>
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