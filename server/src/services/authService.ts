import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import crypto from 'node:crypto';

class AuthService {
  // --- Утилиты для генерации данных ---
  private generateFakeCardNumber() {
    const part = () => Math.floor(1000 + Math.random() * 9000);
    return `4276 ${part()} ${part()} ${part()}`;
  }

  private generateRandomCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  private generateRandomExpiry() {
    const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const year = (new Date().getFullYear() % 100 + Math.floor(2 + Math.random() * 5)).toString();
    return `${month}/${year}`;
  }

  // --- Основная логика ---
  generateJwt(id: number, email: string, userName: string, createdAt: Date) {
    return jwt.sign(
      { id, email, userName, createdAt },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
  }

  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { bankCard: true, wallet: true },
    });
  }

  async findUserById(id: number) {
    return await prisma.user.findUnique({ where: { id }, include: { bankCard: true, wallet: true } });
  }

  /**
   * Универсальный метод создания пользователя с кошельком и картой.
   * Используется и в обычной регистрации, и в Google Login.
   */
  async createUserWithDetails(email: string, userName: string, passwordHash: string | null) {
    return await prisma.user.create({
      data: {
        username: userName,
        email,
        password: passwordHash,
        bankCard: {
          create: {
            cardNumber: this.generateFakeCardNumber(),
            cvv: this.generateRandomCVV(),
            expiry: this.generateRandomExpiry(),
            balance: 10000.0,
          },
        },
        wallet: {
          create: { balanceUsd: 0.0 },
        },
      },
      include: { wallet: true, bankCard: true },
    });
  }

  /**
   * Метод для обеспечения наличия кошелька и карты у старых пользователей (Login Fix)
   */
  async ensureWalletAndCard(user: any) {

    if (user.bankCard && user.wallet) {
      return user.wallet.walletUid;
    }

    return await prisma.$transaction(async (tx) => {
      let walletUid = user.wallet?.walletUid;

      if (!user.bankCard) {
        await tx.bankCard.create({
          data: {
            userId: user.id,
            cardNumber: this.generateFakeCardNumber(),
            cvv: this.generateRandomCVV(),
            expiry: this.generateRandomExpiry(),
            balance: 10000.0,
          },
        });
        console.log(`[Service Fix] Created missing bank card for user ${user.id}`);
      }

      if (!user.wallet) {
        const newWallet = await tx.wallet.create({
          data: { userId: user.id, balanceUsd: 0.0 },
        });
        walletUid = newWallet.walletUid;
        console.log(`[Service Fix] Created missing Wallet for user ${user.id}`);
      }

      return walletUid;
    });
  }
}

export default new AuthService();