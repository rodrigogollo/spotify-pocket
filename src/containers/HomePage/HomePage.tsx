import Player from "../../components/Player/Player";
import SongList from "../SongList/SongList";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import Loading from "../../components/Loading/Loading";

const HomePage = () => {
  const { isPlayerReady } = useSpotifyPlayerContext();
  if (!isPlayerReady) {
    return <Loading />
  } else  {
    return <>
      <Player />
      <SongList />
    </>
  }
}

export default HomePage;
