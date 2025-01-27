// index.d.ts
declare global {
  interface Window {
    Spotify: typeof Spotify;
    onSpotifyWebPlaybackSDKReady: () => void;
  }

  namespace Spotify {
    class Player {
      constructor(options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      });

      connect(): Promise<boolean>;
      disconnect(): void;
      getCurrentState(): Promise<PlaybackState | null>;
      addListener(event: string, callback: (arg: any) => void): void;
      removeListener(event: string, callback: (arg: any) => void): void;
      togglePlay(): Promise<void>;
      nextTrack(): Promise<void>;
      previousTrack(): Promise<void>;
      setVolume: (volume: number) => Promise<void>;
      setSeek(): Promise<void>;
    }

    interface PlaybackState {
      context: {
        uri: string;
        metadata: any;
      };
      // Other properties according to Spotify's documentation
      track_window: {
        current_track: {
          artists: Array<{ name: string }>;
          name: string;
          duration_ms: number;
        };
        next_tracks: Array<any>;
      };
    }
  }
  interface Song {
    track: {
      name: string,
      uri: string,
      track: string,
      artists: [
        {
          name: string
        }
      ],
      duration_ms: number,
      id: string,
      is_playable: boolean
    },
    isLiked: boolean
  }
  interface Playlist {
    id: string,
    uri: string,
    name: string
  }
}


export {
  Spotify,
  Song,
  Playlist
};
