import Volume from "../Volume/Volume";
import Seek from "../Seek/Seek";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep, faShuffle, faRepeat } from '@fortawesome/free-solid-svg-icons'
import "./Player.css";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import { invoke } from '@tauri-apps/api/core';
import useAuth from "../../hooks/useAuth";

const Player = () => {
  const { isPlaying,  currentTrack, player, setSeek, isPlayerReady, shuffle, seek, maxSeek, trackNum, repeat } = useSpotifyPlayerContext()
  const { tokenRef } = useAuth();

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
    const isShuffle = await invoke<string>("toggle_shuffle", { accessToken: tokenRef.current, state: !shuffle });
    console.log(isShuffle);
  };

  const handleRepeat = async () => {
    const state = repeat == 0 ? 1 : repeat == 1 ? 2 : 0;
    await invoke<string>("toggle_repeat", { accessToken: tokenRef.current, state: state });
  };

  return (
    <div className="player">
      <h3 className="track">{trackNum} {currentTrack}</h3>
      <div className="times">
        <Seek />
        <Volume />
      </div>
      <div className="controls">
        <button id="next" onClick={handlePrev}>
          <FontAwesomeIcon icon={faBackwardStep} size="xl" />
        </button>
        <button id="togglePlay" onClick={handleToggle}>
          <FontAwesomeIcon icon={isPlaying ? faCirclePause : faCirclePlay } size="xl" />
        </button>
        <button id="next" onClick={handleNext}>
          <FontAwesomeIcon icon={faForwardStep} size="xl"/>
        </button>
        <button onClick={handleShuffle}>
          <FontAwesomeIcon icon={faShuffle} className={shuffle ? "active": ""} size="xl"/>
        </button>
        <button onClick={handleRepeat}>
          <FontAwesomeIcon icon={faRepeat} className={repeat == 1 ? "active" : repeat == 2 ? "active2": ""} size="xl"/>
        </button>
      </div>
    </div>
  )
}

export default Player;
