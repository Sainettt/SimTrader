import { Request, Response } from 'express';
import currencyService from '../services/currencyService';

class CurrencyController {
    async getTopCryptos(req: Request, res: Response): Promise<any> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const coins = currencyService.getTopCoins(limit);
            return res.json(coins);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Error fetching cryptocurrencies' });
        }
    }

    async getHistory(req: Request, res: Response): Promise<any> {
        try {
            const { symbol, period } = req.query;

            if (!symbol) {
                return res.status(400).json({ message: 'Symbol required' });
            }

            const history = await currencyService.getHistoryData(
                symbol as string, 
                (period as string) || '1D'
            );

            return res.json(history);
        } catch (e) {
            console.error('History Error:', e);
            return res.status(500).json({ message: 'Error fetching history' });
        }
    }

    async getRate(req: Request, res: Response): Promise<any> {
        try {
            const { symbol } = req.query;
            if (!symbol) return res.status(400).json({ message: 'Symbol required' });

            const priceData = await currencyService.getPrice(symbol as string);
            return res.json(priceData);
        } catch (e) {
            console.error('Error fetching rate:', e);
            return res.status(500).json({ message: 'Error fetching price' });
        }
    }
}

export default new CurrencyController();