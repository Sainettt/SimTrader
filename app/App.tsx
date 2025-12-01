import React from 'react';
import { View } from 'react-native';
import RootNavigator from './navigators/RootNavigator';
import { authStyles } from './styles/authStyles';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <View style={authStyles.appContainer}>
        <RootNavigator />
      </View>
    </AuthProvider>
  );
};

export default App;