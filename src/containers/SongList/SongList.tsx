import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import fetchSongs from "./fetchSongs";
import Song from "../../components/Song/Song";
import useAuth from "../../hooks/useAuth";

type SongListParams = {
  songs: ISong[];
  setSong: any;
}

interface ISong {
  id: string,
  name: string,
  artist: string,
  uri: string
}


const SongList = () => {
  const { token } = useAuth();
  const [offset, setOffset] = useState(1);
  const {isFetchingNextPage, data, error, status, fetchNextPage } = useInfiniteQuery({
    queryKey: ["liked-songs", token], 
    queryFn: fetchSongs,
    initialPageParam: "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
    getNextPageParam: (lastPage)  => lastPage.next
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  if (status === "pending") {
    return <>Loading...</>
  } else if (status === "error") {
    return <>{error.message}</>
  } else {
     return (
        <>
          {data.pages.map((page) => {
            return <div key={page.offset}>
              {
              page.items.map((song: ISong) => (
                 <Song key={song.id} song={song} songs={page.items} />
              ))}
            </div>
            })
          }
          <div ref={ref}></div>
          {isFetchingNextPage ? <p>Loading...</p> : null} 
        </>
    );
  }
}

export default SongList;
