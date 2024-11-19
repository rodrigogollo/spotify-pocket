import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import "./Player.css";
import ScrollingText from "../ScrollingText/ScrollingText";
import Controller from "../Controller/Controller";
import { useSpotifyStore } from "../../stores/spotifyStore";

const Player = () => {
  const currentTrack = useSpotifyStore((state) => state.currentTrack)

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
