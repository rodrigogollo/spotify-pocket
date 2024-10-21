import { useEffect, useState } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import SpotifyPlayer from "./Spotify";
// import useAuth from "./hooks/useAuth";

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
  // const token = useAuth();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  })
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
    const refreshToken = () => {
      invoke<string>("refresh_token")
        .then((newToken: string) => {
          console.log("new token generated", newToken);
          setToken(newToken);
        })
        .catch((error) => {
          console.log("failed to refresh token", error)
          setToken(""); // reset token to show login page
        })
    }
    
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
