import { useState } from "react";
import { unlockSound } from "./sound.ts";
import MusicSelectionForm from "./MusicSelectionForm.tsx";

interface TimerFormProps {
  setClock: (minutes: number, seconds: number, playlistName: string) => void;
}

function TimerForm({setClock} : TimerFormProps) {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    unlockSound();
    const playlistName = String(new FormData(event.currentTarget).get("playlist") ?? "");
    setClock(Number(minutes), Number(seconds), playlistName);
  }

  return(
    <>
      <div className="flex min-h-screen justify-center items-center flex-col bg-gray-200">
        <div className="border-1 border-black border-full p-10 rounded-md bg-white">
          <h1 className="text-4xl mb-8">Enter Timer Duration</h1>
          <form id="durationForm" onSubmit={handleSubmit}>
            <div className="flex justify-center items-center w-2xs">
              <label htmlFor="minutes" className="w-2/5">Minutes:  </label>
              <input type="number" value={minutes} placeholder="00" onChange={e => setMinutes(e.target.value)} className="border-solid border-black border-1 px-2 rounded-sm w-9/10" id="minutes" name="minutes" max="60" min="0"/>
            </div>

            <div className="flex justify-center items-center mt-2 w-2xs">
              <label htmlFor="seconds" className="w-2/5">Seconds:  </label>
              <input type="number" value={seconds} placeholder="00" onChange={e => setSeconds(e.target.value)} className="border-solid border-black border-1 px-2 rounded-sm w-9/10" id="seconds" name="seconds" max="59" min="0"/>
            </div>

            <MusicSelectionForm />

            <div className="mt-4 flex justify-center items-center">
              <input className="hover:bg-gray-100 mt-4 text-center border-solid border-black border-1 px-4 py-2 cursor-pointer rounded-sm" type="submit" value="submit"></input>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default TimerForm;
