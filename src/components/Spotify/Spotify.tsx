import { useEffect, useState } from "react";
import { useSpotifyStore } from "../../stores/spotifyStore";
import { useAuthStore } from "../../stores/authStore";

interface IDevice {
  device_id: string
}

export const Spotify = () => {
  const token = useAuthStore.getState().token;
  const handleRefreshToken = useAuthStore.getState().handleRefreshToken;
  const isPlaying = useSpotifyStore.getState().isPlaying;
  const seek = useSpotifyStore.getState().seek;
  const maxSeek = useSpotifyStore.getState().maxSeek;
  const volume = useSpotifyStore.getState().volume;
  const updateState = useSpotifyStore.getState().updateState;
  const transferDevice = useSpotifyStore.getState().transferDevice;

  useEffect(() => {
    console.log("useSpotifyPlayerProvider token", token);
  }, [token]);

  useEffect(() => {
    let interval: any;
    let isFinished = Number(seek) >= Number(maxSeek);

    if (isPlaying && !isFinished) {
      interval = setInterval(() => {
		useSpotifyStore.setState((store) => ({ seek: store.seek + 1000 }));
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
          // playerRef.current = player;
			useSpotifyStore.setState({ player: player });
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
      // if (playerRef.current){
      //   playerRef.current?.disconnect()
      // }
      cleanupSpotifyElements();
    }
  }, []);

	return null;

  // const transferDevice = async (device: IDevice) => {
  //     try {
  //       console.log("transferDevice", device.device_id);
  //       console.log(token)
  //       if (!isDeviceConnected) {
  //         let isDeviceTransfered: boolean = await invoke('transfer_playback', { accessToken: token, deviceId: device.device_id });
  //         setIsDeviceConnected(isDeviceTransfered);
  //         console.log("Device successfully transfered");
  //       } else {
  //         console.log("Device already transfered");
  //       }
  //     } catch (err) {
  //       console.log("Error transfering device", err);
  //     }
  // }

  // return {
  //   player,
  //   isPlayerReady,
  //   currentTrack, 
  //   isPlaying,
  //   shuffle,
  //   repeat,
  //   seek, 
  //   maxSeek, 
  //   volume,
  //   setSeek,
  //   setVolume, 
  //   currentUri,
  //   setCurrentUri
  // }
}

// export default Spotify;
