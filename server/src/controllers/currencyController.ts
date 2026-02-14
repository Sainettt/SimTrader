import { Request, Response } from 'express';
import currencyService from '../services/currencyService';

class CurrencyController {
    async getTopCryptos(req: Request, res: Response): Promise<Response> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const coins = currencyService.getTopCoins(limit);
            return res.json(coins);
        } catch (_e) {
            console.error(_e);
            return res.status(500).json({ message: 'Error fetching cryptocurrencies' });
        }
    }

    async getHistory(req: Request, res: Response): Promise<Response> {
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
        } catch (_e) {
            console.error('History Error:', _e);
            return res.status(500).json({ message: 'Error fetching history' });
        }
    }

    async getRate(req: Request, res: Response): Promise<Response> {
        try {
            const { symbol } = req.query;
            if (!symbol) return res.status(400).json({ message: 'Symbol required' });

            const priceData = await currencyService.getPrice(symbol as string);
            return res.json(priceData);
        } catch (_e) {
            console.error('Error fetching rate:', _e);
            return res.status(500).json({ message: 'Error fetching price' });
        }
    }
}

export default new CurrencyController();