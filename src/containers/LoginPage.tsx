import { useAuthStore } from "../stores/authStore";

const LoginPage = () => {
  const handleLoginSpotify = useAuthStore.getState().handleLoginSpotify
  return <>
    <button id="login" onClick={handleLoginSpotify}>Login</button>
  </>
}

export default LoginPage;
