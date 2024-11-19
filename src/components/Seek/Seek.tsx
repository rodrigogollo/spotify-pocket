import "./Seek.css";
import { SpotifyPlayerContext, useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { msToTime } from "../../utils/utils";
import { useSpotifyStore } from "../../stores/spotifyStore";

const Seek = () => {
  const player = useSpotifyStore.getState().player;
  const maxSeek = useSpotifyStore.getState().maxSeek;
  const seek = useSpotifyStore.getState().seek;

  const handleSeek = async (event) => {
    if (player) {
      try {
        let seek = event.target.value;
        useSpotifyStore.setState({ seek: seek });
        // setSeek(seek);
        await player.seek(seek);
        console.log('Changed song position!', msToTime(seek));
      } catch (err) {
        console.log("Error changing seek", err);
      }
    }
  };

  return (
    <div className="seek">
      <p>{msToTime(seek)}</p>
      <input 
        type="range" 
        min="0" 
        max={maxSeek} 
        onChange={handleSeek} 
        value={seek}
      />
      <p>{msToTime(maxSeek)}</p>
    </div>
  )
}

export default Seek;
