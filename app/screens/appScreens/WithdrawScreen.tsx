import React, { useState, useContext, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appStyles } from '../../styles/appStyles';
import UpperText from '../../components/UpperText';
import BottomBar from '../../components/BottomBar';
import { AuthContext } from '../../context/AuthContext';
import { walletAPI } from '../../services/api';
import { CustomAlert } from '../../components/CustomAlert';

const WithdrawScreen = ({ navigation }: any) => {
    const { userId } = useContext(AuthContext);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableBalance, setAvailableBalance] = useState<string | null>(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error',
      });
      
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            
            const fetchBalance = async () => {
                if (!userId) return;
                try {
                    const data = await walletAPI.getPortfolio(Number(userId));
                    if (isActive) {
                        const usdAsset = data.assets.find((a: any) => a.symbol === 'USD');
                        setAvailableBalance(usdAsset ? usdAsset.amount.toFixed(2) : '0.00');
                    }
                } catch (e) {
                    console.log("Error loading balance for withdraw", e);
                }
            };

            fetchBalance();

            return () => { isActive = false; };
        }, [userId])
    );

    const handleWithdraw = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setAlertConfig({
                title: 'Error',
                message: 'Please enter a valid amount',
                type: 'error'
              });
              setAlertVisible(true);
            return;
        }

        if (availableBalance && Number(amount) > Number(availableBalance)) {
            setAlertConfig({
                title: 'Error',
                message: 'Insufficient funds',
                type: 'error'
              });
              setAlertVisible(true);
            return;
        }

        setLoading(true);
        try {
            await walletAPI.withdraw(Number(userId), Number(amount));
            setAlertConfig({
                title: 'Success',
                message: `${amount} USD withdrawn to your card`,
                type: 'success'
              });
              setAlertVisible(true);
        } catch (e: any) {
            const msg = e.response?.data?.message || 'Withdrawal failed';
            setAlertConfig({
                title: 'Error',
                message: msg,
                type: 'error'
              });
              setAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSetMax = () => {
        if (availableBalance) {
            setAmount(availableBalance);
        }
    };

    return (
        <SafeAreaView style={appStyles.containerWithoutPadding} edges={['top', 'left', 'right']}>
            <UpperText title="Withdraw USD" onPress={() => navigation.goBack()} />

            <View style={styles.content}>
                
                {/* Блок с балансом и лейблом */}
                <View style={styles.balanceHeader}>
                    <Text style={styles.label}>Amount to withdraw ($)</Text>
                    
                    {availableBalance !== null ? (
                        <TouchableOpacity onPress={handleSetMax}>
                            <Text style={styles.availableText}>
                                Available: <Text style={styles.availableValue}>${availableBalance}</Text>
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <ActivityIndicator size="small" color="#83EDA6" />
                    )}
                </View>
                
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                />

                <Text style={styles.infoText}>
                    Funds will be transferred to your linked bank card instantly.
                </Text>

                <TouchableOpacity 
                    style={styles.withdrawButton} 
                    onPress={handleWithdraw}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Withdraw</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View>
                <BottomBar
                    homePress={() => navigation.navigate('Main')}
                    walletPress={() => navigation.navigate('Wallet')}
                    transactionPress={() => navigation.navigate('TransactionHistory')}
                    settingsPress={() => {
          navigation.navigate('Settings');
        }}
                />
            </View>
            <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
     />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
    availableText: {
        color: '#AAAAAA',
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    availableValue: {
        color: '#83EDA6',
        fontFamily: 'Poppins-Bold',
    },
    input: {
        backgroundColor: '#4A4A4A',
        borderRadius: 10,
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Regular',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
    },
    infoText: {
        color: '#AAAAAA',
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginBottom: 30,
    },
    withdrawButton: {
        backgroundColor: '#83EDA6',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
    }
});

export default WithdrawScreen;