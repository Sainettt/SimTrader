import React, { createContext, useState, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { Alert } from 'react-native';

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    userName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await authAPI.login(email, password);

      setToken(data.token);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        'Login Error',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userName: string,
    email: string,
    password: string,
  ) => {
    try {
      setIsLoading(true);
      const data = await authAPI.registration(userName, email, password);

      setToken(data.token);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.log(error);
      Alert.alert(
        'Registration Error',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
