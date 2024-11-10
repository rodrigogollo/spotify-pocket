import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const { handleLoginSpotify } = useAuth();
  return <>
    <button id="login" onClick={handleLoginSpotify}>Login</button>
  </>
}

export default LoginPage;
