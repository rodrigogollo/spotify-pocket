import { createContext, useContext } from "react";

export const SpotifyPlayerContext = createContext<Spotify.Player | null>(null);

export const useSpotifyPlayerContext = () => {

  const player = useContext(SpotifyPlayerContext);
  if (!player) {
    throw new Error("useSpotifyPlayerContext must be used with player"); 
  }
  return player;
}
