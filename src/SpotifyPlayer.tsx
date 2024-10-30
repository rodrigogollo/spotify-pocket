import { useEffect, useState, useRef } from "react";
import "./App.css";
import { invoke } from '@tauri-apps/api/core';
import { msToTime } from "./utils/utils";

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
  token: string | null;
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
  //
  interface IDevice {
    device_id: string
  }
  
  const onDeviceReady = async (device: IDevice) => {
    console.log('Ready with Device ID', device.device_id);
    console.log('token', token);
    let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device.device_id });
    setIsDeviceConnected(isDeviceTransfered);
  }

  useEffect(() => {
    console.log("rerendering player", token);

    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    scriptTag.async = true;
    document.head!.appendChild(scriptTag);

    if (token) {
      let player = new window.Spotify.Player({
        name: "Spotify Custom",
        getOAuthToken: (cb) => {cb(token)},
        volume: 0.6
      });

      player.addListener("ready", onDeviceReady);
      playerRef.current = player;
      playerRef.current.connect();
    }

    return function cleanup() {
      playerRef.current?.disconnect();
    }

  }, []);

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
