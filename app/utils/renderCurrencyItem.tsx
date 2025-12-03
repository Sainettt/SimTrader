import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { appStyles } from '../styles/appStyles';
import { Currency } from '../src/types/types';

export const renderCurrencyItem = ({ item }: { item: Currency }) => {
  const isPositive = parseFloat(item.change) >= 0;

  return (
    <TouchableOpacity style={localStyles.itemRow}>
      <View>
        <Text style={appStyles.currencyNameAndPriceText}>{item.name}</Text>
      </View>

      <View style={localStyles.marginPriceVariable}>
        <Text style={appStyles.currencyNameAndPriceText}> {item.price} </Text>
      </View>

      <View
        style={
          isPositive
            ? appStyles.currencyChangePositiveContainer
            : appStyles.currencyChangeNegativeContainer
        }
      >
        <Text style={appStyles.currencyChangeText}>
          {parseFloat(item.change) > 0 ? '+' : ''}
          {item.change}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const localStyles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  marginPriceVariable: {
    marginLeft: 50,
  },
});
