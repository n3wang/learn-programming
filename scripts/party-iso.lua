-- Export the 64×64 party art: one PNG per row of assets/asetsprite/party_64.csv.
-- Run with `npm run party-iso` (needs Aseprite; set ASEPRITE to its path if it
-- is not in Program Files). Frame N (1-based, as Aseprite shows it) is saved
-- to static/img/party/iso/<name>.png at its native 64 px, untrimmed, so tiles
-- and buildings line up on the same grid.
local root = app.params["root"] or "."
local fs = app.fs
local csvPath = fs.joinPath(root, "assets", "asetsprite", "party_64.csv")
local spr = app.open(fs.joinPath(root, "assets", "asetsprite", "64x64_party.aseprite"))
if not spr then error("cannot open 64x64_party.aseprite") end

local made = 0
local first = true
for line in io.lines(csvPath) do
  if first then
    first = false
  else
    local frame, name = line:match("^(%d+),([^,]+),")
    if frame and name then
      local n = tonumber(frame)
      if n > #spr.frames then error(name .. ": frame " .. n .. " is past the last frame (" .. #spr.frames .. ")") end
      local out = fs.joinPath(root, "static", "img", "party", "iso", name .. ".png")
      fs.makeAllDirectories(fs.filePath(out))
      local img = Image(spr.spec)
      img:drawSprite(spr, n)
      img:saveAs(out)
      made = made + 1
    end
  end
end
print("party-iso: wrote " .. made .. " images to static/img/party/iso/")
