import { createContext, useContext } from "react";

interface SpotifyPlayerContextType {
  player: Spotify.Player | null;
  isPlaying: boolean;
  currentTrack: string;
  maxSeek: number;
  seek: number;
  setSeek: (seek: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isPlayerReady: boolean;
  device: string;
  shuffle: boolean;
  currentUri: string;
  repeat: string;
}

export const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(null);

export const useSpotifyPlayerContext = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error("useSpotifyPlayerContext must be used within SpotifyPlayerProvider");
  }
  return context;
};
