import { useEffect, useState } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import useLocalStorageState from "./useLocalStorageState";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const useAuth = () => {
  const [token, setToken] = useLocalStorageState("token", null);
  const [isUserLogged, setIsUserLogged] = useState(() => {
    let token = localStorage.getItem("token");
    return token != null; 
  });

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

  const handleLoginSpotify = async () => {
    try {
      await invoke("initiate_spotify_auth");
      console.log("spotify login initiated.")
      setIsUserLogged(true);
    } catch (err) {
      console.log("failed to initiate spotify login", err);
    }
  }

  const handleRefreshToken = async () => {
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
      handleRefreshToken()
    }

  }, [])

  return [token, isUserLogged, handleLoginSpotify, handleRefreshToken];
}

export default useAuth;
