interface ISong {
  id: string,
  name: string,
  artist: string,
}

interface SongProps {
  song: ISong
  handleClick: any
}

const Song = ({song, handleClick}:SongProps) => {

  const setSong = async (uri) => {
    const uris = songs.map(song => song.uri)
    const offset = uris.indexOf(uri);
    console.log(offset);

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

  // const handleClick = () => {
  //   
  // }

  return (
    <p onClick={handleClick}>{song.artist + " - " + song.name}</p>
  )
}

export default Song;
