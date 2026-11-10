# Pomodoro Timer

A pomodoro timer that plays music from a playlist you pick while the countdown runs.
When the timer ends, the music stops and an alarm plays until you dismiss it.

## Project layout

| Folder | What it is |
| --- | --- |
| `frontend-client/` | The timer app: React, TypeScript, Vite, and Tailwind. |
| `backend/music_api/` | An Express API that serves the playlists, song details, audio, and credits. |

## Running it

Start the backend first. The frontend expects it at `http://localhost:3000`.

```sh
cd backend/music_api
npm install
npm start
```

`npm run dev` restarts the server whenever a file changes, but it needs `nodemon` installed globally (`npm install -g nodemon`).

In a second terminal, start the frontend:

```sh
cd frontend-client
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

## API

All routes start with `/api`.

| Route | Returns |
| --- | --- |
| `GET /playlists` | Every playlist, with its track IDs. |
| `GET /playlists/:playlistId` | One playlist. |
| `GET /playlists/:playlistId/songs` | The playlist's songs: `id`, `trackName`, and `trackLength` in seconds. |
| `GET /songs/:playlistId/:songId` | The audio file for one song, for example `/songs/soft-focus/001`. |
| `GET /credits` | Credits for every song. |
| `GET /credits/:playlistId` | Credits for one playlist. |
| `GET /credits/:playlistId/:songId` | Credits for one song. |

## Music and credits

The music comes from Purrple Cat, Chris Zabriskie, and Freesound contributors, under Creative Commons licenses.
The licenses require credit for the artists, so the credits must stay visible in the app.
