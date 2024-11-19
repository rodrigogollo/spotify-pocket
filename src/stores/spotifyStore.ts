import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { invoke } from "@tauri-apps/api/core";

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
  transferDevice: (device: {device_id: string}) => Promise<void>;
  updateState: (state: any) => void;
  setCurrentUri: (uri: string) => void;
  setSong: (uri: string, songs: any[]) => Promise<boolean>;
}

export const useSpotifyStore = create<SpotifyStore>((set, get) => ({
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
  setCurrentUri: (uri) => {
    set(() => ({ currentUri: uri }))
  },
  setSong: async (uri, songs) => {
    const token = useAuthStore.getState().token;
    const uris = songs.map(song => song.track.uri)
    const offset = uris.indexOf(uri);

    try {
      const isChanged = await invoke<string>("set_playback", {
        accessToken: token, 
        uris: uris,
        offset: offset,
      });

      if (isChanged) {
        console.log("song changed");
        // set(() => ({ currentUri: uri })); 
        return true;
      } else {
        console.log("Failed to change song");
        return false;
      }
    } catch (err) {
      console.log("error changing song", err);
      return false;
    }
  },
  transferDevice: async ({device_id}: {device_id: string}) => {
    const token = useAuthStore.getState().token;
    try {
      console.log("transferDevice", device_id);
      if (!get().isDeviceConnected) {
        let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device_id });
        set(() => ({ isDeviceConnected: isDeviceTransfered, isPlayerReady: true })); 
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
}));
