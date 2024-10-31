type PlayerProps = {
  handleToggle: any;
  isPlaying: boolean;
  currentTrack: string;
  handleNext: any;
  handlePrev: any;
}

const Player = ({handleToggle, isPlaying, currentTrack, handleNext, handlePrev}: PlayerProps) => {
  return (
    <>
      <button id="next" onClick={handlePrev}>Prev</button>
      <button id="togglePlay" onClick={handleToggle}>
        {isPlaying ? "Pause" : "Play" } 
      </button>
      <p>{currentTrack}</p>
      <button id="next" onClick={handleNext}>Next</button>
    </>
  )
}

export default Player;
