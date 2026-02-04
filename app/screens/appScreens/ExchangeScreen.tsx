import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppStackParamList } from '../../src/navigation/appTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import UpperText from '../../components/UpperText';
import BottomBar from '../../components/BottomBar';
import { appStyles } from '../../styles/appStyles';
import { TradePanel } from '../../components/TradePanel';
import { currencyAPI, tradeAPI, walletAPI } from '../../services/api';
import { CryptoChart } from '../../components/CryptoChart';
import { IntervalSelector } from '../../components/IntervalSelector';
import { AuthContext } from '../../context/AuthContext';
import { CustomAlert } from '../../components/CustomAlert';

type ExchangeScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'Exchange'
>;

const screenWidth = Dimensions.get('window').width;

const ExchangeScreen: React.FC<ExchangeScreenProps> = ({
  navigation,
  route,
}) => {
  const { userId } = useContext(AuthContext);

  const {
    coinId,
    symbol,
    currentPrice: initialPrice,
    ownedAmount: initialOwnedAmount,
  } = route.params;

  const [selectedInterval, setSelectedInterval] = useState('1D');
  const intervals = ['1H', '1D', '1W', '1M', '1Y'];

  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [priceChangePercent, setPriceChangePercent] = useState(
    route.params.priceChange,
  );
  const [priceChangeValue, setPriceChangeValue] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [ownedAmount, setOwnedAmount] = useState(initialOwnedAmount);
  const [walletUsdBalance, setWalletUsdBalance] =
    useState<string>('Loading...');

  const [isTrading, setIsTrading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const isLoaded = useRef(false);

  useEffect(() => {
    isLoaded.current = false;
  }, [selectedInterval]);

  const fetchBalances = useCallback(async () => {
    if (!userId) return;
    try {
      const portfolio = await walletAPI.getPortfolio(userId);

      const asset = portfolio.assets.find((a: any) => a.symbol === symbol);
      setOwnedAmount(asset ? asset.amount : 0);

      const usdAsset = portfolio.assets.find((a: any) => a.symbol === 'USD');
      const usdBalance = usdAsset ? usdAsset.amount : 0;

      setWalletUsdBalance(usdBalance.toFixed(2));
    } catch (e) {
      console.log('Error updating balance', e);
    }
  }, [userId, symbol]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHistory = async () => {
        if (!isLoaded.current) setIsLoadingData(true);
        try {
          const response = await currencyAPI.getHistory(
            coinId,
            selectedInterval,
          );

          if (isActive) {
            setChartData(response.data);
            setPriceChangePercent(response.changePercent);
            setPriceChangeValue(response.changeValue);

            if (response.data.length > 0) {
              setCurrentPrice(
                response.data[response.data.length - 1].value.toFixed(2),
              );
            }
            isLoaded.current = true;
          }
        } catch (e) {
          console.log('Error fetching history', e);
        } finally {
          if (isActive) setIsLoadingData(false);
        }
      };

      fetchHistory();
      fetchBalances();

      const intervalId = setInterval(fetchHistory, 5000);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [selectedInterval, coinId, fetchBalances]),
  );

  const handleTrade = async (type: 'buy' | 'sell', amount: number) => {
    if (!userId) return;
    setIsTrading(true);
    try {
      if (type === 'buy') {
        await tradeAPI.buy(userId, symbol, amount, Number(currentPrice));
        setAlertConfig({
           title: 'Success!',
           message: `Successfully bought ${amount.toFixed(6)} ${symbol} (${(amount * Number(currentPrice)).toFixed(2)} USD)`,
           type: 'success'
       });
       setAlertVisible(true);
      } else {
        await tradeAPI.sell(userId, symbol, amount, Number(currentPrice));
        setAlertConfig({
          title: 'Success!',
          message: `Successfully sold ${amount.toFixed(6)} ${symbol} (${(amount * Number(currentPrice)).toFixed(2)} USD)`,
          type: 'success'
      });
      setAlertVisible(true);
      }

      await fetchBalances();
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || 'Transaction failed';
      setAlertConfig({
        title: 'Error',
        message: errorMsg,
        type: 'error'
      });
      setAlertVisible(true);
    } finally {
      setIsTrading(false);
    }
  };

  const isPositive = parseFloat(priceChangePercent) >= 0;
  const balanceInUsd = (Number(ownedAmount) * Number(currentPrice)).toFixed(2);

  return (
    <View style={appStyles.flexContainer}>
      
      <View style={appStyles.containerWithoutPadding}>
        <UpperText title={`${symbol}`} onPress={() => navigation.goBack()} />

        <View style={styles.mainCintentContainer}>
          <View>
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.totalLabel}>Current Price</Text>
              <Text style={styles.bigPrice}>${currentPrice}</Text>

              <View style={styles.rowDirectionContainer}>
                <Text
                  style={[
                    styles.changeText,
                    isPositive ? appStyles.green : appStyles.red,
                  ]}
                >
                  {priceChangeValue}$ ({isPositive ? '+' : ''}
                  {priceChangePercent}%)
                </Text>
                <Text style={styles.intervalLabel}> • {selectedInterval}</Text>
              </View>
            </View>

            {/* Balances */}
            <View style={styles.balanceContainerWrapper}>
              <Text style={styles.balanceInfoText}>
                Your {symbol}:{' '}
                <Text style={styles.whiteBold}>
                  {Number(ownedAmount).toFixed(6)}
                </Text>
                <Text style={styles.greyText}> (${balanceInUsd})</Text>
              </Text>

              <Text style={styles.balanceInfoText}>
                Available USD:{' '}
                <Text style={styles.greenBold}>${walletUsdBalance}</Text>
              </Text>
            </View>

            <CryptoChart
              data={chartData}
              loading={isLoadingData}
              isPositive={isPositive}
              width={screenWidth}
            />

            <IntervalSelector
              intervals={intervals}
              selectedInterval={selectedInterval}
              onSelect={setSelectedInterval}
            />
          </View>

          <TradePanel
            symbol={symbol}
            currentPrice={Number(currentPrice)}
            onConfirmTrade={handleTrade}
            isLoading={isTrading}
          />
        </View>
      </View>

      <BottomBar
        homePress={() => navigation.navigate('Main')}
        walletPress={() => navigation.navigate('Wallet')}
        transactionPress={() => {
          navigation.navigate('TransactionHistory');
        }}
        settingsPress={() => {
          navigation.navigate('Settings');
        }}
      />
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
     />
    </View>
  );
};

const styles = StyleSheet.create({
  priceContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
  mainCintentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowDirectionContainer: {
    flexDirection: 'row',
  },
  totalLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  bigPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    marginVertical: 2,
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  intervalLabel: {
    color: '#777',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },

  balanceContainerWrapper: {
    alignItems: 'center',
    marginVertical: 5,
    gap: 0,
  },
  balanceInfoText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  whiteBold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  greenBold: {
    color: '#83EDA6',
    fontWeight: 'bold',
  },
  greyText: {
    color: '#777',
    fontSize: 12,
  },
});

export default ExchangeScreen;
