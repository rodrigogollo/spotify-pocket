import { SpotifyPlayerContext, useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { msToTime } from "../../utils/utils";

const Seek = () => {
  const { player, maxSeek, setSeek, seek } = useSpotifyPlayerContext();

  const handleSeek = async (event) => {
    if (player) {
      try {
        let seek = event.target.value;
        console.log("seek", seek)
        // lastSeek.current = seek;
        setSeek(seek);
        await player?.seek(seek);
        console.log('Changed position!');
      } catch (err) {
        console.log("Error changing seek", err);
      }
    }
  };

  return (
    <>
      <p>({msToTime(seek)}/{msToTime(maxSeek)})</p>
      <input 
        type="range" 
        min="0" 
        max={maxSeek} 
        onChange={handleSeek} 
        value={seek}
      />
      <p>{msToTime(maxSeek)}</p>
    </>
  )
}

export default Seek;
