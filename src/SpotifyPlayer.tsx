import { useEffect, useState, useRef } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "./utils/utils";
import Player from "./components/Player/Player";

interface SpotifyPlayerProps {
  token: string | null;
}

function SpotifyPlayer({ token }: SpotifyPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const [currentTrack, setCurrentTrack] = useState("");
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  interface IDevice {
    device_id: string
  }

  useEffect(() => {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    scriptTag.async = true;

    document.head!.appendChild(scriptTag);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: "Spotify Custom",
        getOAuthToken: (cb) => { cb(token) },
        volume: 0.6
      });

      setPlayer(player);
      // console.log("player", player);
      // playerRef.current = player;

      player.addListener("ready", async (device:IDevice) => {
        console.log('Ready with Device ID', device.device_id);
        let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device.device_id });
        setIsDeviceConnected(isDeviceTransfered);
      });

      player.on('authentication_error', ({ message }) => {
        console.error('Failed to authenticate', message);
      });

      player.addListener('player_state_changed', updateState);

      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      })
    };

    return function cleanup() {
      player?.disconnect()
      playerRef.current?.disconnect();
      setPlayer(null);
    }

  }, []);

  const updateState = async (state) => {
    console.log("state updated", state);
    setIsPlaying(!state?.paused);
    const currentTrack = state.track_window.current_track;
    if (currentTrack) {
      const time = msToTime(currentTrack.duration_ms);
      const track = `${currentTrack.artists[0].name} - ${currentTrack.name} (${time})`;
      setCurrentTrack(track);
    }
  }

  const handleToggle = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const handleNext = async () => {
    if (player) {
      try {
        await player?.nextTrack();
      } catch (err) {
        console.log(err);
      }
    }
  }
    const handlePrev = async () => {
      if (player) {
        try {
          await player?.previousTrack();
        } catch (err) {
          console.log(err);
        }
      }
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
          />
      }
    </>
  );
}

export default SpotifyPlayer;
