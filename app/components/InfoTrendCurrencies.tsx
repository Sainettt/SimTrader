import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { appStyles } from '../styles/appStyles';
import { renderCurrencyItem } from '../utils/renderCurrencyItem';
import { Currency } from '../src/types/types';

type Props = {
  data: Currency[];
};

const InfoTrendCurrencies: React.FC<Props> = ({ data }) => {
    
    return (
        <View> 
            <View style={appStyles.infoTrendHeaderContainer}>
                <View>
                    <Text style={appStyles.infoTrendHeaderText}>Trending</Text>
                </View>
                <View style={localStyles.marginPriceTextContainer}>
                    <Text style={appStyles.infoPriceHeaderText}>Last Price</Text>
                </View>
                <View style={localStyles.marginChangeTextContainer}>
                    <Text style={appStyles.infoPriceHeaderText}>24h chg%</Text>
                </View>
            </View>
            <View style={appStyles.trendHeaderContainer}>
                <FlatList
                    data={data}
                    renderItem={renderCurrencyItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false} 
                    ListEmptyComponent={
                        <Text style={localStyles.emptyListText}>
                            Loading data...
                        </Text>
                    }
                />
            </View>
        </View>
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
  emptyListText: {
    textAlign: 'center', padding: 20, color: 'gray'
  },
  marginPriceVariable: {
    marginLeft: 50,
  },
  marginPriceTextContainer:{
    marginLeft: 20,
  },
  marginChangeTextContainer:{
    marginRight: 10,
  },
});

export default InfoTrendCurrencies;