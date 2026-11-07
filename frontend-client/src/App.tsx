import { useState } from 'react'
import Timer from './Timer.tsx'
import TimerForm from './TimerForm.tsx'

function App() {
  const [isTimerSet, setTimerStatus] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  function setTimer(minutes: number, seconds: number) {
    setMinutes(minutes);
    setSeconds(seconds);
    setTimerStatus(true);
  }

  function disableTimer() {
    setTimerStatus(false);
  }

  if (isTimerSet) {
    return <Timer minutes={minutes} seconds={seconds} disableTimerCallback={disableTimer}/>;
  } else {
    return <TimerForm setClock={setTimer} />;
  }
}

export default App
