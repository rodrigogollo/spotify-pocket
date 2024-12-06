import { invoke } from "@tauri-apps/api/core";
import "./SearchPage.css";
import { useAuthStore } from "../../stores/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCross, faSearch, faX } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Loading from "../../components/Loading/Loading";
import SongList from "../../components/SongList/SongList";

const SearchPage = () => {
	const [search, setSearch] = useState("");
	const [tracks, setTracks] = useState(null);
	const [albums, setAlbums] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSearch = async (event) => {
		event.preventDefault();
		setIsLoading(true);
        const token = useAuthStore.getState().token;
        const response = await invoke<string>("search", {
          accessToken: token, 
		  offset: 50,
		  limit: 50,
          query: search
        });
        const json = JSON.parse(response);

		json.tracks.items = json.tracks.items.map(item => ({ track: item }));

		setTracks(json.tracks)
		setAlbums(json.albums)
		setIsLoading(false);
	}

	const handleSearchChange = (event) => {
		setSearch(event.target.value);
	}
	
	return (
		<form onSubmit={handleSearch} className="search-page">
			<div className="search-nav">
				<input type="text" placeholder="search"  value={search} onChange={handleSearchChange} />
				<FontAwesomeIcon className="delete" icon={faX} onClick={() => setSearch("")} size={"sm"} />
				<button type="submit"> 
					<FontAwesomeIcon icon={faSearch} />
				</button>
			</div>
			{
				isLoading ? 
					<Loading /> : 
					tracks ? (
					<SongList 
						page={tracks}
						pageIndex={0}
					/>
				) : null
			}
		</form>
	)
}

export default SearchPage;
