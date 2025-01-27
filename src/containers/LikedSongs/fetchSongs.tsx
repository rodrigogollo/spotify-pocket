import { invoke } from '@tauri-apps/api/core';
import { QueryFunction } from '@tanstack/react-query';

const fetchPage: QueryFunction<any, ["liked-songs", string]> = async ({ queryKey, pageParam = 0 }: { queryKey: string, pageParam: number }) => {
  const token = queryKey[1];

  const fetchSongs = async (offset: number) => {
    const apiRes: string = await invoke("get_user_saved_tracks",
      {
        accessToken: token,
        offset: offset,
        limit: 50
      });

    const songs = JSON.parse(apiRes);

    songs.items = songs.items.map(item => ({ ...item, isLiked: true }));

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

  if (page1.items) {
    return {
      items: [...page1.items, ...page2.items, ...page3.items],
      nextPage: pageParam + 150,
      hasNextPage: page3.items.length > 0,
    }
  }

  return null;


}
export default fetchPage;
