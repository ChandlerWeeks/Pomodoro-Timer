# Pomodoro Timer

A pomodoro timer that plays music from a playlist you pick while the countdown runs.
When the timer ends, the music stops and an alarm plays until you dismiss it.

## Project layout

| Folder | What it is |
| --- | --- |
| `frontend-client/` | The timer app: React, TypeScript, Vite, and Tailwind. |
| `backend/music_api/` | An Express API that serves the playlists, song details, audio, and credits. |

## Running with Docker

From the repository root, using Docker with Compose v2.20 or newer:

```sh
docker compose up --build -d --wait
```

Open http://localhost:5173. The API is at http://localhost:3000/api/playlists.
Both containers have health checks, and the frontend waits for the API to be
ready. Source changes reload automatically. Rebuild after dependency changes.

```sh
docker compose logs -f     # View logs
docker compose down        # Stop the environment
```

### Local music

The API starts with an empty library when `backend/music_api/data/music/` has no
audio. Add music there and it becomes available on the next API request without
a rebuild or restart. Reload the page to update the playlist selector. A
subfolder becomes a playlist; files directly in `music/` use `library`:

```text
backend/music_api/data/music/
  soft-focus/
    001 - First Track.mp3
    002 - Second Track.mp3
```

Removing audio removes it from the library. Existing `data/playlist.json` and
`data/catalog.json` metadata is optional and retains playlist order, titles,
durations, and attribution. The array catalog at `data/music/catalog.json`
produced by the dev data script is also supported. Without metadata, IDs and
titles come from filenames, and durations are zero (unknown). Keep the required
artist credits alongside any Creative Commons music.

Music and metadata stay out of Git and Docker images. The data directory is
mounted read-only in the API container. To use another data folder:

```sh
MUSIC_DATA_DIR=/absolute/path/to/data docker compose up --build -d --wait
```

These containers provide a local development environment with live reload.

## Deployment

The live site at **https://usefocal.net** uses the production stack and automatic
deployment described in [deploy/README.md](deploy/README.md). Pushes to `main`
are built and tested in GitHub Actions before this machine applies them.

The instructions below describe the development stack and SSH access to it.

The supplied Compose configuration runs Vite's development server and Node's
watch mode. Both ports bind to `127.0.0.1` on the Docker host. Use this setup on
your own machine or access a remote host through the SSH tunnel below. Public
production hosting requires the changes described at the end of this section.

### Prepare and start the host

Install Docker with Compose v2.20 or newer, then copy or clone this repository
onto the host. Run all commands below from the repository root. Node and npm
are installed inside the images; they do not need to be installed on the host.

Create the music directory, even if you have no music yet:

```sh
mkdir -p backend/music_api/data/music
docker compose config --quiet
docker compose up --build -d --wait
docker compose ps
```

Both services should report `healthy`. If startup fails, inspect their logs:

```sh
docker compose logs --tail=100 backend frontend
```

The first build downloads the base images and npm packages. Later builds reuse
cached layers. Keep the checkout on the host: Compose mounts source files from
it into the containers.

### Store music outside the checkout

To keep the library separate from application updates, create a data directory
on the Docker host, such as `/srv/pomodoro/data`, with a `music/` subfolder.
The directory must exist and its files must be readable by the container's
`node` user (UID 1000). In a `.env` file at the repository root, set:

```dotenv
MUSIC_DATA_DIR=/srv/pomodoro/data
```

Then run `docker compose up --build -d --wait` again to apply the mount. Put
audio under `/srv/pomodoro/data/music/`, optional `playlist.json` and
`catalog.json` under `/srv/pomodoro/data/`, or the dev script's array catalog
under `/srv/pomodoro/data/music/catalog.json`.

The API mounts this directory read-only. Add or remove music on the host; the
next API request reflects the change. Refresh the app to update its playlist
selector. An empty library is valid and does not prevent startup. Keep the
same `.env` setting for future Compose commands so they use the same library.

### Access a remote host

On your own computer, replace `user@your-server` with the host's SSH login:

```sh
ssh -N -L 5173:127.0.0.1:5173 -L 3000:127.0.0.1:3000 user@your-server
```

Keep that connection open and visit http://localhost:5173 on your computer.
Forward both ports because the frontend currently requests the API and audio
at `http://localhost:3000` from your browser.

### Update, stop, and restart

After copying updated source files to the host or pulling your deployment
branch, rebuild and apply the update:

```sh
docker compose up --build -d --wait
docker compose ps
```

Use `docker compose restart` to restart existing containers. To stop and remove
the containers and their network, run `docker compose down`. Start them again
with `docker compose up -d --wait`. Host music files survive all of these
commands; back up the data directory separately from the repository.

The current configuration has no automatic restart policy. After a Docker
daemon or host restart, run the startup command again.

### Public production hosting

Before deploying at a public domain, the application needs these changes:

- Build the frontend with `npm run build` and serve `frontend-client/dist/`
  with a production web server in place of the Vite development server.
- Replace the hardcoded `http://localhost:3000` URLs in the frontend with a
  configurable API address or same-origin `/api` URLs. For same-origin URLs,
  configure the web server to proxy `/api` to the backend service on port 3000,
  including audio requests.
- Configure HTTPS for the public domain, run the backend with `npm start` and
  `NODE_ENV=production`, and remove the source bind mounts used for live reload.
- Configure container restart policies for host reboots, while preserving the
  read-only music data mount and backing up its host directory.

## Running without Docker

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
