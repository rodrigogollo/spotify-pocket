import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import "./Player.css";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import ScrollingText from "../ScrollingText/ScrollingText";
import Controller from "../Controller/Controller";

const Player = () => {
  const { currentTrack } = useSpotifyPlayerContext();

  return (
    <div className="player">
      <div className="track-container"> 
        <ScrollingText text={currentTrack} className={"current-track"} />
      </div>
      <div className="times">
        <Seek />
        <Volume />
      </div>
      <Controller />
    </div>
  )
}

export default Player;
