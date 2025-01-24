import { invoke } from '@tauri-apps/api/core';
import { QueryFunction } from '@tanstack/react-query';

const fetchPage: QueryFunction<any, ["searched-songs", string, string]> = async ({ queryKey, pageParam = 0 }: { queryKey: string[], pageParam: number }) => {
  const token = queryKey[1];
  const query = queryKey[2];
  const mediaType = queryKey[3]

  const fetchSongs = async (offset: number) => {
    const apiRes: string = await invoke("search",
      {
        accessToken: token,
        query: query,
        mediaType: mediaType,
        offset: offset,
        limit: 50
      });

    const data = JSON.parse(apiRes);
    console.log("data fetched", data)

    if (!data) {
      throw new Error(`Liked songs offset : ${offset} not ok`);
    }

    if (data.tracks) {
      data.tracks.items = data.tracks.items.map(item => ({ track: item }));
      return data.tracks;
    } else if (data.albums) {
      return data.albums
    }

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
