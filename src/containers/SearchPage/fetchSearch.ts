import { invoke } from '@tauri-apps/api/core';
import { QueryFunction } from '@tanstack/react-query';

const fetchPage: QueryFunction<any, ["searched-songs", string]> = async ({ queryKey, pageParam = 0 }: { queryKey: string[], pageParam: number}) => {
	const token = queryKey[1];
	const query = queryKey[2];
	console.log(queryKey[2])

  const fetchSongs = async (offset: number) => {
    const apiRes: string = await invoke("search", 
      {
        accessToken: token,
        query: query,
        offset: offset,
        limit: 50
    });

    const songs =  JSON.parse(apiRes);
	console.log("songs", songs)

    if (!songs) {
      throw new Error(`Liked songs offset : ${offset} not ok`);
    }

    songs.tracks.items = songs.tracks.items.map(item => ({ track: item }));

    return songs.tracks;
  }

  const [page1, page2, page3] = await Promise.all([
    fetchSongs(pageParam),
    fetchSongs(pageParam + 50),
    fetchSongs(pageParam + 100),
  ]);

  
  if (page1.items) {
	let allItems = [...page1.items, ...page2.items, ...page3.items];

	const deduped = Array.from(
	  new Map(allItems.map(item => [item.track.id, item])).values()
	);


    return {
      items: deduped,
      nextPage: pageParam + 150,
      hasNextPage: page3.items.length > 0,
    }
  }

  return null;


}
export default fetchPage;
