import "./Navbar.css";
import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
      <Link to={"/"}>Library</Link> 
      <Link to={"/playlists"}>Playlists</Link> 
      <Link to={"/search"}>Search</Link> 
    </nav>
  )
}

export default Navbar;
