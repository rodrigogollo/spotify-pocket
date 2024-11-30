
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import Loading from "../../components/Loading/Loading";
import { useAuthStore } from "../../stores/authStore";
import SongListContainer from "../../components/SongListContainer/SongListContainer";

const PlaylistSongList = ({ playlist }) => {
  const token = useAuthStore((state) => state.token)

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: [`playlist-songs-${playlist.id}`, token], 
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
