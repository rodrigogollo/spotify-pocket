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
      // <NavLink activeClassName="active" to={"/playlists"}>Playlists</NavLink> 
      // <NavLink activeClassName="active" to={"/search"}>Search</NavLink> 

export default Navbar;
