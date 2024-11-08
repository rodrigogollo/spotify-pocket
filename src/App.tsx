import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";
import useSpotifyPlayerProvider from "./hooks/useSpotifyPlayerProvider";
import useAuth from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Player from "./components/Player/Player";
import SongList from "./containers/SongList/SongList";
import LoginPage from "./containers/LoginPage";

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
          <h1> Spotify-Lite Gollo </h1>
          <Link to={"/songs"}>List Songs</Link>
          <Link to={"/"}>Home</Link>
          {isUserLogged ? <Player /> : <LoginPage />}
          <Routes>
            <Route path="/" element={isUserLogged ? <Player /> : <LoginPage />} />
            <Route path="/songs" element={<SongList />} />
          </Routes>
        </SpotifyPlayerContext.Provider>
      </QueryClientProvider>
    </ BrowserRouter>
  );
}

export default App;
// <SpotifyPlayer handleRefreshToken={handleRefreshToken} token={token} />  
// <SongList /> 
