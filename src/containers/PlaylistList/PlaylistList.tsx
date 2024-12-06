import "./PlaylistList.css";
import { Link } from "react-router-dom";
import ScrollingText from "../../components/ScrollingText/ScrollingText";

const PlaylistList = ({ data }) => {
	return (
		<div className="playlist-list">
			{
				data.items.flatMap((playlist) => (
					<Link className="current-playlist" key={`playlist-${playlist.id}`} to={`/playlist/${playlist.id}`}>
						<ScrollingText text={playlist.name} className={"current-playlist-text"} />
						<img src={playlist.images[0].url} />
					</Link>
				))
			}
		</div>
	)
}

export default PlaylistList;
