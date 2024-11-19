import "./SongList.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import fetchPage from "./fetchSongs";
import Song from "../../components/Song/Song";
import Loading from "../../components/Loading/Loading";
import { useAuthStore } from "../../stores/authStore";
import { useSpotifyStore } from "../../stores/spotifyStore";

interface ISong {
  track: {
    id: string,
    name: string,
    artist: string,
    uri: string
    linked_from: {
      uri: string;
    }
  }
}



const SongList = () => {
  const token = useAuthStore((state) => state.token)
  const currentUri = useSpotifyStore((state) => state.currentUri)

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ["liked-songs", token], 
    queryFn: fetchPage,
    // getNextPageParam: (lastPage)  => lastPage.next,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  console.log(isLoading, data);
  if (isLoading || !data || !data.pages) {
    return <Loading />
  } 

  if (error) {
    return <>{error.message}</>
  }

   return (
      <div className="song-list">
        {
          data.pages.map((page, pageIndex) => {
            console.log("page", page)
            console.log("index", pageIndex, page.nextPage)
            return <div key={`${pageIndex}-${1 + page.nextPage -150}`}>
              {
                page.items.flatMap((song: ISong, idx:number) => {
                  return <Song 
                      className={currentUri == song.track.uri ? "active": ""} 
                      idx={1 + page.nextPage + idx - 150}
                      key={`${pageIndex}-${song.track.id}`} 
                      song={song} 
                      songs={page.items} 
                    />
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
};

export default SongList;
