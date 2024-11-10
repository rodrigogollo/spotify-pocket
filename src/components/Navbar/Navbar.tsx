import "./Navbar.css";
import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
      <NavLink activeClassName="active" to={"/"}>Library</NavLink> 
    </nav>
  )
}
      // <NavLink activeClassName="active" to={"/playlists"}>Playlists</NavLink> 
      // <NavLink activeClassName="active" to={"/search"}>Search</NavLink> 

export default Navbar;
