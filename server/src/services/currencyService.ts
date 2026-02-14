import binanceApi from './binanceApi';
import { getTopCoinsFromCache, CoinData } from './priceCache';

// 1. Описываем структуру курса
interface SymbolPrice {
    symbol: string;
    price: string;
}

// 2. Описываем элемент графика
interface ChartItem {
    timestamp: number;
    value: number;
}

// 3. Описываем итоговый объект истории
interface HistoryResponse {
    data: ChartItem[];
    changePercent: string;
    changeValue: string;
}

// Тип для Kline (свечи) от Binance: 
// [0] OpenTime, [1] Open, [2] High, [3] Low, [4] Close, [5] Volume...
type BinanceKline = [number, string, string, string, string, string, ...any[]];

class CurrencyService {
    /**
     * Получение топа монет из кэша
     */
    getTopCoins(limit: number): CoinData[] {
        return getTopCoinsFromCache(limit);
    }

    /**
     * Получение текущего курса конкретной монеты
     */
    async getPrice(symbol: string): Promise<SymbolPrice> {
        const response = await binanceApi.get<SymbolPrice>('/ticker/price', {
            params: { symbol }
        });
        return response.data;
    }

    /**
     * Логика получения истории цен и расчет статистики
     */
    async getHistoryData(symbol: string, period: string): Promise<HistoryResponse> {
        const pair = symbol.toUpperCase().endsWith('USDT') ? symbol : `${symbol}USDT`;

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

        const response = await binanceApi.get<BinanceKline[]>('/klines', {
            params: { symbol: pair, interval, limit }
        });

        // Форматирование данных
        const chartData: ChartItem[] = response.data.map((item) => ({
            timestamp: item[0], // Open time
            value: parseFloat(item[4]) // Close price
        }));

        // Расчет изменения
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