import { Router } from 'express';
import currencyController from '../controllers/currencyController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = Router();

router.use(authMiddleware);
router.get('/list', currencyController.getTopCryptos);
router.get('/history', currencyController.getHistory);
router.get('/rate', currencyController.getRate);
export default router;