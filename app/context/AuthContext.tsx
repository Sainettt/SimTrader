import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  userId: number | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        
        if (credentials) {
          // Сначала просто сохраняем данные в стейт, но НЕ ставим LoggedIn
          const token = credentials.password;
          
          // ВАЖНО: Пробуем сделать запрос к api/user/auth (или любой защищенный роут)
          // У вас в api.ts уже есть интерцептор, который подставит токен из Keychain
          await authAPI.check(); 

          // Если запрос прошел успешно (не вылетел в catch), значит токен живой
          setUserId(Number(credentials.username));
          setToken(token);
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

  const saveSession = async (newToken: string, newUserId: number) => {
    try {

      await Keychain.setGenericPassword(String(newUserId), newToken);
      
      setToken(newToken);
      setUserId(newUserId);
      setIsLoggedIn(true);
    } catch (e) {
      console.log('Error saving to keychain', e);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await authAPI.login(email, password);

      if (data.token && data.user?.id) {
        await saveSession(data.token, data.user.id);
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

  const register = async (userName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await authAPI.registration(userName, email, password);

      if (data.token && data.user?.id) {
        await saveSession(data.token, data.user.id);
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
        setIsLoggedIn(false);
    } catch (e) {
        console.log('Logout error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, userId, isLoading, isSplashLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
