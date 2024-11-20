import "./LoginPage.css";
import { useAuthStore } from "../../stores/authStore";

const LoginPage = () => {
  const handleLoginSpotify = useAuthStore.getState().handleLoginSpotify
  return <div className="login">
    <button id="login" onClick={handleLoginSpotify}>Log In</button>
  </div>
}

export default LoginPage;
