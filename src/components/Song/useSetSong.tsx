import { useCallback } from "react";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { invoke } from "@tauri-apps/api/core";
import { useAuthContext } from "../../hooks/Auth/AuthContext";

const useSetSong = () => {
  const { token } = useAuthContext();
  const { setCurrentUri } = useSpotifyPlayerContext();

  const setSong = useCallback(async (uri: string, songs: any[]) => {
    if (!token) {
      console.log("setSong has no valid token available");
      return false;
    }
    const uris = songs.map(song => song.track.uri)
    const offset = uris.indexOf(uri);

    console.log(token);
    try {
      const isChanged = await invoke<string>("set_playback", {
        accessToken: token, 
        uris: uris,
        offset: offset,
      });

      if (isChanged) {
        console.log("song changed");
        setCurrentUri(uri);
        return true;
      } else {
        console.log("Failed to change song");
        return false;
      }
    } catch (err) {
      console.log("error changing song", err);
    }
  }, [token, setCurrentUri]);

  return { setSong };
};

export default useSetSong;
