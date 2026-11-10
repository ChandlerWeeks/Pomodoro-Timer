const express = require("express");
const { getPlaylists, getPlaylist, getSong, getSongs } = require("../controllers/playlistController.js");

const router = express.Router();

router.get("/playlists", getPlaylists);
router.get("/playlists/:id", getPlaylist);
router.get("/songs/:playlistId/:songId", getSong);
router.get("/playlists/:playlistId/songs", getSongs);

module.exports = router;
