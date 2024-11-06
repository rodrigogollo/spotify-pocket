import { useEffect, useState, useRef } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import useAuth from "./useAuth";
import { invoke } from "@tauri-apps/api/core";
import { msToTime } from "../utils/utils";

interface IDevice {
  device_id: string
}

const useSpotifyPlayerProvider = () => {

  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [token, isUserLogged, handleLoginSpotify, handleRefreshToken] = useAuth(); 
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const [seek, setSeek] = useState(0);
  const [maxSeek, setMaxSeek] = useState(0);
  const lastSeek = useRef(seek);
  const [volume, setVolume] = useLocalStorageState("volume", 0.5);

  useEffect(() => {
    console.log("setup player");

    const setupPlayer = async () => {

      const volume = 0.5;
      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
      scriptTag.async = true;

      scriptTag.onerror = () => console.error('Failed to load Spotify SDK script');
      document.head!.appendChild(scriptTag);

      const transferDevice = async (device: IDevice) => {
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
      }

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

        player.addListener("ready", (device:IDevice) => {
          console.log('Ready with Device ID', device.device_id);
          transferDevice(device);
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

    const cleanupSpotifyElements = () => {
      console.log("cleanup spotify");
      const iframes = document.querySelectorAll('iframe[src*="sdk.scdn"]');
      iframes.forEach(iframe => iframe.remove());
      
      const scripts = document.querySelectorAll('script[src*="spotify-player"]');
      scripts.forEach(script => script.remove());
    };

    return function cleanup() {
      player?.disconnect()
      // playerRef.current?.disconnect();
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

  return {
    isPlaying, 
    currentTrack, 
    maxSeek,
    seek,
    setSeek,
    player,
    volume,
    setVolume
  }
}

export default useSpotifyPlayerProvider;
