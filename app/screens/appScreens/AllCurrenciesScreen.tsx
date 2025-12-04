import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import BottomBar from '../../components/BottomBar';
import { appStyles } from '../../styles/appStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../src/navigation/appTypes';
import UpperTextScreen from '../../components/UpperTextScreen';
import CurrencyItem from '../../components/CurrencyItem';
import { currencyAPI } from '../../services/api';
import { Currency } from '../../src/types/types';
type AllCurrenciesProps = NativeStackScreenProps<
  AppStackParamList,
  'AllCurrencies'
>;

const AllCurrenciesScreen: React.FC<AllCurrenciesProps> = ({ navigation }) => {
  const [allCurrencies, setAllCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    fetchAllCurrencies();
  }, []);

  const fetchAllCurrencies = async () => {
    try {
      const data = await currencyAPI.getTopCryptos(100);
      setAllCurrencies(data);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={appStyles.flexContainer}>
      <View style={appStyles.containerWithoutPadding}>
        <UpperTextScreen
          title="All Currencies"
          onPress={() => navigation.goBack()}
        />
        <FlatList
          data={allCurrencies}
          renderItem={({ item }) => <CurrencyItem item={item} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={appStyles.emptyListText}>Loading data...</Text>
          }
        />
      </View>
      <BottomBar
        homePress={() => navigation.navigate('Main')}
        walletPress={() => {}}
        transactionPress={() => {}}
      />
    </View>
  );
};
export default AllCurrenciesScreen;
