import React, { useState, useContext, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appStyles } from '../../styles/appStyles';
import UpperText from '../../components/UpperText';
import BottomBar from '../../components/BottomBar';
import TransactionItem from '../../components/TransactionItem';

import { AuthContext } from '../../context/AuthContext';
import { walletAPI } from '../../services/api';

const TransactionHistoryScreen = ({ navigation }: any) => {
  const { userId } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем данные каждый раз при фокусе на экран
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchHistory = async () => {
        if (!userId) return;
        try {
          const data = await walletAPI.getTransactions(Number(userId));
          if (isActive) {
            setTransactions(data);
          }
        } catch (e) {
          console.log(e);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchHistory();

      return () => {
        isActive = false;
      };
    }, [userId])
  );

  return (
    <SafeAreaView 
        style={appStyles.containerWithoutPadding} 
        edges={['top', 'left', 'right']}
    >
      
      {/* 1. Заголовок */}
      <UpperText 
        title="History" 
        onPress={() => navigation.goBack()} 
      />

      {/* 2. Список транзакций */}
      <View style={{ flex: 1 }}>
        {loading ? (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#83EDA6" />
            </View>
        ) : (
            <FlatList
                data={transactions}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => <TransactionItem item={item} />}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    </View>
                }
            />
        )}
      </View>

      {/* 3. Нижний бар */}
      <View>
        <BottomBar
            homePress={() => navigation.navigate('Main')}
            walletPress={() => navigation.navigate('Wallet')}
            transactionPress={() => {}}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#777',
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
    }
});

export default TransactionHistoryScreen;