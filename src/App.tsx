import { useEffect, useState } from "react";
import "./App.css";
import { useSpotifyWebPlaybackSdk } from "./hooks/useSpotifyWebPlaybackSDK";
import { invoke } from '@tauri-apps/api/core';
import { once } from '@tauri-apps/api/event';

interface LoadedPayload {
  loggedIn: boolean,
  token: string
}

let token: string = "";
const unlisten = await once<LoadedPayload>('loaded', (event) => {
  console.log(`app is loaded, loggedIn: ${event.payload.loggedIn}, token ${event.payload.token}`);
  token = event.payload.token;
});
unlisten();

async function getToken() {
  try {
    const token: string = await invoke('get_token')
    console.log('Token:', token)
    return token;
  } catch (error) {
    console.error('Error fetching token:', error)
  }
}

async function loginSpotify() {
  invoke("initiate_spotify_auth")
    .then((code) => {
      console.log("spotify login initiated.");
      console.log("code", code);
    })
    .catch((error) => {
      console.log("failed to initiate spotify login", error);
    })
}

function App() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    if (token == "") {
      const fetchToken = async ():Promise<any> =>  {
        const data = getToken();
        return data;
      }
      fetchToken()
        .then((data: string) => setToken(data))
        .catch(console.error);
    }
  }, []);

  const { player, isReady } = useSpotifyWebPlaybackSdk({
    name: 'Spotify-Lite Gollo',
    getOAuthToken: async () => await getToken(),
    onReady: (deviceId) => console.log('Ready with Device ID', deviceId),
    accountError: (e) => console.error('Account error', e),
    onPlayerStateChanged: (state: any) => console.log('Player state changed', state),
  });

  const handleToggle = () => {
    if (player && isReady) {
      player.togglePlay();
      player.getCurrentState().then((state: any) => {
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          return;
        }

        const current_track = state.track_window.current_track;
        const time = msToTime(current_track.duration_ms);
        const track = `${current_track.artists[0].name} - ${current_track.name} (${time})`;

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
      <p>Test Rodrigo</p>
      <button id="togglePlay" onClick={handleToggle}>Toggle Play</button>
      <button id="login" onClick={loginSpotify}>Login</button>
    </div>
  );
}

export default App;
