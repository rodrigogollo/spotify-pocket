import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep } from '@fortawesome/free-solid-svg-icons'
import "./Player.css";

type PlayerProps = {
  handleToggle: any;
  isPlaying: boolean;
  currentTrack: string;
  handleNext: any;
  handlePrev: any;
  handleVolumeChange: any;
  volume: number;
  handleSeek: any;
  max: number;
  seek: number;
}

const Player = ({
  handleToggle, 
  isPlaying, 
  currentTrack, 
  handleNext, 
  handlePrev, 
  volume = 0.5, 
  handleVolumeChange,
  handleSeek,
  max,
  seek
}: PlayerProps) => {
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
      <Volume volume={volume} handleVolumeChange={handleVolumeChange} />
      <Seek seek={seek} max={max} handleSeek={handleSeek} />
    </>
  )
}

export default Player;
