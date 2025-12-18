import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Transaction = {
  id: number;
  type: string;     // 'DEPOSIT', 'BUY', 'SELL'
  currency: string; // 'USD', 'BTC'
  amount: number;
  price: number;
  totalUsd: number;
  createdAt: string;
};

type Props = {
  item: Transaction;
};

const TransactionItem: React.FC<Props> = ({ item }) => {
  // Форматируем дату
  const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  // Переменные для отображения
  let titleText = '';
  let amountText = '';
  let valueColor = '#FFFFFF';

  switch (item.type) {
    case 'DEPOSIT':
      titleText = 'Top Up';
      valueColor = '#83EDA6'; // Зеленый
      amountText = `+${item.amount.toFixed(2)}$`;
      break;
    case 'BUY':
      titleText = `Buy ${item.currency}`;
      valueColor = '#FFFFFF'; // Белый (нейтральный расход баланса)
      amountText = `-${item.totalUsd.toFixed(2)}$`;
      break;
    case 'SELL':
      titleText = `Sell ${item.currency}`;
      valueColor = '#83EDA6'; // Зеленый (получили доллары)
      amountText = `+${item.totalUsd.toFixed(2)}$`;
      break;
    default:
      titleText = 'Transaction';
      amountText = `${item.totalUsd.toFixed(2)}$`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.typeText}>{titleText}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amountText, { color: valueColor }]}>
          {amountText}
        </Text>
        
        {/* Детали сделки (цена покупки/продажи), если это не пополнение */}
        {item.type !== 'DEPOSIT' && (
            <Text style={styles.subText}>
                {item.amount} {item.currency} @ {item.price.toFixed(2)}$
            </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  left: {
    flexDirection: 'column',
    gap: 4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#AAAAAA',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#777',
  }
});

export default TransactionItem;