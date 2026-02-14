import prisma from '../prisma';
import { getTickerFromCache } from './priceCache';

class WalletService {
    /**
     * Пополнение баланса кошелька с банковской карты
     */
    async topUp(userId: number, amount: number) {
        const card = await prisma.bankCard.findUnique({ where: { userId } });
        if (!card || card.balance < amount) {
            throw new Error('INSUFFICIENT_CARD_FUNDS');
        }

        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error('WALLET_NOT_FOUND');

        return await prisma.$transaction(async (tx) => {
            await tx.bankCard.update({ where: { userId }, data: { balance: { decrement: amount } } });
            await tx.wallet.update({ where: { id: wallet.id }, data: { balanceUsd: { increment: amount } } });
            return await tx.transaction.create({
                data: { walletId: wallet.id, type: 'DEPOSIT', currency: 'USD', amount, price: 1.0, totalUsd: amount }
            });
        });
    }

    /**
     * Вывод средств с кошелька на карту
     */
    async withdraw(userId: number, amount: number) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.balanceUsd < amount) throw new Error('INSUFFICIENT_WALLET_FUNDS');

        const card = await prisma.bankCard.findUnique({ where: { userId } });
        if (!card) throw new Error('CARD_NOT_FOUND');

        return await prisma.$transaction(async (tx) => {
            await tx.wallet.update({ where: { id: wallet.id }, data: { balanceUsd: { decrement: amount } } });
            await tx.bankCard.update({ where: { userId }, data: { balance: { increment: amount } } });
            return await tx.transaction.create({
                data: { walletId: wallet.id, type: 'WITHDRAWAL', currency: 'USD', amount, price: 1.0, totalUsd: amount }
            });
        });
    }

    /**
     * Расчет данных портфеля (Бизнес-логика)
     */
    async calculatePortfolio(userId: number) {
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
            include: { assets: true }
        });

        if (!wallet) {
            return { totalBalanceUsd: "0.00", assets: [], totalChangeValue: "0.00", totalChangePercent: "0.00" };
        }

        let totalBalanceUsd = wallet.balanceUsd;
        let totalPreviousDayBalance = wallet.balanceUsd;

        const detailedAssets = wallet.assets.map(asset => {
            let currentPrice = 1;
            let changePercent = 0;

            if (asset.currency !== 'USD') {
                const tickerName = `${asset.currency}USDT`;
                const tickerData = getTickerFromCache(tickerName);
                currentPrice = tickerData.price;
                changePercent = tickerData.changePercent;
            }

            const currentValue = asset.balance * currentPrice;
            let previousValue = currentValue;
            
            if (changePercent !== 0) {
                previousValue = currentValue / (1 + (changePercent / 100));
            }

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
                change: changePercent,
                changeValue: changeValue
            };
        });

        // Добавляем саму валюту USD как актив, если баланс > 0
        if (wallet.balanceUsd > 0 && !detailedAssets.some(a => a.symbol === 'USD')) {
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

        const totalChangeValue = totalBalanceUsd - totalPreviousDayBalance;
        const totalChangePercent = totalPreviousDayBalance !== 0 
            ? (totalChangeValue / totalPreviousDayBalance) * 100 
            : 0;

        detailedAssets.sort((a, b) => b.value - a.value);

        return {
            totalBalanceUsd: totalBalanceUsd.toFixed(2),
            totalChangeValue: totalChangeValue.toFixed(2),
            totalChangePercent: totalChangePercent.toFixed(2),
            assets: detailedAssets
        };
    }

    async getUserTransactions(userId: number) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new Error('WALLET_NOT_FOUND');

        return await prisma.transaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export default new WalletService();