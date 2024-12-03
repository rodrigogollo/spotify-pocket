import "./PlaylistsPage.css";
import fetchPlaylists from "./fetchPlaylists";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import Loading from "../../components/Loading/Loading";
import { useAuthStore } from "../../stores/authStore";
import PlaylistSongList from "../PlaylistSongList/PlaylistSongList";
import PlaylistList from "../PlaylistList/PlaylistList";

const PlaylistsPage = () => {
  const token = useAuthStore.getState().token;

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ["playlists", token], 
    queryFn: fetchPlaylists,
    initialPageParam: "https://api.spotify.com/v1/me/playlists?offset=0&limit=50",
    getNextPageParam: (lastPage)  => lastPage.next,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (isLoading || !data || !data.pages) {
    return <Loading />
  } 

  if (error) {
    return <>{error.message}</>
  }

   return (
     <div>{
        data.pages.map((page, index) => {
          return <PlaylistList key={index} data={page} />
        })
      }
      <div ref={ref}></div>
      {isFetchingNextPage ? <Loading /> : null} 
    </div>
  );
}

export default PlaylistsPage;
