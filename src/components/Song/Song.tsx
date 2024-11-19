import "./Song.css";
import { msToTime } from "../../utils/utils";
import ScrollingText from "../ScrollingText/ScrollingText";
import useSetSong from "./useSetSong";

const Song = ({className, idx, song, songs}) => {
  const { setSong } = useSetSong();

  const handleClick = (uri: string, ) => {
    setSong(uri, songs);
  }

  return (
    <div onClick={() => handleClick(song.track.uri)} className={`song ${className} ${!song.track.is_playable ? "invalid" : ""}`} >
      <span className="song-index">{idx + ". "}</span>
      <div className="text-container">
        <ScrollingText className="song-text" text={song.track.artists[0].name + " - " + song.track.name} />
      </div>
      <span className="song-duration">{msToTime(song.track.duration_ms)}</span>
    </div>
  )
}

export default Song;
