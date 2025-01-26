import "./Song.css";
import { msToTime } from "../../utils/utils";
import ScrollingText from "../ScrollingText/ScrollingText";
import { useSpotifyStore } from "../../stores/spotifyStore";

type SongProps = {
  className: string;
  idx: number;
  song: Song,
  songs: Song[]
}

const Song = ({ className, idx, song, songs }: SongProps) => {
  const setSong = useSpotifyStore((state) => state.setSong);

  const handleClick = (uri: string) => {
    setSong(uri, songs);
  }

  let classname = `song ${className} ${!song.track.is_playable && !song?.track.track ? "invalid" : ""} ${song.isLiked ? "liked" : ""}`

  return (
    <div onClick={() => handleClick(song.track.uri)} className={classname} >
      <span className="song-index">{idx ? idx + ". " : null}</span>
      <div className="text-container">
        <ScrollingText className="song-text" text={song.track.artists[0].name + " - " + song.track.name} />
      </div>
      <span className="song-duration">{msToTime(song.track.duration_ms)}</span>
    </div>
  )
}

export default Song;
