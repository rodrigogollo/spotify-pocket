import Song from "../components/Song/Song";

type SongListParams = {
  songs: ISong[];
}

interface ISong {
  id: string,
  name: string,
  artist: string,
}

const SongList = ({ songs }: SongListParams) => {
 return (
    <>
    {songs.map((song: ISong) => (
       <Song key={song.id} song={song} />
    ))}
    </>
  );
}

export default SongList;
