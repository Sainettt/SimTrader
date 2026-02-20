import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import authService, { UserWithDetails } from '../services/authService'; // Импорт типа
import { isValidEmail, isValidPassword } from '../utils/validation';
import crypto from 'node:crypto';
import { AuthRequest } from '../middleware/authMiddleware';

class AuthController {
  async registration(req: Request, res: Response): Promise<Response> {
    try {
      const { userName, email, password } = req.body;

      if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
      if (!isValidPassword(password)) return res.status(400).json({ message: 'Password too weak' });
      if (!userName) return res.status(400).json({ message: 'Username required' });

      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const hashPassword = await bcrypt.hash(password, 10);
      const user: UserWithDetails = await authService.createUserWithDetails(email, userName, hashPassword);

      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username, 
          walletUid: user.wallet?.walletUid 
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Registration error' });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const user: UserWithDetails | null = await authService.findUserByEmail(email);
      if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const walletUid = await authService.ensureWalletAndCard(user);
      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username, walletUid },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Login error' });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ message: 'Invalid idToken' });

      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: 'Invalid Google token payload' });
      }

      const email = payload.email;
      const userName = payload.name || email.split('@')[0];

      let user: UserWithDetails | null = await authService.findUserByEmail(email);

      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashPassword = await bcrypt.hash(randomPassword, 10);
        user = await authService.createUserWithDetails(email, userName, hashPassword);
      }
      
      if (!user) return res.status(500).json({ message: 'Error identifying user' });

      const walletUid = await authService.ensureWalletAndCard(user);
      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username, walletUid },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Google login error' });
    }
  }

  async check(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const user = await authService.findUserById(Number(userId));
      if (!user) return res.status(401).json({ message: 'User not found' });

      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);
      
      return res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username 
        } 
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new AuthController();