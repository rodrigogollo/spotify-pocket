import fetchPlaylists from "./fetchPlaylists";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import Loading from "../../components/Loading/Loading";

const PlaylistsPage = () => {
  const { token } = useAuth();

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
      <div className="playlists">
        {
          data.pages.map((page, pageIndex) => {
            return <div key={`${pageIndex}-${1 + page.offset}`}>
              {
                page.items.map((playlist: string, idx:number) => {
                  return <div key={`${pageIndex}-${idx}`}>{playlist.name}</div>
                })
              }
            </div>
            }
          )
        }
        <div ref={ref}></div>
          {isFetchingNextPage ? <Loading /> : null} 
        </div>
  );
}

export default PlaylistsPage;
