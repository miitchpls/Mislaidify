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
| `npm start` | Runs the Angular dev server alongside the mock server (uses `nodemon`) |
| `npm run start:prod` | Runs the Angular dev server in production configuration |
| `npm run build` | Builds the app for production |
| `npm run watch` | Builds in watch mode (development) |
| `npm test` | Runs unit tests headlessly (single run) |
| `npm run test:debug` | Runs unit tests with Chrome debugger |

## Development

The `npm start` command spins up two processes concurrently:
- **Mock server** — Express server (`mock-server/index.js`) for local development without hitting the real Spotify API
- **Angular dev server** — served at `http://localhost:4200`

For production, the app authenticates via Spotify OAuth directly from the hero page.
