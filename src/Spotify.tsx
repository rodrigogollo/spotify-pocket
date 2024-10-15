import { useEffect, useState, useRef } from "react";
import "./App.css";
import { useSpotifyWebPlaybackSdk } from "./hooks/useSpotifyWebPlaybackSDK";
import { invoke } from '@tauri-apps/api/core';

// async function getToken() {
//   try {
//     const token: string = await invoke('get_token')
//     console.log('Token:', token)
//     return token;
//   } catch (error) {
//     console.error('Error fetching token:', error)
//   }
// }
interface SpotifyPlayerProps {
  token: string;
}
function SpotifyPlayer({ token }: SpotifyPlayerProps) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [currentTrack, setCurrentTrack] = useState("");
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);

  // useEffect(() => {
  //   if (token == "") {
  //     const fetchToken = async ():Promise<any> =>  {
  //       const data = getToken();
  //       return data;
  //     }
  //     fetchToken()
  //       .then((data: string) => setToken(data))
  //       .catch(console.error);
  //   }
  // }, []);
  //

  // const getOAuthToken = async (): Promise<string> => {
  //   console.log("rendering player");
  //   let token = localStorage.getItem("token"); 
  //   if (token != null) {
  //     console.log("token recebido getOauth", token);
  //     return token; 
  //   }
  //   throw new Error('Token não disponível no momento.');
  // };
  
  const onDeviceReady = async (deviceId: string) => {
    console.log('Ready with Device ID', deviceId);
    console.log('token', token);
    let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: deviceId });
    setIsDeviceConnected(isDeviceTransfered);
  }

  const { player } = useSpotifyWebPlaybackSdk({
    name: 'Spotify-Lite Gollo',
    getOAuthToken: () => Promise.resolve(token),
    onReady: (deviceId) => onDeviceReady(deviceId),
    accountError: (e) => console.error('Account error', e),
    onPlayerStateChanged: (state: any) => console.log('Player state changed', state),
  });

  useEffect(() => {
    console.log("rerendering player");
    if (player && token !== null) {
      playerRef.current = player;
      console.log(playerRef);
    }
  }, [token, player]);

  const handleToggle = () => {
    if (playerRef.current != null) {
      playerRef.current.togglePlay();
      playerRef.current.getCurrentState().then((state: any) => {
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          return;
        }

        const current_track = state.track_window.current_track;
        const time = msToTime(current_track.duration_ms);
        const track = `${current_track.artists[0].name} - ${current_track.name} (${time})`;
        setCurrentTrack(track);

        console.log('Current', current_track);
        console.log('Currently Playing', track);
      });
    }
  };

  const msToTime = (duration: number) => {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let hours_str = hours < 10 ? "0" + hours : String(hours);
    let minutes_str = minutes < 10 ? "0" + minutes : minutes;
    let seconds_str = seconds < 10 ? "0" + seconds : seconds;

    return hours_str === "00" ? `${minutes_str}:${seconds_str}` : `${hours}:${minutes_str}:${seconds_str}`;
  }

  return (
    <div className="container">
      {
        isDeviceConnected && <>
          <button id="togglePlay" onClick={handleToggle}>Toggle Play</button>
          <p>Track: {currentTrack}</p>
        </>
      }
    </div>
  );
}

export default SpotifyPlayer;
