import { useState } from "react";
import "./Tags.css";

const Tags = () => {
  const [filter, setFilter] = useState("top");

  const handleFilterClick = (e: MouseEvent<HTMLSpanElement>) => {
    console.log(e.target.id);
    setFilter(e.target.id)
  }

  return (
    <div className="tags-container">
      <span id="top" className={filter == "top" ? "active" : ""} onClick={handleFilterClick}>Top Results</span>
      <span id="artist" className={filter == "artist" ? "active" : ""} onClick={handleFilterClick}>Artist</span>
      <span id="track" className={filter == "track" ? "active" : ""} onClick={handleFilterClick}>Songs</span>
      <span id="album" className={filter == "album" ? "active" : ""} onClick={handleFilterClick}>Albums</span>
      <span id="playlist" className={filter == "playlist" ? "active" : ""} onClick={handleFilterClick}>Playlists</span>
      <span id="show" className={filter == "show" ? "active" : ""} onClick={handleFilterClick}>Shows</span>
      <span id="episode" className={filter == "episode" ? "active" : ""} onClick={handleFilterClick}>episode</span>
      <span id="audiobook" className={filter == "audiobook" ? "active" : ""} onClick={handleFilterClick}>audiobook</span>
    </div>
  )
}

export default Tags;
