import { Request, Response } from 'express';
import tradeService from '../services/tradeService';

class TradeController {
  async buy(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, currency, amount, currentPrice } = req.body;
      
      const transaction = await tradeService.executeBuy(
        Number(userId), 
        currency, 
        amount, 
        currentPrice
      );

      return res.json({ 
        message: `Successfully bought ${amount} ${currency}`, 
        transaction 
      });
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        if (e.message === 'WALLET_NOT_FOUND') return res.status(404).json({ message: 'Wallet not found' });
        if (e.message === 'INSUFFICIENT_FUNDS') return res.status(400).json({ message: 'Insufficient USD balance' });
      }
      return res.status(500).json({ message: 'Transaction failed' });
    }
  }

  async sell(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, currency, amount, currentPrice } = req.body;

      const transaction = await tradeService.executeSell(
        Number(userId), 
        currency, 
        amount, 
        currentPrice
      );

      return res.json({ 
        message: `Successfully sold ${amount} ${currency}`, 
        transaction 
      });
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
      if (e.message === 'WALLET_NOT_FOUND') return res.status(404).json({ message: 'Wallet not found' });
      if (e.message === 'INSUFFICIENT_ASSET') return res.status(400).json({ message: `Insufficient balance of ${req.body.currency}` });
      }
      return res.status(500).json({ message: 'Transaction failed' });
    }
  }
}

export default new TradeController();