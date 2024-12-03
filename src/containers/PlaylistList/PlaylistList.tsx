import "./PlaylistList.css";
import { Link } from "react-router-dom";

const PlaylistList = ({ data }) => {
	return (
		<div className="playlist-list">
			{
				data.items.flatMap((playlist) => (
					<Link key={`playlist-${playlist.id}`} to={`/playlist/${playlist.id}`}>
						<p>{playlist.name}</p>
					</Link>
				))
			}
		</div>
	)
}

export default PlaylistList;
