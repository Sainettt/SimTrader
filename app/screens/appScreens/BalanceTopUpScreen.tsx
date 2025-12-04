import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { appStyles } from '../../styles/appStyles';
import BottomBar from '../../components/BottomBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../src/navigation/appTypes';
import UpperTextScreen from '../../components/UpperTextScreen';

type BalanceTopUpScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'BalanceTopUp'
>;

const BalanceTopUpScreen: React.FC<BalanceTopUpScreenProps> = ({
  navigation,
}) => {
  const [pln, setPln] = useState('0');
  const [usd, setUsd] = useState('0');
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(
          'https://api.binance.com/api/v3/ticker/price?symbol=USDTPLN',
        );
        const data = await response.json();
        if (data.price) {
          setRate(parseFloat(data.price));
        }
      } catch (error) {
        console.error('Error fetching Binance rate:', error);
        setRate(4.0);
      }
    };
    fetchRate();
  }, []);

  const handlePlnChange = (text: string) => {
    let formattedText = text.replace(',', '.');
    if (formattedText.startsWith('.')) formattedText = '0' + formattedText;
    setPln(formattedText);
    if (rate && formattedText !== '') {
      const val = parseFloat(formattedText);
      if (!isNaN(val)) {
        const converted = (val / rate).toFixed(2);
        setUsd(converted);
      } else {
        setUsd('0');
      }
    } else {
      setUsd('0');
    }
  };

  const handleUsdChange = (text: string) => {
    let formattedText = text.replace(',', '.');
    if (formattedText.startsWith('.')) formattedText = '0' + formattedText;
    setUsd(formattedText);
    if (rate && formattedText !== '') {
      const val = parseFloat(formattedText);
      if (!isNaN(val)) {
        const converted = (val * rate).toFixed(2);
        setPln(converted);
      } else {
        setPln('0');
      }
    } else {
      setPln('0');
    }
  };

  return (
    <View style={appStyles.flexContainer}>
      <View style={appStyles.container}>
        <UpperTextScreen
          title="Top Up Balance"
          onPress={() => navigation.goBack()}
        />

        {/* 1. Обертка для контента (инпуты + кнопка) */}
        <View style={localStyles.contentCenter}>
          
          {/* Блок с инпутами */}
          <View style={localStyles.inputsContainer}>
            <View style={localStyles.inputRow}>
              <TextInput
                style={localStyles.inputTextMain}
                value={usd}
                onChangeText={handleUsdChange}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#555"
              />
              <View style={localStyles.currencyBadge}>
                <Text style={localStyles.currencyText}>USD</Text>
              </View>
            </View>

            <View style={localStyles.inputRow}>
              {rate ? (
                <TextInput
                  style={localStyles.inputTextSecondary}
                  value={pln}
                  onChangeText={handlePlnChange}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#555"
                />
              ) : (
                <ActivityIndicator
                  size="small"
                  color="#666"
                  style={localStyles.marginIndicator}
                />
              )}
              <View style={[localStyles.currencyBadge, localStyles.currencyBadgeSecondary]}>
                <Text style={localStyles.currencyTextSecondary}>PLN</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={appStyles.topUpContinueButton}>
            <Text style={localStyles.continueText}> Continue </Text>
          </TouchableOpacity>
          
        </View>
      </View>
      
      <BottomBar
        homePress={() => {
          navigation.navigate('Main');
        }}
        walletPress={() => {}}
        transactionPress={() => {}}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  contentCenter: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  inputsContainer: {
    marginTop: 150
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  inputTextMain: {
    fontSize: 64,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    textAlign: 'right',
    minWidth: 100,
    marginRight: 15,
  },
  inputTextSecondary: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    color: '#636363',
    textAlign: 'right',
    minWidth: 80,
    marginRight: 15,
  },
  currencyBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#3C3C3C',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  currencyBadgeSecondary: {
    backgroundColor: '#2A2A2A',
  },
  currencyText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  currencyTextSecondary: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#AAAAAA',
    fontWeight: '700',
  },
  marginIndicator: {
    marginRight: 10,
  },
  continueText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  }
});

export default BalanceTopUpScreen;