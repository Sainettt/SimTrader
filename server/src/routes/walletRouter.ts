import {Router} from 'express';
import walletController from '../controllers/walletController';

const router = Router();

router.post('/top-up', walletController.topUpWallet);
router.get('/:userId', walletController.getPortfolio);

export default router;