import { useEffect, useState, useCallback, useRef } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import useLocalStorageState from "./useLocalStorageState";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const useAuth = () => {
  const [token, setToken] = useLocalStorageState("token", null);
  const tokenRef = useRef<String | null>(token);
  const [isUserLogged, setIsUserLogged] = useState(() => {
    let token = localStorage.getItem("token");
    return token != null; 
  });

  useEffect(() => {
    const unlisten = listen<LoadedPayload>('loaded', (event) => {
      console.log(`app is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`);
      setToken(event.payload.access_token);
      tokenRef.current = event.payload.access_token;
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

  return {
    token, 
    isUserLogged, 
    handleLoginSpotify, 
    setToken,
    tokenRef
  };
}

export default useAuth;
