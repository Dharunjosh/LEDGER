import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  useEffect(() => {
    async function loadSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.get("/auth/me");
        setUser(user);
      } catch {
        setToken(null); // token was invalid/expired
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  async function login(email, password) {
    const { token, user } = await api.post(
      "/auth/login",
      { email, password },
      { auth: false },
    );
    setToken(token);
    setUser(user);
  }

  async function register(name, email, password) {
    const { token, user } = await api.post(
      "/auth/register",
      { name, email, password },
      { auth: false },
    );
    setToken(token);
    setUser(user);
  }

  async function forgotPassword(email) {
    return api.post("/auth/forgot-password", { email }, { auth: false });
  }

  async function resetPassword(email, code, password) {
    return api.post(
      "/auth/reset-password",
      { email, code, password },
      { auth: false },
    );
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
