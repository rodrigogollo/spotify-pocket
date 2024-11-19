import { useEffect, useState, useRef } from "react";
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import useLocalStorageState from "../useLocalStorageState";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const useAuthProvider = () => {
  const [token, setToken] = useLocalStorageState("token", null);
  const [isUserLogged, setIsUserLogged] = useState(() => Boolean(token));

  useEffect(() => {
    const unlisten = listen<LoadedPayload>('loaded', (event) => {
      console.log(`app is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`);
      setToken(event.payload.access_token);
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
      console.log("New token generated:", newToken);
      setToken(newToken);
      return newToken;
    } catch (err) {
      console.log("Failed to refresh token", err);
      return "";
    }
  }

  return {
    token,
    isUserLogged,
    handleLoginSpotify,
    setToken,
    handleRefreshToken
  }
};

// export default useAuthProvider;
