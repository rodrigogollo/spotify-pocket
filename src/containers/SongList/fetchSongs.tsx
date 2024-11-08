import { invoke } from '@tauri-apps/api/core';

const fetchSongs = async ({ queryKey, pageParam }) => {
  const token = queryKey[1];
  let offset;
  if (pageParam == 0){
    offset = 0;
  } else {
    const url = new URL(pageParam)
    offset = parseInt(url.searchParams.get("offset") || 0);
  }
  const apiRes = await invoke("get_user_saved_tracks", 
    {
      accessToken: token,
      offset: offset,
      limit: 50
  });

  const songs =  JSON.parse(apiRes);

  if (!songs.items.length) {
    throw new Error(`Liked songs offset : ${offset} not ok`);
  }

  return songs;
}

export default fetchSongs;
