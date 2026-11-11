const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const audioExtensions = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".webm", ".opus"]);

function readJSON(filename, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function scanMusic(directory, relative = "") {
  let entries;
  try {
    entries = fs.readdirSync(path.join(directory, relative), { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const filename = path.join(relative, entry.name);
    if (entry.isDirectory()) return scanMusic(directory, filename);
    // Ignore symlinks so catalog paths cannot expose files outside the music folder.
    return entry.isFile() && audioExtensions.has(path.extname(entry.name).toLowerCase())
      ? [filename] : [];
  });
}

const slug = value => value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 10);

// Read on each request so adding/removing local music needs no restart.
function getLibrary(dataDirectory = path.join(__dirname, "..", "data")) {
  const musicDirectory = path.join(dataDirectory, "music");
  const files = scanMusic(musicDirectory);
  if (!files.length) return { playlists: [], songs: {} };

  const declaredPlaylists = readJSON(path.join(dataDirectory, "playlist.json"), []);
  const catalog = readJSON(path.join(dataDirectory, "catalog.json"), {});
  const musicCatalog = readJSON(path.join(musicDirectory, "catalog.json"), []);
  const metadataByPath = new Map();
  for (const source of [musicCatalog, catalog]) {
    for (const [key, song] of Object.entries(source)) {
      if (!song || typeof song.path !== "string") continue;
      const declared = declaredPlaylists.find(playlist =>
        (playlist.tracks || []).some(id => `${playlist.id}-${id}` === key));
      const id = declared ? String(declared.tracks.find(id => `${declared.id}-${id}` === key)) : song.id;
      metadataByPath.set(path.normalize(song.path), {
        ...song,
        id,
        playlist: declared?.id || song.playlist || song.theme,
      });
    }
  }

  const songs = {};
  const groups = new Map();
  for (const filename of files) {
    const metadata = metadataByPath.get(filename) || {};
    const stem = path.basename(filename, path.extname(filename));
    const numbered = stem.match(/^(\d+)\s*-\s*(.+)$/);
    const folder = filename.includes(path.sep) ? filename.split(path.sep)[0] : "library";
    const playlist = String(metadata.playlist || slug(folder) || hash(folder));
    let id = String(metadata.id ?? (numbered ? numbered[1] : slug(stem) || hash(filename)));
    if (songs[`${playlist}-${id}`]) id += `-${hash(filename)}`;
    const song = {
      ...metadata,
      id,
      playlist,
      title: metadata.title || (numbered ? numbered[2] : stem),
      duration_seconds: Number(metadata.duration_seconds) || 0,
      path: filename,
    };
    songs[`${playlist}-${id}`] = song;
    if (!groups.has(playlist)) groups.set(playlist, []);
    groups.get(playlist).push(id);
  }

  const ids = [...new Set([...declaredPlaylists.map(p => p.id), ...groups.keys()])];
  const playlists = ids.filter(id => groups.has(id)).map(id => {
    const declared = declaredPlaylists.find(p => p.id === id);
    const available = groups.get(id);
    const tracks = [...new Set([...(declared?.tracks || []).map(String), ...available])]
      .filter(track => available.includes(track));
    return {
      ...declared,
      id,
      tracks,
      track_count: tracks.length,
      duration_seconds: tracks.reduce((sum, track) => sum + songs[`${id}-${track}`].duration_seconds, 0),
    };
  });
  return { playlists, songs };
}

module.exports = { getLibrary };
