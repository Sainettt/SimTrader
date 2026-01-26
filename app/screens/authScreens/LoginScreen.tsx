import React, { useContext, useState } from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Alert,
  Text,
  StyleSheet
} from 'react-native';
import LoginFields from '../../components/LogInFields';
import AuthAskText from '../../components/AuthAskText';
import { authStyles } from '../../styles/authStyles';
import AuthSubmitButton from '../../components/AuthSubmitButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../src/navigation/authTypes';
import { AuthContext } from '../../context/AuthContext';
// 1. Импортируем компонент кнопки Google
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }: Props) => {
  // 2. Достаем loginWithGoogle из контекста
  const { login, isLoading, loginWithGoogle } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    login(email, password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={authStyles.container}>
        <LoginFields
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            {/* Основная кнопка входа */}
            <AuthSubmitButton buttonText="Sign In" onPress={handleLogin} />

            {/* Разделитель */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* 3. Кнопка Google Sign-In */}
            <GoogleSigninButton
              style={{ width: '90%', height: 48 }}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark} // Или .Light, если фон темный
              onPress={loginWithGoogle}
            />
          </View>
        )}

        <AuthAskText
          mainText="Don`t have an account yet? "
          buttonText="Sign Up"
          onPress={() => {
            navigation.navigate('Register');
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '90%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 14,
  },
});

export default LoginScreen;