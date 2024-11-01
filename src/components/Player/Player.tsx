import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import "./Player.css";

type PlayerProps = {
  isPlaying: boolean;
  currentTrack: string;
  handleSeek: any;
  max: number;
  seek: number;
  player: any;
}

const Player = ({
  isPlaying, 
  currentTrack, 
  handleSeek,
  max,
  seek,
  player,
}: PlayerProps) => {

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
        console.log(err);
      }
    }
  };

  const handlePrev = async () => {
    if (player) {
      try {
        await player?.previousTrack();
        setSeek(0);
        lastSeek.current = 0;
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
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
      <Volume player={player} />
      <Seek seek={seek} max={max} handleSeek={handleSeek} />
    </>
  )
}

export default Player;
