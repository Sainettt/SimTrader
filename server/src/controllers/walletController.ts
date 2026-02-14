import { Request, Response } from 'express';
import walletService from '../services/walletService';

class WalletController {
    async topUpWallet(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, amount } = req.body;
            await walletService.topUp(Number(userId), amount);
            return res.json({ message: 'Top up successful' });
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (e.message === 'INSUFFICIENT_CARD_FUNDS') return res.status(400).json({ message: 'Insufficient funds on card' });
            }
            return res.status(500).json({ message: 'Transaction failed' });
        }
    }

    async getPortfolio(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.userId as string);
            const portfolio = await walletService.calculatePortfolio(userId);
            return res.json(portfolio);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error('Error fetching portfolio:', e.message);
            }
            return res.status(500).json({ message: 'Error fetching portfolio' });
        }
    }

    async getTransactions(req: Request, res: Response): Promise<Response> {
        try {
            const userId = parseInt(req.params.userId as string);
            const transactions = await walletService.getUserTransactions(userId);
            return res.json(transactions);
        } catch (e: unknown) {
            if (e instanceof Error) {
                console.error('Error fetching transactions:', e.message);
            }
            return res.status(500).json({ message: 'Error fetching transactions' });
        }
    }

    async withdraw(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, amount } = req.body;
            await walletService.withdraw(Number(userId), amount);
            return res.json({ message: 'Withdrawal successful' });
        } catch (e: unknown) {
            if (e instanceof Error && e.message === 'INSUFFICIENT_WALLET_FUNDS') {
                return res.status(400).json({ message: 'Insufficient USD balance' });
            }
            return res.status(500).json({ message: 'Withdrawal failed' });
        }
    }
}

export default new WalletController();