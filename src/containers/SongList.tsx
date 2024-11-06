import { useState } from "react";
import Song from "../components/Song/Song";

type SongListParams = {
  songs: ISong[];
  setSong: any;
}

interface ISong {
  id: string,
  name: string,
  artist: string,
  uri: string
}


const SongList = () => {
  const [songs, setSongs] = useState([]) //useQuery

  const getSongs = async () => {
    const response = await invoke<string>("get_user_saved_tracks", { accessToken: token });

    localStorage.setItem("songs", response);

    const songs = JSON.parse(response);
    const transformedSongs = songs.items.map((song: any) => {
      return {
        id: song.track.id,
        name: song.track.name,
        artist: song.track.artists[0].name,
        uri: song.track.uri
      }
    });
    
    setSongs(transformedSongs);
    console.log(songs);
    // for (let song of songs.items) {
    //   console.log(song.track.artists[0].name + "-" + song.track.name);
    // }
  }



const handleClick = (uri) => {
    // const uri = event.target.getAttribute("uri")
    console.log("clicked", uri);
    setSong(uri);
}
 return (
    <>
    {songs.map((song: ISong) => (
       <Song key={song.id} song={song} handleClick={() => handleClick(song.uri)}/>
    ))}
    </>
  );
}

export default SongList;
