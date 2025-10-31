import { createContext, useContext, useMemo, useState } from "react";
import { login as loginRequest, register as registerRequest } from "../services/auth";

export const AuthContext = createContext(null);

function getStoredToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to parse stored user", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());

  const persistAuthData = (authData) => {
    const authToken = authData?.token ?? null;
    const authUser = authData?.user ?? null;

    if (typeof window !== "undefined") {
      if (authToken) {
        localStorage.setItem("token", authToken);
      } else {
        localStorage.removeItem("token");
      }

      if (authUser) {
        localStorage.setItem("user", JSON.stringify(authUser));
      } else {
        localStorage.removeItem("user");
      }
    }

    setToken(authToken);
    setUser(authUser);
  };

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    persistAuthData(response.data);
    return response.data;
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);

    if (response.data?.token || response.data?.user) {
      persistAuthData(response.data);
    }

    return response.data;
  };

  const logout = () => {
    persistAuthData({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      register,
      isAuthenticated: Boolean(token),
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
