import {Router} from 'express';
import tradeController from '../controllers/tradeController';
import {authMiddleware} from '../middleware/authMiddleware'

const router = Router();

router.use(authMiddleware);
router.post('/buy', tradeController.buy);
router.post('/sell', tradeController.sell);
export default router;