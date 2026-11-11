const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { getLibrary } = require("../lib/library.js");

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pomodoro-library-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const write = (filename, contents = "test audio") => {
    const target = path.join(directory, filename);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, typeof contents === "object" ? JSON.stringify(contents) : contents);
  };
  return { directory, write };
}

test("missing and empty music directories return an empty library", t => {
  const { directory, write } = fixture(t);
  assert.deepEqual(getLibrary(directory), { playlists: [], songs: {} });
  write("music/.gitkeep", "");
  write("playlist.json", [{ id: "missing", tracks: ["001"] }]);
  assert.deepEqual(getLibrary(directory), { playlists: [], songs: {} });
});

test("music added and removed is reflected on the next read", t => {
  const { directory, write } = fixture(t);
  write("music/soft-focus/001 - First Track.mp3");
  write("music/soft-focus/002 - Second Track.OGG");
  write("music/soft-focus/notes.txt");
  let library = getLibrary(directory);
  assert.equal(library.playlists.length, 1);
  assert.equal(library.playlists[0].id, "soft-focus");
  assert.deepEqual(library.playlists[0].tracks, ["001", "002"]);
  assert.equal(library.songs["soft-focus-001"].title, "First Track");
  fs.unlinkSync(path.join(directory, "music/soft-focus/001 - First Track.mp3"));
  library = getLibrary(directory);
  assert.deepEqual(library.playlists[0].tracks, ["002"]);
  assert.equal(library.songs["soft-focus-001"], undefined);
});

test("existing metadata preserves playlist order, duration, and attribution for available files", t => {
  const { directory, write } = fixture(t);
  write("music/soft-focus/001.mp3");
  write("music/soft-focus/002.mp3");
  write("playlist.json", [{ id: "soft-focus", tracks: ["002", "003", "001"] }]);
  write("catalog.json", {
    "soft-focus-001": { path: "soft-focus/001.mp3", title: "First", duration_seconds: 15, attribution: { license: "CC BY" } },
    "soft-focus-002": { path: "soft-focus/002.mp3", title: "Second", duration_seconds: 20 },
    "soft-focus-003": { path: "soft-focus/missing.mp3", title: "Missing" },
  });
  const library = getLibrary(directory);
  assert.deepEqual(library.playlists[0].tracks, ["002", "001"]);
  assert.equal(library.playlists[0].duration_seconds, 35);
  assert.equal(library.playlists[0].track_count, 2);
  assert.equal(library.songs["soft-focus-001"].attribution.license, "CC BY");
});

test("music/catalog.json supports the dev data script's array catalog", t => {
  const { directory, write } = fixture(t);
  write("music/focus/001 - Track.wav");
  write("music/catalog.json", [{ theme: "focus", path: "focus/001 - Track.wav", title: "Catalog title", artist: "Artist" }]);
  const library = getLibrary(directory);
  assert.equal(library.songs["focus-001"].title, "Catalog title");
  assert.equal(library.songs["focus-001"].artist, "Artist");
});

test("loose files form a library playlist and symlinks are ignored", t => {
  const { directory, write } = fixture(t);
  write("music/Track.mp3");
  write("outside.mp3");
  fs.symlinkSync(path.join(directory, "outside.mp3"), path.join(directory, "music/link.mp3"));
  const library = getLibrary(directory);
  assert.deepEqual(library.playlists[0].tracks, ["track"]);
  assert.equal(library.songs["library-track"].path, "Track.mp3");
});
