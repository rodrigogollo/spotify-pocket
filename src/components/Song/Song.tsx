import "./Song.css";
import useAuth from "../../hooks/useAuth"
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "../../utils/utils";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";

const Song = ({idx, song, songs}) => {
  const { token } = useAuth();
  const { currentUri } = useSpotifyPlayerContext();

  const setSong = async (uri: string) => {
    const uris = songs.map(song => song.track.uri)
    const offset = uris.indexOf(uri);

    const isChanged = await invoke<string>("set_playback", {
      accessToken: token, 
      uris: uris,
      offset: offset,
    });

    if (isChanged) {
      console.log("song changed");
    } else {
      console.log("Failed to change song");
    }
  }

  const handleClick = (uri: string) => {
    setSong(uri);
  }
  console.log(currentUri, song.track.uri)

  const classes = `song ${currentUri == song.track.uri ? "current": ""}`

  return (
    <div onClick={() => handleClick(song.track.uri)} 
      className={classes} >
      <p>{idx + ". " + song.track.artists[0].name + " - " + song.track.name}</p>
      <span>{msToTime(song.track.duration_ms)}</span>
    </div>
  )
}

export default Song;
