import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router();

router.post('/registration', authController.registration);
router.post('/login', authController.login);
router.get('/check', authMiddleware, authController.check)
router.post('/google', authController.googleLogin);
export default router;