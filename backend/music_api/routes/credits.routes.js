const express = require("express");
const { getCredits, getPlaylistCredits, getSongCredits } = require("../controllers/creditsController.js");

const router = express.Router();

router.get("/credits", getCredits);
router.get("/credits/:playlistId", getPlaylistCredits);
router.get("/credits/:playlistId/:songId", getSongCredits);

module.exports = router;
