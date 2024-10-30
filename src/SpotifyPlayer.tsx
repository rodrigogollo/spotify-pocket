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

  const handleToggle = () => {
    if (player) {
      player.togglePlay();
      player.getCurrentState().then((state: any) => {
        console.log("current state", state)
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          setIsPlaying(false);
          return;
        }
        setIsPlaying(state.paused);

        const current_track = state.track_window.current_track;
        const time = msToTime(current_track.duration_ms);
        const track = `${current_track.artists[0].name} - ${current_track.name} (${time})`;
        setCurrentTrack(track);

        console.log('Current', current_track);
        console.log('Currently Playing', track);
      });
    }
  };

  return (
    <>
      {
        isDeviceConnected && 
          <Player handleToggle={handleToggle} isPlaying={isPlaying} currentTrack={currentTrack} />
      }
    </>
  );
}

export default SpotifyPlayer;
