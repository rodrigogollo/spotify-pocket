import "./LoginPage.css";
import { useAuthStore } from "../../stores/authStore";
import { useState } from "react";
import Loading from "../../components/Loading/Loading";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const isUserLogged = useAuthStore((state) => state.isUserLogged);
  const handleLoginSpotify = useAuthStore.getState().handleLoginSpotify
  const [isLoading, setIsLoading] = useState(isUserLogged);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    handleLoginSpotify()
    setIsLoading(true);
  }

  useEffect(() => {
    if (isUserLogged) {
      setIsLoading(true)
      navigate("/");
    }
  }, [isUserLogged])

  return (
    <div className="login">
      {
        isLoading ? <Loading /> :
          <button id="login" onClick={handleLoginClick}>Log In</button>
      }
    </div>
  )
}

export default LoginPage;
