import "./SearchPage.css";
import { useAuthStore } from "../../stores/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faX } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import Loading from "../../components/Loading/Loading";
import SongList from "../../components/SongList/SongList";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import fetchPage from "./fetchSearch";
import { useSpotifyStore } from "../../stores/spotifyStore";

const SearchPage = () => {
  const token = useAuthStore((state) => state.token);
  const search = useSpotifyStore((state) => state.search);
  const [query, setQuery] = useState(search);
  const searchData = useSpotifyStore((state) => state.searchData);
  const setSearch = useSpotifyStore((state) => state.setSearch);

  const { isLoading, isFetchingNextPage, data, error, fetchNextPage } = useInfiniteQuery({
    queryKey: ["searched-songs", token, search],
    queryFn: fetchPage,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
    enabled: !!search,
    keepPreviousData: true,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, search]);

  if (data?.error) {
    return <>No songs found.</>
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    if (query != "" && query != undefined) {
      setSearch(query);
    }
  }

  const handleSearchChange = (event) => {
    event.preventDefault();
    setQuery(event.target.value);
  }

  return (
    <form onSubmit={handleSearchSubmit} className="search-page">
      <div className="search-nav">
        <input type="text" placeholder="search" value={query} onChange={handleSearchChange} />
        <FontAwesomeIcon className="delete" icon={faX} onClick={() => setQuery("")} size={"sm"} />
        <button type="submit">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      <div className="searched-songs">
        {
          isLoading ? (
            <Loading />
          ) : (
            data?.pages && data.pages.length > 0 ? (
              data.pages.map((page, pageIndex) => (
                <SongList
                  key={`${page.id}-${pageIndex}`}
                  page={page}
                  pageIndex={pageIndex}
                />
              ))
            ) : error ? (
              <p>Error: {error.message}</p>
            ) : search === '' ? (
              <p>Start searching for songs</p>
            ) : data && data.pages.length === 0(
              <p>No songs found.</p>
            )
          )
        }
        {search ? <div ref={ref}></div> : null}
      </div>
      {/*isFetchingNextPage ? <Loading /> : null*/}
    </form>
  )
}

export default SearchPage;
