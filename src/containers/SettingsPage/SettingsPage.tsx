import "./SettingsPage.css"
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router";
import { useAuthStore } from "../../stores/authStore";
import { useSpotifyStore } from "../../stores/spotifyStore";

const SettingsPage = () => {
  const navigate = useNavigate();
  const resetAuthStore = useAuthStore((state) => state.reset);
  const resetSpotifyStore = useSpotifyStore((state) => state.reset);

  const handleLogOut = async () => {
    await invoke<string>("user_log_out");
    localStorage.clear();
    resetSpotifyStore();
    resetAuthStore();
    navigate("/login");
  }

  return (
    <div className="settings-container">
      <button onClick={handleLogOout}>Log Out</button>
    </div>
  )
}

export default SettingsPage;
