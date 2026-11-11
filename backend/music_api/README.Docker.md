# API development container

From the repository root, run `docker compose up --build -d --wait` to start
both services. The API is available at http://localhost:3000/api/playlists.

To start only the API, run `docker compose up --build -d --wait` in this folder.
Node's watch mode restarts it when server.js, controllers, or routes change.
After changing package.json or package-lock.json, run the build command again.

The API starts with an empty library when `data/music/` has no audio. Add files
to that folder and they appear on the next API request without a rebuild or
restart. Subfolders become playlists; loose audio files use the `library`
playlist. Removing files removes them from the library, too.

Existing `data/playlist.json` and `data/catalog.json` metadata is optional and
preserves titles, track IDs, ordering, durations, and credits. The array catalog
in `data/music/catalog.json` from `bin/pull-dev-data.sh` is supported as well.
Without metadata, titles and IDs come from filenames, and durations are zero
(unknown). Files named `001 - Track Name.mp3` use track ID `001`.

The data folder is mounted read-only and excluded from the image. To use another
folder containing `music/` and optional metadata:

```sh
MUSIC_DATA_DIR=/absolute/path/to/data docker compose up --build -d --wait
```
