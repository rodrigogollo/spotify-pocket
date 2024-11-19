import { useEffect, useState, useRef } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import { invoke } from "@tauri-apps/api/core";
import { useAuthContext } from "./Auth/AuthContext";

interface IDevice {
  device_id: string
}

const useSpotifyPlayerProvider = () => {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const {setToken, token, handleRefreshToken} = useAuthContext(); 
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const [seek, setSeek] = useState(0);
  const [maxSeek, setMaxSeek] = useState(0);
  const lastSeek = useRef(seek);
  const [volume, setVolume] = useLocalStorageState("volume", 0.5);
  const [shuffle, setShuffle] = useLocalStorageState("shuffle", false);
  const [repeat, setRepeat] = useLocalStorageState("repeat", false);
  const [currentUri, setCurrentUri] = useState();

  useEffect(() => {
    console.log("Updated token:", token);
    console.log("useSpotifyPlayerProvider token", token);
  }, [token]);

  useEffect(() => {
    let interval: any;
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

  }, [isPlaying, seek, maxSeek]);

  useEffect(() => {
    const setupPlayer = async () => {

      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
      scriptTag.async = true;

      scriptTag.onerror = () => console.error('Failed to load Spotify SDK script');
      document.head!.appendChild(scriptTag);

      window.onSpotifyWebPlaybackSDKReady = async () => {

        const player = new window.Spotify.Player({
          name: "Spotify-Lite Gollo",
          getOAuthToken: async (cb) => { 
            const newToken = await handleRefreshToken();
            cb(newToken);
          },
          volume: volume,
        });

        player.addListener("ready", (device:IDevice) => {
          console.log('Ready with Device ID', device.device_id);
          transferDevice(device);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID is not ready for playback', device_id);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate', message);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account', message);
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Failed to perform playback', message);
          // setIsDeviceConnected(false);
          // transferDevice(deviceRef.current);
        });

        player.addListener('player_state_changed', (state) => {
          updateState(state)
        });

        const success = await player.connect();
        if (success) {
          playerRef.current = player;
          console.log('The Web Playback SDK successfully connected to Spotify!');
        } 
      };
    }

    setupPlayer();

    const cleanupSpotifyElements = () => {
      console.log("cleanup spotify");
      const iframes = document.querySelectorAll('iframe[src*="sdk.scdn"]');
      iframes.forEach(iframe => iframe.remove());
      
      const scripts = document.querySelectorAll('script[src*="spotify-player"]');
      scripts.forEach(script => script.remove());
    };

    return function cleanup() {
      if (playerRef.current){
        playerRef.current?.disconnect()
      }
      cleanupSpotifyElements();
    }
  }, []);

  const transferDevice = async (device: IDevice) => {
      try {
        console.log("transferDevice", device.device_id);
        console.log(token)
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

  const updateState = async (state) => {
    console.log("updated state", state)
    if (state.position) {
      setSeek(state.position);
      lastSeek.current = state.position;
    }

    if (isPlayerReady != !state.loading){
      setIsPlayerReady(!state.loading)
    }

    setIsPlaying(!state?.paused);

    if (shuffle !== state.shuffle) {
      setShuffle(state.shuffle);
    }
    if (repeat !== state.repeat_mode) {
      setRepeat(state.repeat_mode);
    }

    const stateTrack = state?.track_window?.current_track;
    const stateUri = stateTrack?.uri;

    if (stateTrack && currentUri != stateUri) {
      setMaxSeek(stateTrack.duration_ms);
      setCurrentUri(stateTrack.uri);

      const newTrack = `${stateTrack.artists[0].name} - ${stateTrack.name}`;
      
      setCurrentTrack((prevTrack) => {
        if (prevTrack !== newTrack) {
          setSeek(0);
          lastSeek.current = 0;
          return newTrack;
        }
        return prevTrack;
      });
    }
  }

  return {
    player: playerRef.current,
    isPlayerReady,
    currentTrack, 
    isPlaying,
    shuffle,
    repeat,
    seek, 
    maxSeek, 
    volume,
    setSeek,
    setVolume, 
    currentUri,
    setCurrentUri
  }
}

// export default useSpotifyPlayerProvider;
