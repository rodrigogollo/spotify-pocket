import { useState } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import SpotifyPlayer from "./SpotifyPlayer";
import SongList from "./containers/SongList";
import useAuth from "./hooks/useAuth";

// cache for song list (so i wont need to request again the top 50 songs (offset =0) for example
// use react Query from tanstack
const localCache = {};

function App() {
  const [songs, setSongs] = useState(null);

  const [token, isUserLogged, handleLoginSpotify, handleRefreshToken] = useAuth();


  const getSongs = async () => {
    const response = await invoke<string>("get_user_saved_tracks", { accessToken: token });

    localStorage.setItem("songs", response);

    const songs = JSON.parse(response);
    const transformedSongs = songs.items.map((song: any) => {
      return {
        id: song.track.id,
        name: song.track.name,
        artist: song.track.artists[0].name,
        uri: song.track.uri
      }
    });
    
    setSongs(transformedSongs);
    console.log(songs);
    // for (let song of songs.items) {
    //   console.log(song.track.artists[0].name + "-" + song.track.name);
    // }
  }

  const setSong = async (uri) => {
    const uris = songs.map(song => song.uri)
    const offset = uris.indexOf(uri);
    console.log(offset);

    const isChanged = await invoke<string>("set_playback", {
      accessToken: token, 
      uris: uris,
      offset: offset,
    });
    if (isChanged) {
      console.log("song changed");
    } else {
      console.log("Failed to change song");
    }
  }

  return (
    <div>
      {
        isUserLogged ? 
          <SpotifyPlayer handleRefreshToken={handleRefreshToken} token={token} /> : 
          <button id="login" onClick={handleLoginSpotify}>Login</button>
      }
      <button onClick={getSongs}>Get songs</button>
      {songs && <SongList songs={songs} setSong={setSong} /> }
    </div>
  );
}

export default App;
