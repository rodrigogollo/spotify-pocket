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


const SongList = ({ songs, setSong }: SongListParams) => {


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
