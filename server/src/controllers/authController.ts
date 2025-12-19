import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { isValidEmail, isValidPassword } from '../utils/validation'

const generateFakeCardNumber = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(1000 + Math.random() * 9000);
    return `4276 ${part1} ${part2} ${part3}`;
};

const generateRandomCVV = () => {
    return Math.floor(100 + Math.random() * 900).toString();
};

const generateRandomExpiry = () => {
    const month = Math.floor(1 + Math.random() * 12).toString().padStart(2, '0');
    const currentYear = new Date().getFullYear() % 100;
    const year = (currentYear + Math.floor(2 + Math.random() * 5)).toString();
    return `${month}/${year}`;
};

const generateJwt = (id: number, email: string, userName: string, createdAt: Date) => {
    return jwt.sign(
        { id, email, userName, createdAt },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
    );
};

class AuthController {

    async registration(req: Request, res: Response): Promise<any> {
        try {
            const { userName, email, password } = req.body;

            if (!isValidEmail(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            if (!isValidPassword(password)) {
                return res.status(400).json({ 
                    message: 'Password must be at least 6 chars, contain 1 uppercase & 1 special char' 
                });
            }

            if (!email || !password || !userName) {
                return res.status(400).json({ message: 'Email, password and userName are required' });
            }

            const existingUser = await prisma.user.findUnique({where: { email }})
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            const hashPassword = await bcrypt.hash(password, 5);

            const user = await prisma.user.create({
                data: {
                    username: userName,
                    email,
                    password: hashPassword,
                    
                    bankCard: {
                        create: {
                            cardNumber: generateFakeCardNumber(),
                            cvv: generateRandomCVV(),
                            expiry: generateRandomExpiry(),
                            balance: 10000.0
                        }
                    },
                    
                    wallet: {
                        create: {
                            balanceUsd: 0.0,
                        }
                    }
                },
                include: {
                    wallet: true
                }
            });

            const token = generateJwt(user.id, user.email, user.username, user.createdAt);

            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    walletUid: user.wallet?.walletUid
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Registration error' });
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        try {
            const { email, password } = req.body;

            // if (!isValidEmail(email)) {
            //      return res.status(400).json({ message: 'Invalid email format' });
            // }

            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    bankCard: true,
                    wallet: true
                }
            });

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return res.status(400).json({ message: 'Incorrect password' });
            }

            if (!user.bankCard) {
                await prisma.bankCard.create({
                    data: {
                        userId: user.id,
                        cardNumber: generateFakeCardNumber(),
                        cvv: generateRandomCVV(),
                        expiry: generateRandomExpiry(),
                        balance: 10000.0
                    }
                });
                console.log(`[Login Fix] Created missing bank card for user ${user.id}`);
            }

            let userWallet = user.wallet;
            if (!userWallet) {
                userWallet = await prisma.wallet.create({
                    data: {
                        userId: user.id,
                        balanceUsd: 0.0
                    }
                });
                console.log(`[Login Fix] Created missing Wallet for user ${user.id}`);
            }

            const token = generateJwt(user.id, user.email, user.username, user.createdAt);

            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    walletUid: userWallet.walletUid
                }
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Login error' });
        }
    }
}

export default new AuthController();