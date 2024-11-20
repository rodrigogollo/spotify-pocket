import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./containers/LoginPage/LoginPage";
import HomePage from "./containers/HomePage/HomePage";
import PlaylistsPage from "./containers/PlaylistsPage/PlaylistsPage";
import Player from "./containers/Player/Player";
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
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const isPlayerReady = useSpotifyStore((state) => state.isPlayerReady);
  const isUserLogged = useAuthStore.getState().isUserLogged;
  const token = useAuthStore.getState().token;
  console.log("token", token);
  if (!isUserLogged) return <LoginPage />

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
