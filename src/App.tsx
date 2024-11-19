import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";
import useSpotifyPlayerProvider from "./hooks/useSpotifyPlayerProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./containers/LoginPage";
import HomePage from "./containers/HomePage/HomePage";
import PlaylistsPage from "./containers/PlaylistsPage/PlaylistsPage";
import Player from "./components/Player/Player";
import Navbar from "./components/Navbar/Navbar";
import { useAuthStore } from "./stores/authStore";
import { useSpotifyStore } from "./stores/spotifyStore";
import { useEffect } from "react";
import { Spotify as SpotifyPlayer } from "./components/Spotify/Spotify";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  }
})

const App = () => {
  useEffect(() => {
    const unlisten = useAuthStore.getState().initialize();
    // const cleanup = useSpotifyStore.getState().initialize();
    // const cleanupSeek = useSpotifyStore.getState().manageSeekInterval();
    return () => {
      unlisten.then(f => f());
      // cleanup?.();
      // cleanupSeek?.();
    };
  }, []);

  const isPlayerReady = useSpotifyStore((state) => state.isPlayerReady);
  const isUserLogged = useAuthStore.getState().isUserLogged;
  const token = useAuthStore.getState().token;
  console.log("token", token);
  if (!isUserLogged) return <LoginPage />

  return (
    <QueryClientProvider client={queryClient}>
      <SpotifyPlayer />
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
        </Routes>
        {isPlayerReady && <Player />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
