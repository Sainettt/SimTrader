import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomBar from '../../components/BottomBar';
import { appStyles } from '../../styles/appStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../src/navigation/appTypes';
import UpperText from '../../components/UpperText';
import PaymentMethodContainer from '../../components/PaymentMethodContainer';

type PaymentMethodProps = NativeStackScreenProps<
  AppStackParamList,
  'PaymentMethod'
>;

const PaymentMethodScreen: React.FC<PaymentMethodProps> = ({ navigation }) => {
  return (
    <View style={appStyles.flexContainer}>
      <View style={appStyles.container}>
        <UpperText
          title="Fund your wallet"
          onPress={() => navigation.goBack()}
        />
        <View style={styles.marginTextSelectMethod}>
          <Text style={styles.textSelectMethod}> Select a payment method </Text>
        </View>
        <View style={styles.marginTextPaymentMethod}>
          <Text style={styles.textPaymentMethod}> Recommended </Text>
        </View>
        <PaymentMethodContainer
          logo={require('../../assets/images/applePay.png')}
          styleLogo={styles.logoApplePayContainer}
          onPress={() => {
            navigation.navigate('BalanceTopUp');
          }}
        />

        <View style={styles.marginTextPaymentMethod}>
          <Text style={styles.textPaymentMethod}> Other </Text>
        </View>
        <PaymentMethodContainer
          logo={require('../../assets/images/blik.png')}
          styleLogo={styles.logoBlikContainer}
          onPress={() => {
            navigation.navigate('BalanceTopUp');
          }}
        />
      </View>
      <BottomBar
        homePress={() => navigation.navigate('Main')}
        walletPress={() => {navigation.navigate('Wallet')}}
        transactionPress={() => {navigation.navigate('TransactionHistory')}}
        settingsPress={() => {
          navigation.navigate('Settings');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoApplePayContainer: {
    width: 70,
    height: 70,
    marginRight: 15,
  },
  logoBlikContainer: {
    width: 70,
    height: 40,
    marginRight: 15,
  },
  textSelectMethod: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  marginTextSelectMethod: {
    marginTop: 65,
  },
  textPaymentMethod: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#FFFFFF',
  },
  marginTextPaymentMethod: {
    marginTop: 25,
  },
});
export default PaymentMethodScreen;
