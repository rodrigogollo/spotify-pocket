import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { invoke } from "@tauri-apps/api/core";
import { persist } from "zustand/middleware";

type SpotifyStore = {
  player: Spotify.Player | null;
  currentTrack: string;
  maxSeek: number;
  seek: number;
  volume: number;
  isPlayerReady: boolean;
  device: string;
  shuffle: boolean;
  currentUri: string;
  repeat: number;
  isDeviceConnected: boolean;
  isPlaying: boolean;
  currentPlaylist: any | null;
  search: string;
  searchData: any[] | null;
  setSearch: (query: string) => void;
  transferDevice: (device_id: {device_id: string}) => Promise<void>;
  updateState: (state: any) => void;
  setSong: (uri: string, songs: any[]) => Promise<boolean>;
  getPlaylist: (playlistId: string | undefined) => void;
}

export const useSpotifyStore = create<SpotifyStore>()(
  persist(
    (set, get) => ({
    player: null,
    currentTrack: "",
    maxSeek: 0,
    seek: 0,
    volume: 0.5,
    isPlayerReady: false,
    device: "",
    shuffle: false,
    currentUri: "",
    repeat: 0,
    isDeviceConnected: false,
    isPlaying: false,
    currentPlaylist: null,
    search: "",
    searchData: null,
    setSearch: (query) => {
      set(() => ({ search: query }));
    },
    getPlaylist: async (playlistId) => {
      if (playlistId) {
        const token = useAuthStore.getState().token;
        const response = await invoke<string>("get_playlist", {
          accessToken: token, 
          playlistId: playlistId
        });
        const playlist = JSON.parse(response);

        set(() => ({ currentPlaylist: playlist }));
      } else {
        set(() => ({ currentPlaylist: null }));
      }
    },
    setSong: async (uri, songs) => {
      const token = useAuthStore.getState().token;
      const uris = songs.flatMap(song => song.track.uri)
      const offset = uris.indexOf(uri);

      try {
        const isChanged = await invoke<string>("set_playback", {
          accessToken: token, 
          uris: uris,
          offset: offset,
        });

        if (isChanged) {
          console.log("song changed");
          return true;
        } else {
          console.log("offset", offset)
          console.log("uri", uri);
          console.log("uris", uris);
          console.log("Failed to change song");
          // useAuthStore.getState().handleRefreshToken();
          return false;
        }
      } catch (err) {
        console.log("error changing song", err);
        return false;
      }
    },
    transferDevice: async (device_id) => {
      const token = useAuthStore.getState().token;
      try {
        console.log("transferDevice", device_id);
        if (!get().isDeviceConnected) {
          let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device_id });
          set(() => ({ isDeviceConnected: isDeviceTransfered, isPlayerReady: true })); 
          // useSetSong(!get().currentUri);
          console.log("Device successfully transfered");
        } else {
          console.log("Device already transfered");
        }
      } catch (err) {
        console.log("Error transfering device", err);
        set(() => ({ isDeviceConnected: false })); 
      }
    },
    updateState: (state) => {
      console.log("updating state", state);
      if (!state) return; 

      if (state.position) {
        set(() => ({ seek: state.position }));
      }

      set(() => ({ isPlaying: !state.paused }));

      // if (get().isPlayerReady != !state.loading) {
      //   set(() => ({ isPlayerReady: !state.loading }));
      // }

      if (get().shuffle != state.shuffle) {
        set(() => ({ shuffle: state.shuffle }));
      }

      if (get().repeat != state.repeat_mode) {
        set(() => ({ repeat: state.repeat_mode }));
      }

      const stateTrack = state?.track_window?.current_track;
      const stateUri = stateTrack?.uri;

      if (stateTrack && get().currentUri !== stateUri) {
        const uri = stateTrack.linked_from.uri ? stateTrack.linked_from.uri : stateTrack.uri;
        set({ 
          maxSeek: stateTrack.duration_ms,
          currentUri: uri,
          currentTrack: `${stateTrack.artists[0].name} - ${stateTrack.name}`,
          seek: 0,
        });
      }
    }
  }),
    {
      name: 'spotify-store',
      partialize: (state) => ({ 
        volume: state.volume, 
        shuffle: state.shuffle, 
        repeat: state.repeat, 
      }),
    }
  )
);
