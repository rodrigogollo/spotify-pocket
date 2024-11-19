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
  repeat: string;
  isDeviceConnected: boolean;
  isPlaying: boolean;
  transferDevice: (device: {device_id: string}) => Promise<void>;
  updateState: (state: any) => void;
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
  repeat: "",
  isDeviceConnected: false,
  isPlaying: false,
  transferDevice: async ({device_id}: {device_id: string}) => {
    const token = useAuthStore.getState().token;
    try {
      console.log("transferDevice", device_id);
      if (!get().isDeviceConnected) {
        let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device_id });
        set(() => ({ isDeviceConnected: isDeviceTransfered })); 
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
    if (!state) return; 

    if (state.position) {
      set(() => ({ seek: state.position }));
    }

    set(() => ({
      isPlayerReady: !state.loading,
      isPlaying: !state.paused,
      shuffle: state.shuffle,
      repeat: state.repeat_mode,
    }))

    const stateTrack = state?.track_window?.current_track;
    const stateUri = stateTrack?.uri;

    if (stateTrack && get().currentUri !== stateUri) {
      set({ 
        maxSeek: stateTrack.duration_ms,
        currentUri: stateTrack.uri,
        currentTrack: `${stateTrack.artists[0].name} - ${stateTrack.name}`,
        seek: 0,
      });
    }
  }
}));
