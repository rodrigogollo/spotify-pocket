
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import "./PlaylistSongLIst.css";
import { useEffect } from "react";
import Loading from "../../components/Loading/Loading";
import { useAuthStore } from "../../stores/authStore";
import SongListContainer from "../../components/SongListContainer/SongListContainer";
import { useNavigate, useParams } from "react-router";
import fetchPlaylistSongs from "./fetchPlaylistSongs";

const PlaylistSongList = () => {
  const params = useParams();
  const id = params.playlistId;
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate();

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: [`playlist-songs-${id}`, token, id], 
    queryFn: fetchPlaylistSongs,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (error) {
    return <>{error.message}</>
  }

	return (
	  <div className="playlist-songs">
	  <button onClick={() => navigate(-1)}>Go Back</button>
	  { isLoading || !data || !data.pages ?
		  <Loading /> :
		  <SongListContainer 
			  isLoading={isLoading}
			  data={data}
		  /> 
	  }
	  <div ref={ref}></div>
	  {isFetchingNextPage ? <Loading /> : null} 
	  </div>
  );
};

export default PlaylistSongList;
