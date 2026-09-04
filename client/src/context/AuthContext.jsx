import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("dc_token");
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("dc_token"))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("dc_token", data.token);
        setUser(data.user);
        return data.user;
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("dc_token", data.token);
        setUser(data.user);
        return data.user;
      },
      logout() {
        localStorage.removeItem("dc_token");
        setUser(null);
      },
      setUser,
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
