import Player from "../../components/Player/Player";
import SongList from "../SongList/SongList";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";

const HomePage = () => {
  const { isPlayerReady } = useSpotifyPlayerContext();
  if (!isPlayerReady) {
    return <p>Loading...</p>
  } else  {
    return <>
      <Player />
      <SongList />
    </>
  }
}

export default HomePage;
