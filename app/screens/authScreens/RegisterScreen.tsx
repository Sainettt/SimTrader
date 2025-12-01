import React, { useContext, useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, ActivityIndicator, Alert } from 'react-native';
import AuthAskText from '../../components/AuthAskText';
import RegisterFields from '../../components/RegisterFields'; // <-- Нужно доработать этот компонент
import AuthSubmitButton from '../../components/AuthSubmitButton';
import { authStyles } from '../../styles/authStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../src/navigation/authTypes';
import { AuthContext } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }: Props) => {

  const { register, isLoading } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Registration Error', 'Passwords do not match');
      return;
    }
    if (!username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }
     register(username, email, password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={authStyles.container}>
        <RegisterFields 
            username={username} 
            setUsername={setUsername}
            email={email} 
            setEmail={setEmail} 
            password={password} 
            setPassword={setPassword} 
            confirmPassword={confirmPassword} 
            setConfirmPassword={setConfirmPassword}
        />

        {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <AuthSubmitButton buttonText="Sign Up" onPress={handleRegister} />
        )}

        <AuthAskText
          mainText="Already have an account? "
          buttonText="Sign In"
          onPress={() => {
            navigation.navigate('Login');
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};
export default RegisterScreen;