const songs = require("../data/catalog.json");

const credit = ({ id, playlist, title, artist, album, attribution }) =>
  ({ id, playlist, title, artist, album, ...attribution });

const getCredits = (req, res) => {
  res.send(Object.values(songs).map(credit));
};

const getPlaylistCredits = (req, res) => {
  const playlistId = req.params.playlistId;
  const credits = Object.values(songs).filter(s => s.playlist === playlistId).map(credit);

  if (!credits.length) {
    return res.status(404).json({error: `No playlist titled: ${playlistId}`})
  }
  res.send(credits);
};

const getSongCredits = (req, res) => {
  const song = songs[`${req.params.playlistId}-${req.params.songId}`];

  if (!song) {
    return res.status(404).json({error: `No song: ${req.params.songId}`})
  }
  res.send(credit(song));
};

module.exports = { getCredits, getPlaylistCredits, getSongCredits };
