import { useState } from 'react'
import Timer from './Timer.tsx'
import TimerForm from './TimerForm.tsx'

function App() {
  const [isTimerSet, setTimerStatus] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [playlistName, setPlaylistName] = useState("");

  function setTimer(minutes: number, seconds: number, playlistName: string) {
    setMinutes(minutes);
    setSeconds(seconds);
    setPlaylistName(playlistName);
    setTimerStatus(true);
  }

  function disableTimer() {
    setTimerStatus(false);
  }

  if (isTimerSet) {
    return <Timer minutes={minutes} seconds={seconds} playlistName={playlistName} disableTimerCallback={disableTimer}/>;
  } else {
    return <TimerForm setClock={setTimer} />;
  }
}

export default App
