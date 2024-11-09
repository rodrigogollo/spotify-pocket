import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";
import useSpotifyPlayerProvider from "./hooks/useSpotifyPlayerProvider";
import useAuth from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./containers/LoginPage";
import HomePage from "./containers/HomePage/HomePage";
import Loading from "./components/Loading/Loading";

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
          <Routes>
            <Route path="/" element={isUserLogged ? <HomePage /> : <LoginPage />} />
          </Routes>
        </SpotifyPlayerContext.Provider>
      </QueryClientProvider>
    </ BrowserRouter>
  );
}

export default App;
