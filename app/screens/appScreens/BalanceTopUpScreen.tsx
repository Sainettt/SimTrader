import React, { useState, useContext, useCallback } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { appStyles } from '../../styles/appStyles';
import BottomBar from '../../components/BottomBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../src/navigation/appTypes';
import UpperText from '../../components/UpperText';
import { AuthContext } from '../../context/AuthContext';
import { walletAPI } from '../../services/api';
import { CustomAlert } from '../../components/CustomAlert';

type BalanceTopUpScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'BalanceTopUp'
>;

const BalanceTopUpScreen: React.FC<BalanceTopUpScreenProps> = ({
  navigation,
}) => {
  const { userId } = useContext(AuthContext);
  const [pln, setPln] = useState('0');
  const [usd, setUsd] = useState('0');
  const [rate, setRate] = useState<number | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
      title: '',
      message: '',
      type: 'success' as 'success' | 'error',
    });
  const [modalVisible, setModalVisible] = useState(false);
  const [_isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

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

  const handleContinue = () => {
    const amount = parseFloat(usd);
    if (amount <= 0 || isNaN(amount)) {
      setAlertConfig({
        title: 'Error',
        message: 'Please enter a valid amount',
        type: 'error'
      });
      setAlertVisible(true);
      return;
    }
    setModalVisible(true);
  };

  const handleConfirmTopUp = async () => {
    if (!userId) {
      setAlertConfig({
        title: 'Error',
        message: 'User not authenticated',
        type: 'error'
      });
      setAlertVisible(true);
      return;
    }
    try {
      setIsProcessing(true);

      const amountUSD = parseFloat(usd);

      await walletAPI.topUp(userId, amountUSD);
      setModalVisible(false);

      setAlertConfig({
        title: 'Success!',
        message: `Successfully topped up ${amountUSD.toFixed(2)} USD`,
        type: 'success'
      })
      setAlertVisible(true);

    } catch (error: any) {
      setModalVisible(false);
      setAlertConfig({
        title: 'Error',
        message: error.response?.data?.message || 'Top up failed',
        type: 'error'
      });
      setAlertVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={appStyles.flexContainer}>
      <View style={appStyles.container}>
        <UpperText title="Top Up Balance" onPress={() => navigation.goBack()} />

        <View style={localStyles.contentCenter}>
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
              <View
                style={[
                  localStyles.currencyBadge,
                  localStyles.currencyBadgeSecondary,
                ]}
              >
                <Text style={localStyles.currencyTextSecondary}>PLN</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={appStyles.topUpContinueButton}
            onPress={handleContinue}
          >
            <Text style={localStyles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar
        homePress={() => {
          navigation.navigate('Main');
        }}
        walletPress={() => {
          navigation.navigate('Wallet');
        }}
        transactionPress={() => {
          navigation.navigate('TransactionHistory');
        }}
        settingsPress={() => {
          navigation.navigate('Settings');
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <Text style={localStyles.modalTitle}>Confirm Top Up</Text>

            <Text style={localStyles.modalText}>
              Are you sure you want to add funds to your balance?
            </Text>

            <Text style={localStyles.modalAmount}>{usd} USD</Text>

            <View style={localStyles.modalButtonsRow}>
              <TouchableOpacity
                style={[localStyles.modalButton, localStyles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={localStyles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  localStyles.modalButton,
                  localStyles.modalButtonConfirm,
                ]}
                onPress={handleConfirmTopUp}
              >
                <Text style={localStyles.modalButtonTextConfirm}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertVisible(false)
          if (alertConfig.type === 'success') {
            navigation.navigate('Main');
          }
        }}
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
  inputsContainer: { marginTop: 150 },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
  continueButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#333',
  },

  // --- Styles for Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#3C3C3C',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',

    shadowColor: '#1111',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#454545',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#E5E5E5',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalAmount: {
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    color: '#83EDA6',
    marginBottom: 25,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    width: '47%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#636363',
  },
  modalButtonConfirm: {
    backgroundColor: '#83EDA6',
  },
  modalButtonTextCancel: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  modalButtonTextConfirm: {
    color: '#333333',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});

export default BalanceTopUpScreen;
