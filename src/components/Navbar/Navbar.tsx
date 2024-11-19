import "./Navbar.css";
import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
      <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={"/"}>Library</NavLink> 
      <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to={"/playlists"}>Playlists</NavLink> 
    </nav>
  )
}

export default Navbar;
