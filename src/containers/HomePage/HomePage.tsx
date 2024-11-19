import "./HomePage.css";
import SongList from "../SongList/SongList";
import Loading from "../../components/Loading/Loading";
import { useSpotifyStore } from "../../stores/spotifyStore";

const HomePage = () => {
  const isPlayerReady = useSpotifyStore((state) => state.isPlayerReady);
    return ( 
      <>
        { !isPlayerReady ? 
          <Loading /> : 
          <div className="home">
            <SongList />
          </div>
        }
    </>
  )
}

export default HomePage;
