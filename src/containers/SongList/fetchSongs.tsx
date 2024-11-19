import { invoke } from '@tauri-apps/api/core';
import { QueryFunction } from '@tanstack/react-query';

const fetchPage: QueryFunction<any, ["liked-songs", string]> = async ({ queryKey, pageParam = 0 }: { queryKey: string, pageParam: number}) => {
  const token = queryKey[1];

  const fetchSongs = async (offset: number) => {
    // const url = new URL(pageParam);
    // const offset = parseInt(url.searchParams.get("offset") || 0); 

    const apiRes: string = await invoke("get_user_saved_tracks", 
      {
        accessToken: token,
        offset: offset,
        limit: 50
    });

    const songs =  JSON.parse(apiRes);

    if (!songs) {
      throw new Error(`Liked songs offset : ${offset} not ok`);
    }

    return songs;
  }

  const [page1, page2, page3] = await Promise.all([
    fetchSongs(pageParam),
    fetchSongs(pageParam + 50),
    fetchSongs(pageParam + 100),
  ]);

  console.log("page1", page1)
  
  return {
    items: [...page1.items, ...page2.items, ...page3.items],
    nextPage: pageParam + 150,
    hasNextPage: page3.items.length > 0,
  }


}
export default fetchPage;
