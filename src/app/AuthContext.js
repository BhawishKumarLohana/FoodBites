"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, removeToken, decodeToken } from "../jwt";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = getToken();
    setTokenState(t);
    setUser(t ? decodeToken(t) : null);
  }, []);

  const login = (token) => {
    setToken(token);
    setTokenState(token);
    setUser(decodeToken(token));
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 