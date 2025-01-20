import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';
import { persist } from "zustand/middleware";
import { useNavigate } from "react-router";

type AuthStore = {
  token: string | null,
  isUserLogged: boolean,
  setToken: (newValue: string | null) => void;
  handleLoginSpotify: () => Promise<void>,
  handleRefreshToken: () => Promise<string>,
  initialize: () => void,
  reset: () => void,
}

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const initialState = {
  token: null,
  isUserLogged: false
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setToken: (newValue) => set({ token: newValue }),
      handleLoginSpotify: async () => {
        try {
          await invoke('initiate_spotify_auth');
          console.log('Spotify login initiated.');
        } catch (err) {
          console.log('Failed to initiate Spotify login', err);
        }
      },
      handleRefreshToken: async () => {
        try {
          const newToken = await invoke<string>('refresh_token');
          console.log('New token generated:', newToken);
          set({ token: newToken });
          return newToken;
        } catch (err) {
          console.log('Failed to refresh token', err);
          return '';
        }
      },
      initialize: () => {
        const unlisten = listen<LoadedPayload>('loaded', (event) => {
          console.log(
            `App is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`
          );

          set({ token: event.payload.access_token, isUserLogged: true })
        });

        return unlisten;
      },
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'token',
      partialize: (state) => ({ token: state.token, isUserLogged: !!state.token }),
    }
  )
);
