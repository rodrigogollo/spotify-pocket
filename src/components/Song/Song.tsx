import useAuth from "../../hooks/useAuth"
import { invoke } from '@tauri-apps/api/core';

const Song = ({song, songs}) => {
  const { token } = useAuth();

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

  return (
    <p onClick={() => handleClick(song.track.uri)}>{song.track.artists[0].name + " - " + song.track.name}</p>
  )
}

export default Song;
