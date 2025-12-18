import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllCurrenciesScreen from '../screens/appScreens/AllCurrenciesScreen';
import BalanceTopUpScreen from '../screens/appScreens/BalanceTopUpScreen';
import ExchangeScreen from '../screens/appScreens/ExchangeScreen';
import MainScreen from '../screens/appScreens/MainScreen';
import PaymentMethodScreen from '../screens/appScreens/PaymentMethodScreen';
import WalletScreen from '../screens/appScreens/WalletScreen';
import TransactionHistoryScreen from '../screens/appScreens/TransactionHistoryScreen'
import { AppStackParamList } from '../src/navigation/appTypes';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="AllCurrencies" component={AllCurrenciesScreen} />
      <Stack.Screen name="BalanceTopUp" component={BalanceTopUpScreen} />
      <Stack.Screen name="Exchange" component={ExchangeScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    </Stack.Navigator>
  );
};
export default AppNavigator;
