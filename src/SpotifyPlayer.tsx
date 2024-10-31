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
  const [volume, setVolume] = useState(0.55);
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
          console.log("last seek", lastSeek.current);
          const newSeek = Number(lastSeek.current) + 1000;
          console.log("new seek", newSeek);
          lastSeek.current = newSeek;
          return newSeek;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);

  }, [isPlaying]);

  useEffect(() => {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    scriptTag.async = true;

    document.head!.appendChild(scriptTag);

    window.onSpotifyWebPlaybackSDKReady = () => {

      const player = new window.Spotify.Player({
        name: "Spotify Custom",
        getOAuthToken: (cb) => { cb(token) },
        volume: volume
      });

      setPlayer(player);

      player.addListener("ready", async (device:IDevice) => {
        console.log('Ready with Device ID', device.device_id);
        let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device.device_id });
        setIsDeviceConnected(isDeviceTransfered);
      });

      // TODO: test/fix
      player.addListener('authentication_error', ({ message }) => {
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
    const current_track = state.track_window.current_track;
    let track;
    if (current_track) {
      setMaxSeek(current_track.duration_ms);
      const time = msToTime(current_track.duration_ms);
      track = `${current_track.artists[0].name} - ${current_track.name} (${time})`;
      console.log("theres track", track);
      setCurrentTrack((prevTrack) => {
        if (prevTrack != track) {
          setSeek(0);
          lastSeek.current = 0;
        }
        return track;
      });
    }

    console.log("state track", currentTrack);
    console.log("track", track);
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
