import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import authService from '../services/authService';
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
      const user = await authService.createUserWithDetails(email, userName, hashPassword);

      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username, walletUid: user.wallet?.walletUid },
      });
    } catch (_e) {
      console.error(_e);
      return res.status(500).json({ message: 'Registration error' });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const user = await authService.findUserByEmail(email);
      if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const walletUid = await authService.ensureWalletAndCard(user);
      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username, walletUid },
      });
    } catch {
      return res.status(500).json({ message: 'Login error' });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { email, userName } = req.body;
      let user = await authService.findUserByEmail(email);

      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashPassword = await bcrypt.hash(randomPassword, 10);
        user = await authService.createUserWithDetails(email, userName || email.split('@')[0], hashPassword);
      }

      const walletUid = await authService.ensureWalletAndCard(user);
      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);

      return res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username, walletUid },
      });
    } catch {
      return res.status(500).json({ message: 'Google login error' });
    }
  }

  async check(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await authService.findUserById(Number(req.user?.id));
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const token = authService.generateJwt(user.id, user.email, user.username, user.createdAt);
      return res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    } catch {
      return res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new AuthController();