import { useEffect, useState, useRef, useContext } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "./utils/utils";
import Player from "./components/Player/Player";
import useLocalStorageState from "./hooks/useLocalStorageState";

import { SpotifyPlayerContext } from "./hooks/SpotifyPlayerContext";

interface SpotifyPlayerProps {
  token: string | null;
  handleRefreshToken: any;
}

function SpotifyPlayer({ token, handleRefreshToken }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const [currentTrack, setCurrentTrack] = useState("");
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorageState("volume", 0.5);
  const [seek, setSeek] = useState(0);
  const [maxSeek, setMaxSeek] = useState(0);
  const lastSeek = useRef(seek);

  interface IDevice {
    device_id: string
  }

  useEffect(() => {
    let interval;
    let isFinished = Number(seek) >= Number(maxSeek);
    if (isPlaying && !isFinished) {
      interval = setInterval(() => {
        setSeek(() => {
          const newSeek = Number(lastSeek.current) + 1000;
          lastSeek.current = newSeek;
          return newSeek;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);

  }, [isPlaying]);


  const cleanupSpotifyElements = () => {
    console.log("cleanup spotify");
    const iframes = document.querySelectorAll('iframe[src*="sdk.scdn"]');
    iframes.forEach(iframe => iframe.remove());
    
    const scripts = document.querySelectorAll('script[src*="spotify-player"]');
    scripts.forEach(script => script.remove());
  };

  useEffect(() => {
    console.log("setup player");

    const setupPlayer = async () => {

      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
      scriptTag.async = true;

      scriptTag.onerror = () => console.error('Failed to load Spotify SDK script');
      document.head!.appendChild(scriptTag);

      window.onSpotifyWebPlaybackSDKReady = async () => {

        const player = new window.Spotify.Player({
          name: "Spotify-Lite Gollo",
          getOAuthToken: (cb) => { 
            try {
              return cb(token) 
            } catch (err) {
              console.log("erro get oauth", err);
            }
          },
          volume: volume
        });

        setPlayer(player);

        player.addListener("ready", async (device:IDevice) => {
          console.log('Ready with Device ID', device.device_id);
          try {
            if (!isDeviceConnected) {
              let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device.device_id });
              setIsDeviceConnected(isDeviceTransfered);
              console.log("Device successfully transfered");
            } else {
              console.log("Device already transfered");
            }
          } catch (err) {
            console.log("Error transfering device", err);
          }
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate', message);
          handleRefreshToken();
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
          handleRefreshToken();
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account', message);
          handleRefreshToken();
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Failed to perform playback', message);
          handleRefreshToken();
        });

        player.addListener('player_state_changed', updateState);

        const success = await player.connect();
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        } 
      };
    }

    if (token) {
      setupPlayer();
    }

    return function cleanup() {
      player?.disconnect()
      playerRef.current?.disconnect();
      setPlayer(null);
      cleanupSpotifyElements();
    }
  }, [token]);


  const updateState = async (state) => {
    console.log("state changed", state);
    setIsPlaying(!state?.paused);
    const current_track = state.track_window.current_track;
    let track;
    if (current_track) {
      setSeek(state.position);
      lastSeek.current = state.position;
      setMaxSeek(current_track.duration_ms);
      const time = msToTime(current_track.duration_ms);
      track = `${current_track.artists[0].name} - ${current_track.name} (${time})`;
      setCurrentTrack((prevTrack) => {
        if (prevTrack != track) {
          setSeek(0);
          lastSeek.current = 0;
        }
        return track;
      });
    }
  }



  return (
    <>
      {
        isDeviceConnected && 
          <Player 
            player={player}
            isPlaying={isPlaying} 
            currentTrack={currentTrack} 
            handleSeek={handleSeek} 
            max={maxSeek} 
            seek={seek}
          />
      }
    </>
  );
}

export default SpotifyPlayer;
