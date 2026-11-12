import { useEffect, useState } from "react";

type Playlist = {
  id: string;
  track_count: number;
  duration_seconds: number;
  tracks: string[];
};

function MusicSelectionForm() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  async function loadPlaylists() {
    const res = await fetch("/api/playlists/");
    const playlistsJSON = await res.json();

    setPlaylists(playlistsJSON);
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  // Radios styled as buttons: the browser keeps one checked, CSS highlights it, and TimerForm reads it from the form as "playlist".
  return (
    <fieldset className="p-4">
      <legend className="w-full text-center mt-4">Select a playlist</legend>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {playlists.map((playlist, i) => (
          <label key={playlist.id} className="text-center border-black border-1 rounded-sm px-2 py-1 cursor-pointer not-has-checked:hover:bg-gray-100 has-checked:bg-black has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2">
            <input type="radio" name="playlist" value={playlist.id} defaultChecked={i === 0} className="sr-only" />
            {playlist.id}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default MusicSelectionForm;
