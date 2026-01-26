import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { authAPI } from '../services/api';
import { Alert } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
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
  loginWithGoogle: () => Promise<void>;
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
  loginWithGoogle: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // <--- Стейт для данных
  const [isLoading, setIsLoading] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  useEffect(() => {

    GoogleSignin.configure({
      // Here you should put your actual Web Client ID from Google Cloud Console
      webClientId: '356867902645-k2kuaubk84cjmg1ngom4nqts9dfnljl0.apps.googleusercontent.com', 
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });

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

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Проверяем сервисы
      await GoogleSignin.hasPlayServices();
      
      // Открываем шторку выбора аккаунта
      const userInfoResponse = await GoogleSignin.signIn();
      
      if (!userInfoResponse.data) {
        throw new Error('No user data returned from Google');
      }
      const { idToken, user } = userInfoResponse.data;

      if (!idToken) throw new Error('No ID token found');

      // 5. Отправляем данные НА НАШ СЕРВЕР (через api.ts)
      // В user.name может быть null, поэтому подстрахуемся
      const data = await authAPI.googleLogin(idToken, user.email, user.name || 'User');

      // 6. Если наш сервер ответил успехом, сохраняем сессию
      if (data.token && data.user) {
        await saveSession(data.token, data.user);
      } else {
        Alert.alert('Login Error', 'Server returned invalid data');
      }

    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the login flow');
            break;
          case statusCodes.IN_PROGRESS:
            console.log('Sign in is in progress already');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services not available');
            break;
          default:
            Alert.alert('Google Error', error.message);
        }
      } else {
        console.log('Backend or Other Error:', error);
        Alert.alert('Login Error', 'Failed to authenticate with server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
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
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
