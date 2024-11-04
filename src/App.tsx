import { useEffect, useState } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import SpotifyPlayer from "./SpotifyPlayer";
import useLocalStorageState from "./hooks/useLocalStorageState";
import SongList from "./containers/SongList";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const loginSpotify = async () => {
  try {
    await invoke("initiate_spotify_auth");
    console.log("spotify login initiated.")
  } catch (err) {
    console.log("failed to initiate spotify login", err);
  }
}

function App() {
  const [token, setToken] = useLocalStorageState("token", null);
  const [songs, setSongs] = useState(null);

  const [isUserLogged, setIsUserLogged] = useState(() => {
    let token = localStorage.getItem("token");
    return token != null; 
  });

  const refreshToken = async () => {
    try {
      const newToken = await invoke<string>("refresh_token");
      console.log("new token generated", newToken);
      setToken(newToken);
      localStorage.setItem("token", newToken);
      setIsUserLogged(true);
    } catch (err) {
      console.log("Failed to refresh token", err);
      setToken(""); // reset token to show login page
      localStorage.setItem("token", "");
    }
  }

  useEffect(() => {
    if (token !== null) {
      refreshToken()
    }

  }, [])
  
  useEffect(() => {
    const unlisten = listen<LoadedPayload>('loaded', (event) => {
      console.log(`app is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`);

      setToken(event.payload.access_token);
      localStorage.setItem("token", event.payload.access_token);
      setIsUserLogged(true);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

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

    await invoke<string>("set_playback", {
      accessToken: token, 
      uris: uris,
      offset: offset,
    });
  }

  return (
    <div>
      {
        isUserLogged ? 
          <SpotifyPlayer refreshToken={refreshToken} token={token} /> : 
          <button id="login" onClick={loginSpotify}>Login</button>
      }
      <button onClick={getSongs}>Get songs</button>
      {songs && <SongList songs={songs} setSong={setSong} /> }
      <button onClick={setSong} uri="spotify:track:0YThXX1dqUpYBLyJNAsF9N">Teste set song</button>
    </div>
  );
}

export default App;
