import { Router } from 'express';
import currencyController from '../controllers/currencyController';

const router = Router();

router.get('/list', currencyController.getTopCryptos);

export default router;