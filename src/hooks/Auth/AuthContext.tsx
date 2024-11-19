import { createContext, useContext } from "react";

interface AuthContextType {
  token: string | null;
  isUserLogged: boolean;
  setToken: any;
  handleLoginSpotify: any;
  handleRefreshToken: any;
}

export const AuthContext = createContext<AuthContextType>({
  token: null, 
  isUserLogged: false,
  setToken: () => {},
  handleLoginSpotify: () => {},
  handleRefreshToken: () => {},
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthContext must be used within AuthProvider");
  }
  return context;
};
