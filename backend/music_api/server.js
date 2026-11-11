const express = require("express");
const cors = require("cors");
const playlistRoutes = require("./routes/playlists.routes.js");
const creditsRoutes = require("./routes/credits.routes.js");
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});

const app = express();

// Apply to all routes
app.use(limiter);
app.use(express.json());
app.use(cors());

app.use("/api/", playlistRoutes);
app.use("/api/", creditsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
