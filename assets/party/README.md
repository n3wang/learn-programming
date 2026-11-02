# Party game sprite sheets

Source art for the `/party` games. Sheets live here (not in `static/`, so the
big originals are not published); the slicer cuts them into the single images
the games load.

1. Put a sheet in `sheets/` (PNG, JPEG or WebP).
2. Add it under `"sheets"` in `sprites.json`, then one entry per sprite:
   `{"sheet": "<id>", "name": "…", "out": "<game>/<file>.webp", "rect": [x, y, width, height]}`.
   `out` is the path the game passes to `core/Sprite.js` (e.g. Power Grab asks
   for `powergrab/role-<role>.webp` and `powergrab/card-back.webp`).
3. Run `npm run party-sprites` (needs ImageMagick 7, `magick`). Exports land in
   `static/img/party/<out>`. `npm run party-sprites -- --check` lists missing or
   stale ones.

Until an export exists, `Sprite` draws a tinted placeholder with the emoji and
label, so a game can ship before its art does.

## Folders of single images (`"sets"`)

When the art already comes one file per sprite, put the files in a folder and
add a set instead of a sheet:
`"<id>": {"dir": "<folder>", "size": 256, "out": "<game>/role-{name}.webp"}`.
Every image in the folder is resized to fit `size` px and written to `out`,
with `{name}` replaced by the file name. `--sheet <id>` runs one set.

- `clocktower/`: the 106 Blood on the Clocktower character icons the game uses,
  one per key in `src/components/party/games/clocktower/roles.js`. Art by
  Aidan Roberts, © The Pandemonium Institute, downloaded from
  wiki.bloodontheclocktower.com (`Icon_<key>.png`), used with the owner’s
  permission as stated by the site owner. To refresh one, replace
  `clocktower/<key>.png` and rerun `npm run party-sprites -- --sheet clocktower-icons`.
