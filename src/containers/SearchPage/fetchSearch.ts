import { invoke } from '@tauri-apps/api/core';
import { QueryFunction } from '@tanstack/react-query';
import checkSongs from '../../utils/checkSongs';
import { useSpotifyStore } from '../../stores/spotifyStore';

const fetchPage: QueryFunction<any, ["searched-songs", string, string]> = async ({ queryKey, pageParam = 0 }: { queryKey: string[], pageParam: number }) => {
  const token = queryKey[1];
  const query = queryKey[2];
  const mediaType = queryKey[3]
  let type;

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

    console.log(data);
    if (!data) {
      throw new Error(`Liked songs offset : ${offset} not ok`);
    }

    if (data.tracks) {
      type = "tracks";
      data.tracks.items = data.tracks.items.map(item => ({ track: item }));
      const ids = data.tracks.items.map((track) => track.track.id)
      const arrayOfLiked = await checkSongs(ids, token);
      data.tracks.items = data.tracks.items.map((item, idx) => ({ ...item, isLiked: arrayOfLiked[idx] }));
      return data.tracks;
    } else if (data.albums) {
      type = "albums"
      return data.albums
    } else if (data.playlists) {
      type = "playlists"
      return data.playlists
    }
  }

  const [page1, page2, page3] = await Promise.all([
    fetchSongs(pageParam),
    fetchSongs(pageParam + 50),
    fetchSongs(pageParam + 100),
  ]);

  if (page1.items) {
    let allItems = [...page1.items, ...page2.items, ...page3.items];

    let deduped;
    if (type == "tracks") {
      deduped = Array.from(
        new Map(allItems.map(item => [item.track.id, item])).values()
      );
    } else if (type == "albums") {
      deduped = Array.from(
        new Map(allItems.map(item => [item.id, item])).values()
      );
    } else if (type == "playlists") {
      deduped = Array.from(
        new Map(allItems.map(item => [item?.id, item])).values()
      );
    }

    return {
      items: deduped,
      nextPage: pageParam + 150,
      hasNextPage: page3.items.length > 0,
      type: type,
    }
  }

  return null;
}

export default fetchPage;
