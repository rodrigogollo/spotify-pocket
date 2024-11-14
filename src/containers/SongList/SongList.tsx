import "./SongList.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import fetchSongs from "./fetchSongs";
import Song from "../../components/Song/Song";
import useAuth from "../../hooks/useAuth";
import Loading from "../../components/Loading/Loading";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";

interface ISong {
  track: {
    id: string,
    name: string,
    artist: string,
    uri: string
  }
}

const SongList = () => {
  const { token } = useAuth();
  const { currentUri } = useSpotifyPlayerContext();

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ["liked-songs", token], 
    queryFn: fetchSongs,
    initialPageParam: "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
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
      <div className="song-list">
        {
          data.pages.map((page, pageIndex) => {
            return <div key={`${pageIndex}-${1 + page.offset}`}>
              {
                page.items.map((song: ISong, idx:number) => {
                  return <Song 
                      className={currentUri == song.track.uri ? "active": ""} 
                      idx={1 + page.offset + idx}
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
