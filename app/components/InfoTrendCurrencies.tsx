import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { appStyles } from '../styles/appStyles';
import CurrencyItem from '../components/CurrencyItem';
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
                    renderItem={({ item }) => <CurrencyItem item={item} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false} 
                    ListEmptyComponent={
                        <Text style={appStyles.emptyListText}>
                            Loading data...
                        </Text>
                    }
                />
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
  marginPriceTextContainer:{
    marginLeft: 20,
  },
  marginChangeTextContainer:{
    marginRight: 10,
  },
});

export default InfoTrendCurrencies;