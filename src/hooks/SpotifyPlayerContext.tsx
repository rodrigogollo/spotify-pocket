import { createContext } from "react";

export const SpotifyPlayerContext = createContext<Spotify.Player | null>(null);
