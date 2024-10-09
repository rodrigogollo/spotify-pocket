import "./App.css";
import { useSpotifyWebPlaybackSdk } from "./hooks/useSpotifyWebPlaybackSDK";

const token = 'BQB2_WVsqpS5ZgyBE-5NdlEMfceYHXr7uFA7jfrm3q0IuRlgXfHt4LhG4EjI6W42m9g1lTQbJKzROWhPzUkhRIJeZHwoU8zQtZg3ALevvxnAPUUaizGdUEthSR6M-4C8X7lsSBjpfLxJj66x3JM2HfJWAMTI0Cl9ZfUKHeA0BskYTyPuOvGNy1H9dM2nXcom-KH4yP8zYoTNLQ';
 
function App() {
  const { player, isReady } = useSpotifyWebPlaybackSdk({
    name: 'Spotify-Lite Gollo',
    getOAuthToken: async () => token,
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
    </div>
  );
}

export default App;
