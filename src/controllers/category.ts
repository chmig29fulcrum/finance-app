import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { Category } from '../models/category';
import { createOne, updateOne, deleteOne, getOne, getAll } from './default';

export const getCategories: RequestHandler = getAll(Category);

export const getCategory: RequestHandler = getOne(Category, {
    path: ''
});

export const createCategory: RequestHandler = createOne(Category);

export const updateCategory: RequestHandler = updateOne(Category);

export const deleteCategory: RequestHandler = deleteOne(Category);
