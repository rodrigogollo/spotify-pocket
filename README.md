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
- [x] Spotify Authentication (API).
- [x] Spotify Player (SDK).
- [x] Spotify auto connect to device.
- [x] Spotify Auto refresh token.
- [x] Frontend loading screen (wait for Auth + Connect Device).
- [x] Get Liked Songs (top 50 working).
- [x] List Liked Songs (Test showing top 50 working).
- [x] Play/Pause/Next/Prev buttons.
- [x] Volume slider.
- [x] Song timestamp slider.
- [x] On click set specific song.
- [x] Refactor Spotify Playback SDK to global state (useContext).
- [x] On token expired refresh token automatically.
- [x] Refactor get songs to use React Query.
- [x] Refactor react code (organize in components/containers).
- [x] Refactor Player Controls design.
- [x] Refactor List Songs design.
- [x] On Scroll down request + 50 songs.
- [x] Add repeat button.
- [x] Add shuffle button.
- [x] Make proper Loading component for multiple uses (animation spinning);
- [x] Create navbar
- [ ] Fix on user not logged, render only login page.
- [ ] Fix TypeScript/Rust errors for build.
- [ ] Organize Rust functions.
- [x] New Tab (Playlists) React Router maybe. 
- [x] Search User's Playlists.
- [ ] Search button (search inside liked songs).
- [ ] Select playlist to play.
- [ ] Search albums/songs/playlists/podcasts.
- [ ] Play specific searched albums/songs/playlists/podcasts.
- [ ] Add song to liked/playlist.
- [ ] Remove song to liked/playlist.
- [ ] check songs that don't get active for some uri reason (childish gambino - me and your mama)
- [ ] Log off button
- [ ] Dark/Light mode
- [ ] Custom Themes
- [ ] User Options?


