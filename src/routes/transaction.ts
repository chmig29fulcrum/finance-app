import express from 'express';
import * as Transaction from '../controllers/transaction';
import * as Auth from '../controllers/auth';

const router = express.Router();

router.route('/').get(Transaction.getTransactions).post(Auth.protect, Transaction.createTransaction);
router.route('/:id').get(Transaction.getTransaction).patch(Auth.protect, Transaction.updateTransaction).delete(Auth.protect, Transaction.deleteTransaction);
export default router;
