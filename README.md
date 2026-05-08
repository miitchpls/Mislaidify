# Mislaidify

> Listen. Save. Organize. Repeat.

Mislaidify is a web app that checks which of your saved Spotify songs are not in any of your playlists.

Ever find a song while driving, save it to your library, and then forget to add it to the right playlist? Mislaidify solves exactly that — it scans your Spotify saved songs and surfaces the ones that haven't made it into any playlist yet.

Built with Angular 19 and Tailwind CSS.

## Getting started

Install dependencies:

```bash
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Starts the Angular dev server at `http://localhost:4200` |
| `npm run build` | Builds the app for production |
| `npm run watch` | Builds in watch mode (development) |
| `npm test` | Runs unit tests (single run) |
| `npm run test:watch` | Runs unit tests in watch mode |
| `npm run test:coverage` | Runs unit tests with coverage report |

## Development

The app authenticates directly against the Spotify OAuth flow. On first load, the user is redirected to Spotify to authorize the app. After authorization, the SDK stores the access token locally and the dashboard loads the user's playlists and saved tracks.

Spotify OAuth requires the redirect URI to be registered in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
