// import { useEffect, useState, useCallback, useRef, useMemo, Children } from "react";
// import { listen } from '@tauri-apps/api/event';
// import { invoke } from '@tauri-apps/api/core';
// import useLocalStorageState from "./useLocalStorageState";
//
// interface LoadedPayload {
//   logged: boolean,
//   access_token: string
// }
//
// const useAuth = () => {
//   const [token, setToken] = useLocalStorageState("token", null);
//   const tokenRef = useRef<String | null>(token);
//   const [isUserLogged, setIsUserLogged] = useState(() => {
//     let token = localStorage.getItem("token");
//     return token != null; 
//   });
//
//   useEffect(() => {
//     tokenRef.current = token; // Keep tokenRef in sync with token
//   }, [token]);
//
//   useEffect(() => {
//     const unlisten = listen<LoadedPayload>('loaded', (event) => {
//       console.log(`app is loaded, loggedIn: ${event.payload.logged}, token: ${event.payload.access_token}`);
//       setToken(event.payload.access_token);
//       tokenRef.current = event.payload.access_token;
//       setIsUserLogged(true);
//     });
//
//     return () => {
//       unlisten.then(f => f());
//     };
//   }, []);
//
//   const handleLoginSpotify = async () => {
//     try {
//       await invoke("initiate_spotify_auth");
//       console.log("spotify login initiated.")
//       setIsUserLogged(true);
//     } catch (err) {
//       console.log("failed to initiate spotify login", err);
//     }
//   }
//
//   const handleRefreshToken = async () => {
//     try {
//       const newToken = await invoke<string>("refresh_token");
//       console.log("New token generated:", newToken);
//       setToken(newToken);
//       return newToken;
//     } catch (err) {
//       console.log("Failed to refresh token", err);
//       return "";
//     }
//   }
//
//   return {
//     token,
//     isUserLogged,
//     handleLoginSpotify,
//     setToken,
//     handleRefreshToken
//   }
//
//   // return useMemo(() => ({
//   //   token,
//   //   isUserLogged,
//   //   handleLoginSpotify,
//   //   setToken,
//   //   handleRefreshToken
//   // }), [token, isUserLogged, handleLoginSpotify, setToken]);
//   //
//
// };
//
// export default useAuth;
