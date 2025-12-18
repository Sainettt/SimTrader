import { Request, Response } from 'express';
import prisma from '../prisma';
import binanceApi from './services/binanceApi';

class WalletController {

    async topUpWallet(req: Request, res: Response): Promise<any> {
        try {
            const { userId, amount } = req.body;
            const card = await prisma.bankCard.findUnique({ where: { userId } });
            
            if (!card || card.balance < amount) {
                return res.status(400).json({ message: 'Error with bank card or insufficient funds' });
            }
            
            const wallet = await prisma.wallet.findUnique({ where: { userId } });
            if (!wallet) {
                return res.status(404).json({ message: 'Wallet not found' });
            }

            await prisma.$transaction(async (tx) => {
                await tx.bankCard.update({ where: { userId }, data: { balance: { decrement: amount } } });
                await tx.wallet.update({ where: { id: wallet.id }, data: { balanceUsd: { increment: amount } } });
                await tx.transaction.create({
                    data: { walletId: wallet.id, type: 'DEPOSIT', currency: 'USD', amount, price: 1.0, totalUsd: amount }
                });
            });

            return res.json({ message: 'Top up successful' });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Transaction failed' });
        }
    }

    async getPortfolio(req: Request, res: Response): Promise<any> {
        try {
            const userId = parseInt(req.params.userId);

            const wallet = await prisma.wallet.findUnique({
                where: { userId },
                include: { assets: true }
            });

            if (!wallet) {
                return res.json({ totalBalanceUsd: "0.00", assets: [], totalChange24h: 0, totalChangePercent: 0 });
            }

            // 1. Собираем список символов для Binance
            const cryptoAssets = wallet.assets.filter(a => a.currency !== 'USD');
            const cryptoSymbols = cryptoAssets.map(asset => `${asset.currency}USDT`);

            let tickers: Record<string, { price: number, changePercent: number }> = {};

            // 2. Запрашиваем данные 24hr для процентов
            if (cryptoSymbols.length > 0) {
                try {
                    // Если монет немного, можно запрашивать конкретные, но /ticker/24hr дает всё сразу
                    // Чтобы не делать N запросов, берем всё и фильтруем (для MVP нормально)
                    const { data } = await binanceApi.get('/ticker/24hr');
                    data.forEach((t: any) => {
                        if (cryptoSymbols.includes(t.symbol)) {
                            tickers[t.symbol] = {
                                price: parseFloat(t.lastPrice),
                                changePercent: parseFloat(t.priceChangePercent)
                            };
                        }
                    });
                } catch (e) {
                    console.error("Binance API error", e);
                }
            }

            let totalBalanceUsd = wallet.balanceUsd; // Начинаем с фиатных USD
            let totalPreviousDayBalance = wallet.balanceUsd; // Для расчета общего процента изменения

            // 3. Считаем каждую монету
            const detailedAssets = wallet.assets.map(asset => {
                let currentPrice = 1;
                let changePercent = 0;

                if (asset.currency !== 'USD') {
                    const t = tickers[`${asset.currency}USDT`];
                    if (t) {
                        currentPrice = t.price;
                        changePercent = t.changePercent;
                    }
                }

                const currentValue = asset.balance * currentPrice;
                
                // Математика: вычисляем стоимость монеты 24ч назад
                // Формула: OldPrice = CurrentPrice / (1 + Percent/100)
                const previousValue = currentValue / (1 + (changePercent / 100));
                
                // Изменение в долларах для этой монеты
                const changeValue = currentValue - previousValue;

                if (asset.currency !== 'USD') {
                    totalBalanceUsd += currentValue;
                    totalPreviousDayBalance += previousValue;
                }

                return {
                    id: asset.id.toString(),
                    symbol: asset.currency,
                    name: asset.currency,
                    amount: asset.balance,
                    price: currentPrice,
                    value: currentValue,
                    change: changePercent, // % изменения
                    changeValue: changeValue // $ изменения
                };
            });

            // 4. Добавляем фиатный USD в список
            if (wallet.balanceUsd > 0) {
                 const hasUsd = detailedAssets.some(a => a.symbol === 'USD');
                 if(!hasUsd) {
                    detailedAssets.unshift({
                        id: 'usd-main',
                        symbol: 'USD',
                        name: 'US Dollar',
                        amount: wallet.balanceUsd,
                        price: 1,
                        value: wallet.balanceUsd,
                        change: 0,
                        changeValue: 0
                    });
                 }
            }

            // 5. Итоговая статистика портфеля
            const totalChangeValue = totalBalanceUsd - totalPreviousDayBalance;
            
            // Защита от деления на ноль
            let totalChangePercent = 0;
            if (totalPreviousDayBalance !== 0) {
                totalChangePercent = (totalChangeValue / totalPreviousDayBalance) * 100;
            }

            detailedAssets.sort((a, b) => b.value - a.value);

            return res.json({
                totalBalanceUsd: totalBalanceUsd.toFixed(2),
                totalChangeValue: totalChangeValue.toFixed(2),     // +150.20
                totalChangePercent: totalChangePercent.toFixed(2), // +1.25
                assets: detailedAssets
            });

        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Error' });
        }
    }
    async getTransactions(req: Request, res: Response): Promise<any> {
        try {
            const userId = parseInt(req.params.userId);

            const wallet = await prisma.wallet.findUnique({
                where: { userId },
            });

            if (!wallet) {
                return res.status(404).json({ message: 'Wallet not found' });
            }

            const transactions = await prisma.transaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' }
            });

            return res.json(transactions);
        } catch (e) {
            console.error('Error fetching transactions:', e);
            return res.status(500).json({ message: 'Error fetching transactions' });
        }
    }
}

export default new WalletController();