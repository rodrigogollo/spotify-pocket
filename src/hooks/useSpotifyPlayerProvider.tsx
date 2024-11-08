import { useEffect, useState, useRef, useCallback } from "react";
import useLocalStorageState from "../hooks/useLocalStorageState";
import useAuth from "./useAuth";
import { invoke } from "@tauri-apps/api/core";
import { msToTime } from "../utils/utils";

interface IDevice {
  device_id: string
}

const useSpotifyPlayerProvider = () => {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { token, setToken, tokenRef } = useAuth(); 
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const deviceRef = useRef<String | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState("");
  const [seek, setSeek] = useState(0);
  const [maxSeek, setMaxSeek] = useState(0);
  const lastSeek = useRef(seek);
  const [volume, setVolume] = useLocalStorageState("volume", 0.5);
  const [shuffle, setShuffle] = useLocalStorageState("shuffle", false);

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


  // useEffect(() => {
  //   console.log("state", {
  //     player: playerRef.current,
  //     isPlayerReady,
  //     token,
  //     isDeviceConnected,
  //     isPlaying,
  //     currentTrack,
  //     seek,
  //     volume
  //   })
  // }, [playerRef.current, isPlayerReady, token, isDeviceConnected, isPlaying, currentTrack, seek, volume])

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
            console.log("getOAuthToken");
            const newToken = await handleRefreshToken();
            cb(newToken);
          },
          volume: volume,
        });

        player.addListener("ready", (device:IDevice) => {
          console.log('Ready with Device ID', device.device_id);
          deviceRef.current = device;
          transferDevice(device);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID is not ready for playback', device_id);
          setIsPlayerReady(false);
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
          console.log(deviceRef.current);
          setIsDeviceConnected(false);
          transferDevice(deviceRef.current);
        });

        player.addListener('player_state_changed', updateState);

        const success = await player.connect();
        if (success) {
          playerRef.current = player;
          console.log('The Web Playback SDK successfully connected to Spotify!');
        } 
      };
    }

    setupPlayer()

    // if (token) {
    //   setupPlayer();
    // } else {
    //   console.log("no token, no render")
    // }

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

  // useEffect(() => {
  //   const player = playerRef.current;
  //   if (player) {
  //     player.addListener("ready", (device:IDevice) => {
  //       console.log('Ready with Device ID', device.device_id);
  //       transferDevice(device);
  //     });
  //
  //     player.addListener('authentication_error', ({ message }) => {
  //       console.error('Failed to authenticate', message);
  //     });
  //
  //     player.addListener('initialization_error', ({ message }) => {
  //       console.error('Failed to initialize', message);
  //     });
  //
  //     player.addListener('account_error', ({ message }) => {
  //       console.error('Failed to validate Spotify account', message);
  //     });
  //
  //     player.addListener('playback_error', ({ message }) => {
  //       console.error('Failed to perform playback', message);
  //     });
  //
  //     player.addListener('player_state_changed', updateState);
  //   }
  //
  // }, [])

   // useEffect(() => {
   //    if (isPlayerReady) {
   //      console.log("player ready, connecting")
   //      const player = playerRef.current;
   //      player.connect().then(success => {
   //        if (success) {
   //          console.log('The Web Playback SDK successfully connected to Spotify!');
   //        }
   //      })
   //    }
   //  }, [isPlayerReady]);


  const transferDevice = async (device: IDevice) => {
      try {
        console.log(isDeviceConnected);
        if (!isDeviceConnected) {
          console.log("token to transfer", tokenRef.current);
          // const currentToken = localStorage.getItem("token");
          // console.log("token storage", currentToken);
          let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: tokenRef.current, deviceId: device.device_id });
          setIsDeviceConnected(isDeviceTransfered);
          console.log("Device successfully transfered");
        } else {
          console.log("Device already transfered");
        }
      } catch (err) {
        console.log("Error transfering device", err);
      }
  }

  const handleRefreshToken = async () => {
    try {
      const newToken = await invoke<string>("refresh_token");
      console.log("New token generated:", newToken);
      setToken(newToken);
      tokenRef.current = newToken;
      return newToken;
    } catch (err) {
      console.log("Failed to refresh token", err);
      return "";
    }
  }

  const updateState = async (state) => {
    console.log("state changed", state);
    setIsPlayerReady(!state.loading);
    setIsPlaying(!state?.paused);
    setShuffle(state.shuffle);

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
    player: playerRef.current,
    volume,
    setVolume,
    isPlayerReady,
    device: deviceRef.current,
    shuffle
  }
}

export default useSpotifyPlayerProvider;
