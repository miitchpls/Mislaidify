const tokenMock = require("./mocks/token.json");
const meMock = require("./mocks/me.json");
const playlistsMock = require("./mocks/playlists.json");
const playlistTracksMock = require("./mocks/playlistTracks.json");
const savedTracksMock = [
  ...require("./mocks/savedTracks/offset_0.json").items,
  ...require("./mocks/savedTracks/offset_20.json").items,
];

const cors = require("cors");
const path = require("path");
const express = require("express");
const app = express();
const v1Router = express.Router();

const corsOptions = {
  origin: ["http://127.0.0.1:4200"],
  optionsSuccessStatus: 200,
  credentials: true,
};

// configuration
app.set("views", "./mock-server/views");
app.set("view engine", "ejs");
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/v1", v1Router);

const ALLOWED_REDIRECT_ORIGINS = ["http://127.0.0.1:4200"];

const delay = (res, data, ms) => setTimeout(() => res.json(data), ms);

const paginate = (req, data) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const items = data.slice(offset, offset + limit);
  const base = `${req.protocol}://${req.get("host")}${req.path}`;
  return {
    items,
    limit,
    offset,
    total: data.length,
    next: offset + limit < data.length ? `${base}?offset=${offset + limit}&limit=${limit}` : null,
    previous: offset > 0 ? `${base}?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
  };
};

// routes
app.get("/authorize", (req, res) => {
  const redirectUri = req.query.redirect_uri;
  try {
    const origin = new URL(redirectUri).origin;
    if (!ALLOWED_REDIRECT_ORIGINS.includes(origin)) {
      return res.status(400).send("Invalid redirect_uri");
    }
  } catch {
    return res.status(400).send("Invalid redirect_uri");
  }
  res.render("authorize", {
    redirectUrl: redirectUri + "?code=M0ck3dC0d3",
    userName: meMock.display_name,
    userAvatar: meMock.images?.[0]?.url,
  });
});
app.post("/api/token", (req, res) => res.json(tokenMock));

v1Router.get("/me", (req, res) => res.json(meMock));
v1Router.get("/me/playlists", (req, res) => delay(res, playlistsMock, 2000));
v1Router.get("/playlists/:playlist_id/tracks", (req, res) => delay(res, playlistTracksMock, 1000));
v1Router.get("/me/tracks", (req, res) => delay(res, paginate(req, savedTracksMock), 200));

const PORT = 8080;
app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`));
