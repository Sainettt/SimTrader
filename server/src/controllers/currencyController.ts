import { Request, Response } from 'express';
import binanceApi from './services/binanceApi';

let cryptoCache: any[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION = 10 * 1000; //

class CurrencyController {
    async getTopCryptos(req: Request, res: Response): Promise<any> {
        try {
            const limit = parseInt(req.query.limit as string) || 100;
            const now = Date.now();

            if (cryptoCache.length > 0 && (now - lastFetchTime < CACHE_DURATION)) {
                return res.json(cryptoCache.slice(0, limit));
            }

            const response = await binanceApi.get('/ticker/24hr');
            const allTickers = response.data;

            const topCryptos = allTickers
                .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
                .filter((ticker: any) => 
                    !ticker.symbol.includes('UPUSDT') && 
                    !ticker.symbol.includes('DOWNUSDT') &&
                    !ticker.symbol.includes('BEAR') &&
                    !ticker.symbol.includes('BULL') &&
                    !ticker.symbol.includes('DUSD') &&
                    ticker.symbol !== 'USDCUSDT' && 
                    ticker.symbol !== 'BUSDUSDT' &&
                    ticker.symbol !== 'DAIUSDT' &&
                    ticker.symbol !== 'USD1USDT'
                )
                .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                .map((ticker: any) => ({
                    id: ticker.symbol,
                    name: ticker.symbol.replace('USDT', ''),
                    symbol: ticker.symbol,
                    price: parseFloat(ticker.lastPrice).toFixed(2),
                    change: parseFloat(ticker.priceChangePercent).toFixed(2),
                    high: parseFloat(ticker.highPrice).toFixed(2),
                    low: parseFloat(ticker.lowPrice).toFixed(2),
                    volume: parseFloat(ticker.quoteVolume).toFixed(0),
                }));

                cryptoCache = topCryptos; 
                lastFetchTime = now;

            return res.json(topCryptos.slice(0, limit));

        } catch (e) {
            console.error('Binance API Error:', e);
            if (cryptoCache.length > 0) {
                return res.json(cryptoCache.slice(0, parseInt(req.query.limit as string) || 100));
            }
            return res.status(500).json({ message: 'Error fetching crypto data' });
        }
    }
    async getHistory(req: Request, res: Response): Promise<any> {
        try {
            const { symbol, period } = req.query; 
            // period: '1H', '1D', '1W', '1M', '1Y'

            if (!symbol) return res.status(400).json({ message: 'Symbol required' });

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
                    symbol: symbol,
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
            const { symbol } = req.query; // Ожидаем, например, "BTCUSDT"
            
            // Запрос к Binance: /api/v3/ticker/price?symbol=BTCUSDT
            const response = await binanceApi.get('/ticker/price', {
                params: { symbol }
            });

            // Binance возвращает: { symbol: "BTCUSDT", price: "65000.00" }
            return res.json(response.data);
        } catch (e) {
            console.error('Error fetching rate:', e);
            return res.status(500).json({ message: 'Error fetching price' });
        }
    }
}

export default new CurrencyController();