# Mislaidify

> Listen. Save. Organize. Repeat.

Mislaidify is a web app that checks which of your saved Spotify songs are not in any of your playlists.

The idea came from a personal habit: finding great songs while driving, saving them to Spotify, and then never getting around to organizing them into playlists. Over time they'd just pile up — forgotten somewhere in a library of over 8000 saved tracks. Mislaidify solves exactly that: it scans your saved songs and surfaces the ones that haven't been added to any playlist yet, so nothing gets lost in the pile.

Built with Angular 19 and Tailwind CSS.

## Project history

Originally started in May 2024, this project was refactored in May 2026.

This app will not be publicly released. Since Spotify restricted their API access to organizations only, individual developers can no longer publish apps to production using the Spotify API.

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

## Roadmap

- **Mobile UX**: The dashboard is desktop-first with two side-by-side columns. On mobile, the plan would be to switch to a tab-based navigation: a first tab to select playlists, a second tab to browse mislaid tracks. On desktop the layout remains unchanged. This is currently low priority — since the app won't be publicly released, the only likely users are technical people running it locally, almost certainly on desktop.
- Replace scrollbars with fade on items into view while scrolling
- Possibility to create a new playlist when selecting where to add selected songs
