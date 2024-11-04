interface ISong {
  id: string,
  name: string,
  artist: string,
}

interface SongProps {
  song: ISong
}

const Song = ({song}:SongProps) => {
  return (
    <p>{song.artist + " - " + song.name}</p>
  )
}

export default Song;
