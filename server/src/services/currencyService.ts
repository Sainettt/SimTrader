import binanceApi from './binanceApi';
import { getTopCoinsFromCache } from './priceCache';

class CurrencyService {
    /**
     * Получение топа монет из кэша
     */
    getTopCoins(limit: number) {
        return getTopCoinsFromCache(limit);
    }

    /**
     * Получение текущего курса конкретной монеты
     */
    async getPrice(symbol: string) {
        const response = await binanceApi.get('/ticker/price', {
            params: { symbol }
        });
        return response.data;
    }

    /**
     * Логика получения истории цен и расчет статистики
     */
    async getHistoryData(symbol: string, period: string) {
        const pair = symbol.toUpperCase().endsWith('USDT') ? symbol : `${symbol}USDT`;

        // Маппинг периода в настройки Binance (Бизнес-логика)
        let interval = '1h';
        let limit = 24;

        switch (period) {
            case '1H': interval = '1m'; limit = 60; break;
            case '1D': interval = '1h'; limit = 24; break;
            case '1W': interval = '4h'; limit = 42; break;
            case '1M': interval = '1d'; limit = 30; break;
            case '1Y': interval = '1w'; limit = 52; break;
            default:   interval = '1h'; limit = 24; break;
        }

        const response = await binanceApi.get('/klines', {
            params: { symbol: pair, interval, limit }
        });

        // Форматирование данных для графика (Бизнес-логика)
        const chartData = response.data.map((item: any) => ({
            timestamp: item[0],
            value: parseFloat(item[4])
        }));

        // Расчет изменения (Бизнес-логика)
        const firstPrice = chartData[0].value;
        const lastPrice = chartData[chartData.length - 1].value;
        const changeValue = lastPrice - firstPrice;
        const changePercent = ((changeValue / firstPrice) * 100).toFixed(2);

        return {
            data: chartData,
            changePercent,
            changeValue: changeValue.toFixed(2)
        };
    }
}

export default new CurrencyService();