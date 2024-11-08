import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep, faShuffle } from '@fortawesome/free-solid-svg-icons'
import "./Player.css";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { invoke } from '@tauri-apps/api/core';
import useAuth from "../../hooks/useAuth";

const Player = () => {
  const { isPlaying,  currentTrack, player, setSeek, isPlayerReady, shuffle } = useSpotifyPlayerContext()
  const { token } = useAuth();

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
      } catch (err) {
        console.log("error next", err);
      }
    }
  };

  const handlePrev = async () => {
    if (player) {
      try {
        await player?.previousTrack();
        setSeek(0);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleShuffle = async () => {
    const isShuffle = await invoke<string>("toggle_shuffle", { accessToken: token, state: !shuffle });
    console.log(isShuffle);
  };

  return (
    <>
      <button id="next" onClick={handlePrev}>
        <FontAwesomeIcon icon={faBackwardStep} />
      </button>
      <button id="togglePlay" onClick={handleToggle}>
        <FontAwesomeIcon icon={isPlaying ? faCirclePause : faCirclePlay } />
      </button>
      <button id="next" onClick={handleNext}>
        <FontAwesomeIcon icon={faForwardStep} />
      </button>
      <button onClick={handleShuffle}>
        <FontAwesomeIcon icon={faShuffle} style={shuffle ? {color: "green"} : {}}/>
      </button>
      <p>{currentTrack}</p>
      <Volume />
      <Seek />
    </>
  )
}

export default Player;
