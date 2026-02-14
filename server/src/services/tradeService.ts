import prisma from '../prisma';

class TradeService {
  /**
   * Логика покупки криптовалюты (USD -> Crypto)
   */
  async executeBuy(userId: number, currency: string, amount: number, currentPrice: number) {
    const totalCostUsd = amount * currentPrice;

    // 1. Проверяем наличие кошелька
    const wallet = await prisma.wallet.findUnique({
      where: { userId: Number(userId) }
    });

    if (!wallet) throw new Error('WALLET_NOT_FOUND');
    if (wallet.balanceUsd < totalCostUsd) throw new Error('INSUFFICIENT_FUNDS');

    // 2. Атомарная транзакция
    return await prisma.$transaction(async (tx) => {
      // Снимаем USD
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceUsd: { decrement: totalCostUsd } }
      });

      // Добавляем/обновляем крипто-актив
      await tx.asset.upsert({
        where: {
          walletId_currency: { walletId: wallet.id, currency: currency }
        },
        update: { balance: { increment: amount } },
        create: {
          walletId: wallet.id,
          currency: currency,
          balance: amount
        }
      });

      // Создаем запись о транзакции
      return await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'BUY',
          currency: currency,
          amount: amount,
          price: currentPrice,
          totalUsd: totalCostUsd
        }
      });
    });
  }

  /**
   * Логика продажи криптовалюты (Crypto -> USD)
   */
  async executeSell(userId: number, currency: string, amount: number, currentPrice: number) {
    const totalRevenueUsd = amount * currentPrice;

    const wallet = await prisma.wallet.findUnique({
      where: { userId: Number(userId) }
    });

    if (!wallet) throw new Error('WALLET_NOT_FOUND');

    // Проверяем наличие актива для продажи
    const asset = await prisma.asset.findUnique({
      where: {
        walletId_currency: { walletId: wallet.id, currency: currency }
      }
    });

    if (!asset || asset.balance < amount) throw new Error('INSUFFICIENT_ASSET');

    // Атомарная транзакция
    return await prisma.$transaction(async (tx) => {
      // Уменьшаем крипто-актив
      await tx.asset.update({
        where: { id: asset.id },
        data: { balance: { decrement: amount } }
      });

      // Начисляем USD
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceUsd: { increment: totalRevenueUsd } }
      });

      // Запись о транзакции
      return await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'SELL',
          currency: currency,
          amount: amount,
          price: currentPrice,
          totalUsd: totalRevenueUsd
        }
      });
    });
  }
}

export default new TradeService();