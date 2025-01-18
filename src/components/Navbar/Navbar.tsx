import "./Navbar.css";
import { NavLink } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faRefresh, faMagnifyingGlass, faHeart, faCompactDisc, faPieChart } from '@fortawesome/free-solid-svg-icons'

const Navbar = () => {
  return (
    <nav>
      <NavLink title="Library" className={({ isActive }) => (isActive ? 'active' : '')} to={"/"}>
        <FontAwesomeIcon className="icon" icon={faHeart} size="lg"/>
      </NavLink> 
      <NavLink title="Playlists" className={({ isActive }) => (isActive ? 'active' : '')} to={"/playlists"}>
        <FontAwesomeIcon className="icon" icon={faCompactDisc} size="lg"  />
      </NavLink> 
      <NavLink title="Search" className={({ isActive }) => (isActive ? 'active' : '')} to={"/search"}>
        <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} size="lg" />
      </NavLink> 
      <div className="options">
        <span id="refresh" title="Refresh" onClick={() => window.location.reload()}>
          <FontAwesomeIcon icon={faRefresh} size="lg"/>
        </span> 
        <NavLink id="settings" title="Settings" className={({ isActive }) => (isActive ? 'active' : '')} to={"/settings"}>
          <FontAwesomeIcon icon={faCog} size="lg" />
        </NavLink> 
        <NavLink id="settings" title="Top Items" className={({ isActive }) => (isActive ? 'active' : '')} to={"/chart"}>
          <FontAwesomeIcon icon={faPieChart} size="lg" />
        </NavLink> 
      </div>
    </nav>
  )
}

export default Navbar;
