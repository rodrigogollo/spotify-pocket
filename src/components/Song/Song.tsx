import "./Song.css";
import useAuth from "../../hooks/useAuth"
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "../../utils/utils";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import ScrollingText from "../ScrollingText/ScrollingText";

const Song = ({className, idx, song, songs}) => {
  const { tokenRef } = useAuth();
  const { currentUri } = useSpotifyPlayerContext();

  const setSong = async (uri: string) => {
    const uris = songs.map(song => song.track.uri)
    const offset = uris.indexOf(uri);

    const isChanged = await invoke<string>("set_playback", {
      accessToken: tokenRef.current, 
      uris: uris,
      offset: offset,
    });

    if (isChanged) {
      console.log("song changed");
      currentUri.current = uri;
    } else {
      console.log("Failed to change song");
    }
  }

  const handleClick = (uri: string) => {
    setSong(uri);
  }

  const classes = `song ${currentUri.current == song.track.uri ? "current": ""}`

  return (
    <div onClick={() => handleClick(song.track.uri)} className={`song ${className}`} >
      <span className="song-index">{idx + ". "}</span>
      <div className="text-container">
        <ScrollingText className="song-text" text={song.track.artists[0].name + " - " + song.track.name} />
      </div>
      <span className="song-duration">{msToTime(song.track.duration_ms)}</span>
    </div>
  )
}

export default Song;
