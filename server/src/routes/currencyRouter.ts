import { Router } from 'express';
import currencyController from '../controllers/currencyController';

const router = Router();

router.get('/list', currencyController.getTopCryptos);
router.get('/history', currencyController.getHistory);
router.get('/rate', currencyController.getRate);
export default router;