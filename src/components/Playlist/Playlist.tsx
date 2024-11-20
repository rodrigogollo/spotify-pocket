import ScrollingText from "../ScrollingText/ScrollingText";

type PlaylistProps = {
	playlistKey: string,
	items: any[]
}

const Playlist = ({playlistKey, items}: PlaylistProps) => {

	const handlePlaylistSelect = (playlist: Playlist) => {
		console.log("playlist", playlist);
	}

	return <div key={playlistKey}>
	  {
		items.map((playlist) => {
		  return <div key={playlist.id} onClick={() => handlePlaylistSelect(playlist)}>
			<ScrollingText text={playlist.name} className={"current-playlist"} />
			<div className="playlist-songs">

			</div>
		  </div>
		})
	  }
	</div>

}

export default Playlist;
