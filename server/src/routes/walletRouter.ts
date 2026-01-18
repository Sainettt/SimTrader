import {Router} from 'express';
import walletController from '../controllers/walletController';
import {authMiddleware} from '../middleware/authMiddleware'

const router = Router();

router.use(authMiddleware);
router.post('/top-up', walletController.topUpWallet);
router.get('/:userId', walletController.getPortfolio);
router.get('/:userId/transactions', walletController.getTransactions);
router.post('/withdraw', walletController.withdraw);

export default router;