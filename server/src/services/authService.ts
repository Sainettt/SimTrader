import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { User, Wallet, BankCard } from '@prisma/client';

// Определяем составной тип
export type UserWithDetails = User & {
  bankCard: BankCard | null;
  wallet: Wallet | null;
};

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

  async findUserByEmail(email: string): Promise<UserWithDetails | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { bankCard: true, wallet: true },
    });
    return user as UserWithDetails | null;
  }

  async findUserById(id: number): Promise<UserWithDetails | null> {
    const user = await prisma.user.findUnique({ 
        where: { id }, 
        include: { bankCard: true, wallet: true } 
    });
    return user as UserWithDetails | null;
  }

  /**
   * Исправлен метод создания: добавлено 'as UserWithDetails'
   */
  async createUserWithDetails(email: string, userName: string, passwordHash: string | null): Promise<UserWithDetails> {
    const user = await prisma.user.create({
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
    
    // ВАЖНО: Принудительно указываем тип
    return user as UserWithDetails;
  }

  /**
   * Исправлен тип возврата: Promise<string | null>
   */
  async ensureWalletAndCard(user: UserWithDetails): Promise<string | null> {
    if (user.bankCard && user.wallet) {
      return user.wallet.walletUid;
    }

    const result = await prisma.$transaction(async (tx) => {
      let walletUid: string | null = user.wallet?.walletUid || null;

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
      }

      if (!user.wallet) {
        const newWallet = await tx.wallet.create({
          data: { userId: user.id, balanceUsd: 0.0 },
        });
        walletUid = newWallet.walletUid;
      }

      return walletUid;
    });

    return result; 
  }
}

export default new AuthService();