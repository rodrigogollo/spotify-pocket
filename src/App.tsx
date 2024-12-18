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
import PlaylistSongList from "./containers/PlaylistSongList/PlaylistSongList";
import SearchPage from "./containers/SearchPage/SearchPage";
import ChartPage from "./containers/ChartPage/ChartPage";

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
  const isUserLogged = useAuthStore((state) => state.isUserLogged);

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
            <Route path="/playlist/:playlistId" element={<PlaylistSongList />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/chart" element={<ChartPage />} />
          </Routes>
          {isPlayerReady && <Player />}
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
