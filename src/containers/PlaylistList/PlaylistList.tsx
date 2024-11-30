const PlaylistList = ({ data }) => {
	return (
		<div>
			{
				data.items.flatMap((playlist) => (
					<p>{playlist.name}</p>
				))
			}
		</div>
	)
}

export default PlaylistList;
