# Spotify-lite (Winamp alike)

## Tools:
- Rust (back-end) 
    - Tauri 2.0
    - Reqwest
    - Axum
    - Tokio
 
- React (front-end)
    - Typescript
    - Spotify API
    - Spotify SDK

## TODOS:
[X] - Spotify Authentication (API).
[X] - Spotify Player (SDK).
[X] - Spotify auto connect to device.
[X] - Spotify Auto refresh token.
[~] - Frontend loading screen (wait for Auth + Connect Device).
[X] - Get Liked Songs (top 50 working).
[X] - List Liked Songs (Test showing top 50 working).
[X] - Play/Pause/Next/Prev buttons.
[X] - Volume slider.
[X] - Song timestamp slider.
[X] - On click set specific song.
[X] - Refactor Spotify Playback SDK to global state (useContext).
[X] - On token expired refresh token automatically.
[X] - Refactor get songs to use React Query.
[~] - Refactor react code (organize in components/containers).
[X] - Refactor Player Controls design.
[X] - Refactor List Songs design.
[X] - On Scroll down request + 50 songs.
[X] - Add repeat button.
[X] - Add shuffle button.
[ ] - Make proper Loading component for multiple uses (animation spinning);

## Later TODOS:
[ ] - New Tab (Playlists) React Router maybe. 
[ ] - Search button (search inside liked songs).
[ ] - Select playlist to play.
[ ] - Search albums/songs/playlists/podcasts.
[ ] - Play specific searched albums/songs/playlists/podcasts.
[ ] - Add song to liked/playlist.
[ ] - Remove song to liked/playlist.

