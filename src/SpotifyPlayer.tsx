import { useEffect, useState, useRef } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "./utils/utils";
import Player from "./components/Player/Player";
import useLocalStorageState from "./hooks/useLocalStorageState";

interface SpotifyPlayerProps {
  token: string | null;
  refreshToken: any;
}

function SpotifyPlayer({ token, refreshToken }: SpotifyPlayerProps) {
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
    // Remove any existing iframes
    const iframes = document.querySelectorAll('iframe[src*="sdk.scdn"]');
    iframes.forEach(iframe => iframe.remove());
    
    // Remove any existing script tags
    const scripts = document.querySelectorAll('script[src*="spotify-player"]');
    scripts.forEach(script => script.remove());
  };

  useEffect(() => {
    cleanupSpotifyElements()

    const setupPlayer = async () => {
      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
      scriptTag.async = true;

      scriptTag.onerror = () => {
        console.error('Failed to load Spotify SDK script');
      };


      document.head!.appendChild(scriptTag);

      window.onSpotifyWebPlaybackSDKReady = async () => {

        const player = new window.Spotify.Player({
          name: "Spotify-Lite Gollo",
          getOAuthToken: (cb) => { cb(token) },
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

        // TODO: test/fix
        player.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate', message);
          refreshToken();
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
          refreshToken();
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account', message);
          refreshToken();
        });

        player.addListener('player_state_changed', updateState);

        const success = await player.connect();
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        } 
      };
    }

    setupPlayer();

    return function cleanup() {
      player?.disconnect()
      playerRef.current?.disconnect();
      setPlayer(null);
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

  const handleToggle = async () => {
    try {
      if (player) {
        await player.togglePlay();
      }
    } catch (err) {
      console.log("erro toggle", err);
    }
  };

  const handleNext = async () => {
    if (player) {
      try {
        await player?.nextTrack();
        setSeek(0);
        lastSeek.current = 0;
      } catch (err) {
        console.log(err);
      }
    }
  }

  const handlePrev = async () => {
    if (player) {
      try {
        await player?.previousTrack();
        setSeek(0);
        lastSeek.current = 0;
      } catch (err) {
        console.log(err);
      }
    }
  }

  const handleVolumeChange = (event) => {
    let vol = event.target.value / 100;
    console.log("volume to set", vol);
    player
      .setVolume(vol)
      .then(() => console.log("Volume updated!"));
    setVolume(vol);
  }

  const handleSeek = (event) => {
    let seek = event.target.value;
    lastSeek.current = seek;
    setSeek(seek);
    console.log("seek", seek)
    player.seek(seek)
      .then(() =>  console.log('Changed position!'));
  }

  return (
    <>
      {
        isDeviceConnected && 
          <Player 
            handleNext={handleNext} 
            handlePrev={handlePrev} 
            handleToggle={handleToggle} 
            isPlaying={isPlaying} 
            currentTrack={currentTrack} 
            volume={volume * 100} 
            handleVolumeChange={handleVolumeChange} 
            handleSeek={handleSeek} 
            max={maxSeek} 
            seek={seek}
          />
      }
    </>
  );
}

export default SpotifyPlayer;
