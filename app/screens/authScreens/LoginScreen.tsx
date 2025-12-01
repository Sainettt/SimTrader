import React, { useContext, useState } from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LoginFields from '../../components/LogInFields'; // <-- Нужно доработать этот компонент
import AuthAskText from '../../components/AuthAskText';
import { authStyles } from '../../styles/authStyles';
import AuthSubmitButton from '../../components/AuthSubmitButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../src/navigation/authTypes';
import { AuthContext } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }: Props) => {
  const { login, isLoading } = useContext(AuthContext);
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
          <AuthSubmitButton buttonText="Sign In" onPress={handleLogin} />
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
export default LoginScreen;
