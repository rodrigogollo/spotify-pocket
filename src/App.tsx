import { useEffect, useState } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import SpotifyPlayer from "./Spotify";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

async function loginSpotify() {
  invoke("initiate_spotify_auth")
    .then(() => console.log("spotify login initiated."))
    .catch((error) => console.log("failed to initiate spotify login", error));
}

function App() {
  const [token, setToken] = useState<string>("");
  const [isUserLogged, setIsUserLogged] = useState(() => {
    let token = localStorage.getItem("token");
    return token != null; 
  });

  // useEffect(() => {
  //   let token = localStorage.getItem("token");
  //   console.log("get token local storage", token);
  //   if (token != null) {
  //     setToken(token);
  //   }
  // }, []);

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

  return (
    <div className="container">
      { !isUserLogged && <button id="login" onClick={loginSpotify}>Login</button> }
      {
        isUserLogged && 
          (<SpotifyPlayer token={token} />)
      }
    </div>
  );
}

export default App;
