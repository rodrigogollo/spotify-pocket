import { SpotifyPlayerContext, useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";

const Volume = () => {
  const { player, volume, setVolume } = useSpotifyPlayerContext();
  // const [volume, setVolume] = useLocalStorageState("volume", 0.5);

  const handleVolumeChange = async (event) => {
    if (player) {
      try {
        let vol = event.target.value / 10;
        await player?.setVolume(vol / 10);
        setVolume(vol / 10);
      } catch (err) {
        console.log("error changing volume", err);
      }
    }
  };

  return (
    <>
    <input 
      type="range" 
      min="0" 
      max="100" 
      value={volume * 100} 
      onChange={handleVolumeChange} 
      name="volume"
    />
    <output htmlFor="volume">{Math.floor(Number(volume * 100))}%</output>
    <p>Volume: {Math.floor(Number(volume * 100))}%</p>
    </>
  )
}

export default Volume;
