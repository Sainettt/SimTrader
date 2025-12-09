import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';


const generateFakeCardNumber = () => {
    // 4276 - это бин Visa, остальные 12 цифр случайные
    const part1 = Math.floor(1000 + Math.random() * 9000); // 4 цифры
    const part2 = Math.floor(1000 + Math.random() * 9000); // 4 цифры
    const part3 = Math.floor(1000 + Math.random() * 9000); // 4 цифры
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

            if (!email || !password || !userName) {
                return res.status(400).json({ message: 'Email, password and userName are required' });
            }

            const candidate = await prisma.user.findUnique({ where: { email } });
            if (candidate) {
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
                            currency: 'USD',
                            balance: 0.0
                        }
                    }
                }
            });

            const token = generateJwt(user.id, user.email, user.username, user.createdAt);

            return res.json({ token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Registration error' });
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        try {
            const { email, password } = req.body;

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

            const hasUsdWallet = user.wallet.some(w => w.currency === 'USD');
            if (!hasUsdWallet) {
                await prisma.wallet.create({
                    data: {
                        userId: user.id,
                        currency: 'USD',
                        balance: 0.0
                    }
                });
                console.log(`[Login Fix] Created missing USD wallet for user ${user.id}`);
            }
            
            const token = generateJwt(user.id, user.email, user.username, user.createdAt);

            return res.json({ token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Login error' });
        }
    }
}

export default new AuthController();