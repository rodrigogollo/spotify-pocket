import "./HomePage.css";
import Player from "../../components/Player/Player";
import SongList from "../SongList/SongList";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import Loading from "../../components/Loading/Loading";
import Navbar from "../../components/Navbar/Navbar";

const HomePage = () => {
  const { isPlayerReady } = useSpotifyPlayerContext();
    return ( 
      <>
        { !isPlayerReady ? 
          <Loading /> : 
          <div className="home">
            <SongList />
            <Player />
          </div>
        }
    </>
  )
}

export default HomePage;
