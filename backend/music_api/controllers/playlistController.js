const path = require("path");

const playlists = require('../data/playlist.json');
const songs = require("../data/catalog.json");

const getPlaylists = (req, res) => {
  return res.send(playlists);
};

const getPlaylist = (req, res) => {
  const id = req.params.id;
  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return res.status(404).json({error: `No playlist titled: ${id}`})
  }
  res.send(playlist);
};

const getSong = (req, res) => {
  const playlistId = req.params.playlistId;
  const songId = req.params.songId;

  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) {
    return res.status(404).json({error: `No playlist titled: ${playlistId}`})
  }
  const song = songs[`${playlistId}-${songId}`];
  console.log(`${playlistId}-${songId}`);
  if (!song) {
    return res.status(404).json({error: `No song: ${songId}`})
  }

  return res.sendFile(path.join(__dirname, "..", "data", "music", song.path));
};

// get the songs in a playlist: Generate a queue on music.
const getSongs = (req, res) => {
  const playlistId = req.params.playlistId;
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) {
    return res.status(404).json({error: `No playlist: ${playlistId}`})
  }
  // get the songs from the playlist
  const tracks = playlist.tracks;
  if (!tracks) {
    return res.status(404).json({error: `No tracks in the playlist: ${playlistId}`})
  }
  // Field names match the Song type in the frontend's Timer.tsx.
  return res.send(tracks.map(id => {
    const song = songs[`${playlistId}-${id}`];
    return { id, trackName: song.title, trackLength: song.duration_seconds };
  }));
}

module.exports = { getPlaylists, getPlaylist, getSong, getSongs};
