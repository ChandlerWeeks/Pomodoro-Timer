const express = require("express");
const cors = require("cors");
const playlistRoutes = require("./routes/playlists.routes.js");
const creditsRoutes = require("./routes/credits.routes.js");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/", playlistRoutes);
app.use("/api/", creditsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
