import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

// 1. Описываем тип для UserInfo (можно вынести в отдельный файл types.ts)
type UserInfo = {
  id: number;
  username: string;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  userId: number | null;
  userInfo: UserInfo | null; // <--- Добавили поле
  isLoading: boolean;
  isSplashLoading: boolean;
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
  userId: null,
  userInfo: null, // <--- Инициализация
  isLoading: false,
  isSplashLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // <--- Стейт для данных
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();

        if (credentials) {
          const savedToken = credentials.password;

          setToken(savedToken);
          const data = await authAPI.check();

          if (data.user) {
            setUserId(data.user.id);
            setUserInfo(data.user);
          }

          if (data.token) {
            await Keychain.setGenericPassword(String(data.user.id), data.token);
            setToken(data.token);
          }

          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('Session expired or invalid', error);
        await logout();
      } finally {
        setIsSplashLoading(false);
      }
    };

    loadSession();
  }, []);

  const saveSession = async (newToken: string, newUser: UserInfo) => {
    try {
      await Keychain.setGenericPassword(String(newUser.id), newToken);

      setToken(newToken);
      setUserId(newUser.id);
      setUserInfo(newUser); 
      setIsLoggedIn(true);
    } catch (e) {
      console.log('Error saving to keychain', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await authAPI.login(email, password);

      if (data.token && data.user) {
        await saveSession(data.token, data.user);
      } else {
        Alert.alert('Login Error', 'Invalid server response');
      }
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

      if (data.token && data.user) {
        await saveSession(data.token, data.user);
      }
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

  const logout = async () => {
    try {
      await Keychain.resetGenericPassword();
      setToken(null);
      setUserId(null);
      setUserInfo(null); // <--- Очищаем
      setIsLoggedIn(false);
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        userId,
        userInfo,
        isLoading,
        isSplashLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
