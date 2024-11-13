import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";
import useSpotifyPlayerProvider from "./hooks/useSpotifyPlayerProvider";
import useAuth from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./containers/LoginPage";
import HomePage from "./containers/HomePage/HomePage";
import Navbar from "./components/Navbar/Navbar";
import PlaylistsPage from "./containers/PlaylistsPage/PlaylistsPage";
import Player from "./components/Player/Player";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  }
})

const App = () => {
  const { isUserLogged } = useAuth();
  const playbackPlayerHook = useSpotifyPlayerProvider();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SpotifyPlayerContext.Provider value={playbackPlayerHook}>
          {isUserLogged ? <Navbar /> : <LoginPage /> }
          {
          <div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
            </Routes>
          </div>
          }
          <Player />
        </SpotifyPlayerContext.Provider>
      </QueryClientProvider>
    </ BrowserRouter>
  );
}

export default App;
