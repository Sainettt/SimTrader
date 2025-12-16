import {Router} from 'express';
import tradeController from '../controllers/tradeController';

const router = Router();

router.post('/buy', tradeController.buy);
router.post('/sell', tradeController.sell);
export default router;