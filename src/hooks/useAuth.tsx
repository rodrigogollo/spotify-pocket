import { useEffect, useState } from "react";

interface LoadedPayload {
  logged: boolean,
  access_token: string
}

const useAuth = () => {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const unlisten = listen<LoadedPayload>('loaded', (event) => {
      console.log(`app is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`);
      setToken(event.payload.access_token);
      localStorage.setItem("token", event.payload.access_token);
      setIsUserLogged(true);
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  return { token };
}

export default useAuth;
