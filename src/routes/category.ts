import express from 'express';
import * as Category from '../controllers/category';
import * as Auth from '../controllers/auth';

const router = express.Router();

router.route('/').get(Category.getCategories).post(Auth.protect, Category.createCategory);
router.route('/:id').get(Category.getCategory).patch(Auth.protect, Category.updateCategory).delete(Auth.protect, Category.deleteCategory);

export default router;
