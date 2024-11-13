import "./Controller.css";
import { useSpotifyPlayerContext } from "../../hooks/SpotifyPlayerContext";
import useAuth from "../../hooks/useAuth";
import { invoke } from "@tauri-apps/api/core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faCirclePause, faForwardStep, faBackwardStep, faShuffle, faRepeat } from '@fortawesome/free-solid-svg-icons'

const Controller = () => {
  const { 
    isPlaying,  
    player, 
    setSeek, 
    shuffle, 
    repeat 
  } = useSpotifyPlayerContext();

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
    <div className="controls">
      <button id="next" onClick={handlePrev}>
        <FontAwesomeIcon icon={faBackwardStep} size="2xl" />
      </button>
      <button id="togglePlay" onClick={handleToggle}>
        <FontAwesomeIcon icon={isPlaying ? faCirclePause : faCirclePlay } size="2xl" />
      </button>
      <button id="next" onClick={handleNext}>
        <FontAwesomeIcon icon={faForwardStep} size="2xl"/>
      </button>
      <button onClick={handleShuffle}>
        <FontAwesomeIcon icon={faShuffle} className={shuffle ? "active": ""} size="2xl"/>
      </button>
      <button onClick={handleRepeat}>
        <FontAwesomeIcon icon={faRepeat} className={repeat == 1 ? "active" : repeat == 2 ? "active2": ""} size="2xl"/>
      </button>
    </div>
  )
}

export default Controller; 
