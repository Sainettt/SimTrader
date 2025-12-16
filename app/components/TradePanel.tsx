import React, { useState, useCallback, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    StyleSheet, 
    Modal, 
    ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { currencyAPI } from '../services/api';

type TradeType = 'buy' | 'sell';

interface TradePanelProps {
    symbol: string;         
    currentPrice: number;   
    onConfirmTrade: (type: TradeType, amount: number) => Promise<void>;
    isLoading?: boolean;
}

export const TradePanel: React.FC<TradePanelProps> = ({ 
    symbol, 
    currentPrice, 
    onConfirmTrade, 
    isLoading = false 
}) => {
    const [type, setType] = useState<TradeType>('buy');
    const [inputValue, setInputValue] = useState(''); 
    const [modalVisible, setModalVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(7);
    
    const [quotePrice, setQuotePrice] = useState(currentPrice);
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);

    const isBuy = type === 'buy';
    const numericUsdAmount = parseFloat(inputValue) || 0;

    const cryptoAmount = numericUsdAmount / (quotePrice || 1);

    useEffect(() => {
        setInputValue('');
    }, [type]);

    const fetchFreshPrice = useCallback(async () => {
        setIsQuoteLoading(true);
        try {
            const data = await currencyAPI.getLatestPrice(symbol);
            if (data && data.price) {
                setQuotePrice(parseFloat(data.price));
            }
        } catch (error) {
            console.log("Failed to fetch fresh price", error);
        } finally {
            setIsQuoteLoading(false);
        }
    }, [symbol]);

    useFocusEffect(
        useCallback(() => {
            let interval: ReturnType<typeof setInterval>;

            if (modalVisible) {
                setTimeLeft(7);
                fetchFreshPrice();
                interval = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            setModalVisible(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            return () => {
                if (interval) clearInterval(interval);
            };
        }, [modalVisible, fetchFreshPrice])
    );

    const handleTradePress = () => {
        if (!inputValue || parseFloat(inputValue) <= 0) return;
        setQuotePrice(currentPrice); 
        setModalVisible(true);
    };

    const handleConfirm = async () => {
        await onConfirmTrade(type, cryptoAmount);
        setModalVisible(false);
        setInputValue('');
    };

    return (
        <View style={styles.container}>
            {/* Switch Buy / Sell */}
            <View style={styles.switchContainer}>
                <TouchableOpacity 
                    style={[styles.switchButton, isBuy && styles.activeBuyButton]} 
                    onPress={() => setType('buy')}
                >
                    <Text style={[styles.switchText, isBuy && styles.activeText]}>Buy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.switchButton, !isBuy && styles.activeSellButton]} 
                    onPress={() => setType('sell')}
                >
                    <Text style={[styles.switchText, !isBuy && styles.activeText]}>Sell</Text>
                </TouchableOpacity>
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    placeholder="0.0" 
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={setInputValue}
                />
                <Text style={styles.currencySuffix}>USD</Text>
            </View>

            {/* Info Row */}
            <View style={styles.infoRow}>
                 <Text style={styles.infoText}>Price: ${currentPrice}</Text>
                 <Text style={styles.infoText}>
                     {isBuy ? 'Get:' : 'Sell:'} 
                     <Text style={{color:'#fff', fontWeight: 'bold'}}>
                         {` ${cryptoAmount.toFixed(6)} ${symbol}`}
                     </Text>
                 </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isBuy ? '#83EDA6' : '#EB5B5B' }]}
                onPress={handleTradePress}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#1E1E1E" />
                ) : (
                    <Text style={styles.actionButtonText}>
                        {isBuy ? 'Buy' : 'Sell'} {symbol}
                    </Text>
                )}
            </TouchableOpacity>

            {/* === MODAL === */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Confirm {isBuy ? 'Purchase' : 'Sale'}</Text>
                        
                        <Text style={styles.modalText}>
                            Confirm in <Text style={{color: '#EB5B5B', fontWeight: 'bold'}}>{timeLeft}s</Text>
                        </Text>

                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    {isBuy ? 'Spend:' : 'Get:'}
                                </Text>
                                <Text style={styles.summaryValue}>${numericUsdAmount.toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Price:</Text>
                                {isQuoteLoading ? (
                                    <ActivityIndicator size="small" color="#83EDA6" />
                                ) : (
                                    <Text style={styles.summaryValue}>${quotePrice}</Text>
                                )}
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>
                                    {isBuy ? 'Receive:' : 'Sell:'}
                                </Text>
                                <Text style={[styles.summaryValue, {color: '#83EDA6', fontSize: 18}]}>
                                    {cryptoAmount.toFixed(6)} {symbol}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.modalButton, isBuy ? styles.modalButtonConfirmBuy : styles.modalButtonConfirmSell]}
                                onPress={handleConfirm}
                                disabled={isQuoteLoading}
                            >
                                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15, 
        marginTop: 10, 
    },
    switchContainer: {
        flexDirection: 'row',
        backgroundColor: '#3C3C3C',
        borderRadius: 10,
        padding: 3, 
        marginBottom: 15, 
    },
    switchButton: {
        flex: 1,
        paddingVertical: 8, 
        alignItems: 'center',
        borderRadius: 8,
    },
    activeBuyButton: { backgroundColor: '#83EDA6' },
    activeSellButton: { backgroundColor: '#EB5B5B' },
    switchText: { fontFamily: 'Poppins-Bold', color: '#777', fontSize: 14 },
    activeText: { color: '#1E1E1E' },
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3C3C3C',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#555'
    },
    input: { 
        flex: 1, 
        color: '#fff', 
        fontSize: 20, 
        fontFamily: 'Poppins-Bold',
        paddingVertical: 0, // <--- IMPORTANT: Removes default Android indents
        textAlignVertical: 'center', // <--- IMPORTANT: Centers text vertically
        height: '100%'
    },
    currencySuffix: { 
        color: '#fff', 
        fontSize: 16, 
        fontFamily: 'Poppins-Regular',
        marginLeft: 10
    },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    infoText: { color: '#AAAAAA', fontSize: 12, fontFamily: 'Poppins-Regular' },
    actionButton: { 
        height: 50, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    actionButtonText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#1E1E1E' },
    
    // Modal Styles (Compact)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '85%', backgroundColor: '#3C3C3C', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#454545', elevation: 5 },
    modalTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#FFFFFF', marginBottom: 5 },
    modalText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#AAAAAA', textAlign: 'center', marginBottom: 15 },
    summaryContainer: { width: '100%', backgroundColor: '#2C2C2C', borderRadius: 12, padding: 12, marginBottom: 15 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    summaryLabel: { color: '#AAAAAA', fontFamily: 'Poppins-Regular', fontSize: 14 },
    summaryValue: { color: '#FFFFFF', fontFamily: 'Poppins-Bold', fontSize: 14 },
    divider: { height: 1, backgroundColor: '#444', marginVertical: 8 },
    modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    modalButton: { borderRadius: 12, paddingVertical: 10, width: '47%', alignItems: 'center' },
    modalButtonCancel: { backgroundColor: '#636363' },
    modalButtonConfirmBuy: { backgroundColor: '#83EDA6' },
    modalButtonConfirmSell: { backgroundColor: '#EB5B5B' },
    modalButtonTextCancel: { color: '#FFFFFF', fontFamily: 'Poppins-Bold', fontSize: 14 },
    modalButtonTextConfirm: { color: '#333333', fontFamily: 'Poppins-Bold', fontSize: 14 },
});