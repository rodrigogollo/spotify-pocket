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
  return (
    <p onClick={handleClick}>{song.artist + " - " + song.name}</p>
  )
}

export default Song;
