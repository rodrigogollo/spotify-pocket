import "./App.css";
import SpotifyPlayer from "./SpotifyPlayer";
import SongList from "./containers/SongList";
import useAuth from "./hooks/useAuth";
import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";
import useSpotifyPlayerProvider from "./hooks/useSpotifyPlayerProvider";
import Player from "./components/Player/Player";

// cache for song list (so i wont need to request again the top 50 songs (offset =0) for example
// use react Query from tanstack
// const localCache = {};

function App() {
  const { isUserLogged, handleLoginSpotify } = useAuth();
  const playbackPlayerHook = useSpotifyPlayerProvider();

  return (
    <SpotifyPlayerContext.Provider value={playbackPlayerHook}>
      <div>
        {
          isUserLogged ? 
            <>
              <Player />
            </> :
            <button id="login" onClick={handleLoginSpotify}>Login</button>
        }
      </div>
    </SpotifyPlayerContext.Provider>
  );
}

export default App;
// <SpotifyPlayer handleRefreshToken={handleRefreshToken} token={token} />  
// <SongList /> 
