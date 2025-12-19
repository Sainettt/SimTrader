import { Request, Response } from 'express';
import binanceApi from './services/binanceApi';
import { getTopCoinsFromCache } from './services/priceCache';

class CurrencyController {
    async getTopCryptos(req: Request, res: Response): Promise<any> {
        try {
            
            const limit = parseInt(req.query.limit as string) || 10;
            const coins = getTopCoinsFromCache(limit);

            return res.json(coins);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Error fetching cryptocurrencies' });
        }
    }
    async getHistory(req: Request, res: Response): Promise<any> {
        try {
            const { symbol, period } = req.query; 
            // period: '1H', '1D', '1W', '1M', '1Y'

            if (!symbol) return res.status(400).json({ message: 'Symbol required' });
            const pair = (symbol as string).toUpperCase().endsWith('USDT') 
                ? symbol 
                : `${symbol}USDT`;
            // 1. Mapping our period to Binance interval and limit
            // interval: таймфрейм свечи
            // limit: сколько точек взять
            let interval = '1h';
            let limit = 24;

            switch (period) {
                case '1H': interval = '1m'; limit = 60; break;   // 60 points of 1 minute
                case '1D': interval = '1h'; limit = 24; break;   // 24 points of 1 hour
                case '1W': interval = '4h'; limit = 42; break;   // 42 points of 4 hours (7 days * 6)
                case '1M': interval = '1d'; limit = 30; break;   // 30 points of 1 day
                case '1Y': interval = '1w'; limit = 52; break;   // 52 points of 1 week
                default:   interval = '1h'; limit = 24; break;
            }

            // 2. Requesting data from Binance
            const response = await binanceApi.get('/klines', {
                params: {
                    symbol: pair,
                    interval: interval,
                    limit: limit
                }
            });

            // Binance returns data in the format:
            // [ [OpenTime, Open, High, Low, Close, Volume, ...], ... ]

            // 3. Format for chart (Wagmi Charts loves { timestamp, value })
            const chartData = response.data.map((item: any) => ({
                timestamp: item[0],          // OpenTime
                value: parseFloat(item[4])   // Close Price
            }));

            // 4. Calculate change percent and value
            // (Last price - First price) / First price * 100
            const firstPrice = chartData[0].value;
            const lastPrice = chartData[chartData.length - 1].value;
            const changeValue = lastPrice - firstPrice;
            const changePercent = ((changeValue / firstPrice) * 100).toFixed(2);

            return res.json({
                data: chartData,
                changePercent: changePercent,
                changeValue: changeValue.toFixed(2)
            });

        } catch (e) {
            console.error('History Error:', e);
            return res.status(500).json({ message: 'Error fetching history' });
        }
    }
    async getRate(req: Request, res: Response): Promise<any> {
        try {
            const { symbol } = req.query;
            
            const response = await binanceApi.get('/ticker/price', {
                params: { symbol }
            });
            return res.json(response.data);
        } catch (e) {
            console.error('Error fetching rate:', e);
            return res.status(500).json({ message: 'Error fetching price' });
        }
    }
}

export default new CurrencyController();