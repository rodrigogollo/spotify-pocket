import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import "./Player.css";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import useAuth from "../../hooks/useAuth";

const Player = () => {
  const { isPlaying,  currentTrack, player, setSeek, isPlayerReady} = useSpotifyPlayerContext()
  const { isUserLogged } = useAuth()

  const handleToggle = async () => {
    try {
      if (player) {
        await player.togglePlay();
      }
    } catch (err) {
      console.log("erro toggle", err);
    }
  };

  const handleNext = async () => {
    if (player) {
      try {
        await player?.nextTrack();
      } catch (err) {
        console.log("error next", err);
      }
    }
  };

  const handlePrev = async () => {
    if (player) {
      try {
        await player?.previousTrack();
        setSeek(0);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    isPlayerReady &&
    <>
      <button id="next" onClick={handlePrev}>
        <FontAwesomeIcon icon={faBackwardStep} />
      </button>
      <button id="togglePlay" onClick={handleToggle}>
        <FontAwesomeIcon icon={isPlaying ? faCirclePause : faCirclePlay } />
      </button>
      <button id="next" onClick={handleNext}>
        <FontAwesomeIcon icon={faForwardStep} />
      </button>
      <p>{currentTrack}</p>
      <Volume />
      <Seek />
    </>
  )
}

export default Player;
