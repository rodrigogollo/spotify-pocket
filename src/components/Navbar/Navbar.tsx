import "./Navbar.css";
import { NavLink } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faRefresh } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
  return (
    <nav>
      <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={"/"}>
        <p>Library</p>
      </NavLink> 
      <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={"/playlists"}>
        <p>Playlists</p>
      </NavLink> 
      <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={"/search"}>
        <p>Search</p>
      </NavLink> 
      <div className="options">
        <span id="refresh" title="Refresh" onClick={() => window.location.reload()}>
          <FontAwesomeIcon icon={faRefresh} size="sm"/>
        </span> 
        <NavLink id="settings" title="Settings" className={({ isActive }) => (isActive ? 'active' : '')} to={"/settings"}>
          <FontAwesomeIcon icon={faCog} size="sm" />
        </NavLink> 
      </div>
    </nav>
  )
}

export default Navbar;
