import "./Player.css";

type PlayerProps = {
  handleToggle: any;
  isPlaying: boolean;
  currentTrack: string;
}

const Player = ({handleToggle, isPlaying, currentTrack}: PlayerProps) => {
  return (
    <>
      <button id="togglePlay" onClick={handleToggle}>
        {isPlaying ? "Pause" : "Play" } 
      </button>
      <p>{currentTrack}</p>
    </>
  )
}

export default Player;
