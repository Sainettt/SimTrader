import { Request, Response } from 'express';
import binanceApi from './services/binanceApi';

class CurrencyController {
    async getTopCryptos(req: Request, res: Response): Promise<any> {
        try {
            const limit = parseInt(req.query.limit as string) || 100;

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
                    ticker.symbol !== 'DAIUSDT'
                )
                .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))

                .slice(0, limit)
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

            return res.json(topCryptos);

        } catch (e) {
            console.error('Binance API Error:', e);
            return res.status(500).json({ message: 'Error fetching crypto data' });
        }
    }
}

export default new CurrencyController();