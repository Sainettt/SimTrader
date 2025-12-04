import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { appStyles } from '../../styles/appStyles';
import InfoTrendCurrencies from '../../components/InfoTrendCurrencies';
import BottomBar from '../../components/BottomBar';
import { AppStackParamList } from '../../src/navigation/appTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { currencyAPI } from '../../services/api';

type MainProps = NativeStackScreenProps<AppStackParamList, 'Main'>;

const MainScreen: React.FC<MainProps> = ({ navigation }: MainProps) => {
  const [totalBalance, setTotalBalance] = useState(500.23);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const data = await currencyAPI.getTopCryptos(10);
      setCurrencies(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={appStyles.flexContainer}>
      <View style={appStyles.container}>
        <View style={appStyles.headerContainer}>
          <Text style={appStyles.titleHeader}>Trending currencies</Text>
        </View>
        <View style={appStyles.totalBalanceContainer}>
          <Text style={appStyles.totalBalanceText}>Total balance</Text>
        </View>
        <View style={appStyles.balanceContainer}>
          <Text style={appStyles.balanceText}>{totalBalance}$</Text>
          <TouchableOpacity
            style={appStyles.topUpButton}
            onPress={() => {
              navigation.navigate('PaymentMethod');
            }}
          >
            <Text style={appStyles.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
        <InfoTrendCurrencies data={currencies} />
        <View style={appStyles.viewAllContainer}>
          <TouchableOpacity
            style={appStyles.viewAllButton}
            onPress={() => {
              navigation.navigate('AllCurrencies');
            }}
          >
            <Text style={appStyles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomBar
        homePress={() => navigation.navigate('Main')}
        walletPress={() => navigation.navigate('Wallet')}
        transactionPress={() => {}}
      />
    </View>
  );
};
export default MainScreen;
