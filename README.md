# Spotify-lite (Winamp alike)

Spotify minimalist player.

![Spotify-lite](./spotify-lite.png)

This app idea came to me after getting annoyed with the original Spotify App, which is slow and renders too many useless things on the screen. When I was younger I used Winamp, which was a simple app that shown our songs and played it. 

Also I used this app to improve my skills in Rust and React. 



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
    - React Query (TanStack)

## TODOS:
[X] - Spotify Authentication (API).
[X] - Spotify Player (SDK).
[X] - Spotify auto connect to device.
[X] - Spotify Auto refresh token.
[X] - Frontend loading screen (wait for Auth + Connect Device).
[X] - Get Liked Songs (top 50 working).
[X] - List Liked Songs (Test showing top 50 working).
[X] - Play/Pause/Next/Prev buttons.
[X] - Volume slider.
[X] - Song timestamp slider.
[X] - On click set specific song.
[X] - Refactor Spotify Playback SDK to global state (useContext).
[X] - On token expired refresh token automatically.
[X] - Refactor get songs to use React Query.
[X] - Refactor react code (organize in components/containers).
[X] - Refactor Player Controls design.
[X] - Refactor List Songs design.
[X] - On Scroll down request + 50 songs.
[X] - Add repeat button.
[X] - Add shuffle button.
[X] - Make proper Loading component for multiple uses (animation spinning);

## Later TODOS:
[X] - Create navbar
[ ] - New Tab (Playlists) React Router maybe. 
[ ] - Search button (search inside liked songs).
[ ] - Select playlist to play.
[ ] - Search albums/songs/playlists/podcasts.
[ ] - Play specific searched albums/songs/playlists/podcasts.
[ ] - Add song to liked/playlist.
[ ] - Remove song to liked/playlist.
[ ] - check songs that don't get active for some uri reason (childish gambino - me and your mama)
