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
    const res = await fetch("http://localhost:3000/api/playlists/");
    const playlistsJSON = await res.json();

    setPlaylists(playlistsJSON);
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  // Each option's value is the song URL, so TimerForm can read it straight off the submitted form.
  return (
    <div className="p-4">
      <label htmlFor="song-select">Select a playlist: </label>
      <select name="playlist" id="song-select" className="border-full border-black border-1 rounded-sm p-2">
        {playlists.map((playlist) => (
          <option key={playlist.id}> { playlist.id }</option>
        ))}
      </select>
    </div>
  )
}

export default MusicSelectionForm;
