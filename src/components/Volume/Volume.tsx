import "./Volume.css";
import { SpotifyPlayerContext, useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { CSSProperties, useState } from "react";

const Volume = () => {
  const { player, volume, setVolume } = useSpotifyPlayerContext();
  const [bubblePosition, setBubblePosition] = useState(0);

  const handleVolumeChange = async (event) => {
    if (player) {
      try {
        let vol = event.target.value / 10;
        await player?.setVolume(vol / 10);
        setVolume(vol / 10);

        // Update bubble position based on slider value
        const newValue = event.target.value;
        const sliderWidth = event.target.offsetWidth;
        const min = event.target.min || 0;
        const max = event.target.max || 100;
        const percentage = (newValue - min) / (max - min);
        setBubblePosition(percentage * sliderWidth);
        
      } catch (err) {
        console.log("error changing volume", err);
      }
    }
  };

  const bubble: CSSProperties = {
    position: "absolute",
    top: "30px",
    left: `${315 + bubblePosition}px`,
    width: "30px",
    padding: "2px",
    // height: "20px",
    backgroundColor: "white",
    borderRadius: "4px",
    textAlign: "center",
    pointerEvents: "none",
    transform: "translateX(-50%)",
    color: "var(--color-darkest)",
    fontSize: "10px"
  }

  return (
    <div className="volume">
    <div id="bubble" style={bubble}>{Math.floor(Number(volume * 100))}%</div>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={volume * 100} 
      onChange={handleVolumeChange} 
      name="volume"
    />
    </div>
  )
}

export default Volume;
