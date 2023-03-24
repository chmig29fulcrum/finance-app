import express from 'express';
import * as User from '../controllers/user';
import * as Auth from '../controllers/auth';

const router = express.Router();

router.post('/forgotPassword', Auth.forgotPassword);
router.patch('/resetPassword/:token', Auth.resetPassword);

router.post('/login', Auth.login);
router.get('/logout', Auth.logout);

router.route('/').get(User.getUsers).post(Auth.signup);

router.route('/:userId').get(User.getUser);

export default router;
