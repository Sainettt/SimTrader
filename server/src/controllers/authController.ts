import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const generateJwt = (id: number, email: string) => {
    return jwt.sign(
        { id, email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
    );
};

class AuthController {

    async registration(req: Request, res: Response): Promise<any> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const candidate = await prisma.user.findUnique({ where: { email } });
            if (candidate) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            const hashPassword = await bcrypt.hash(password, 5);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashPassword
                }
            });

            const token = generateJwt(user.id, user.email);

            return res.json({ token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Registration error' });
        }
    }

    async login(req: Request, res: Response): Promise<any> {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return res.status(400).json({ message: 'Incorrect password' });
            }
            
            const token = generateJwt(user.id, user.email);

            return res.json({ token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: 'Login error' });
        }
    }
}

export default new AuthController();