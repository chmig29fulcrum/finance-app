import { NextFunction, RequestHandler } from 'express';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction';
import { createOne, updateOne, deleteOne, getOne, getAll } from './default';

function handleHttpError(err: unknown, next: NextFunction): void {
    let msg: string;
    if (err instanceof Error) {
        msg = err.message;
    } else {
        msg = 'Unknown error occurred';
    }
    const httpError = createHttpError(400, msg);
    next(httpError);
}

export const getTransactions: RequestHandler = getAll(Transaction);

export const getTransaction: RequestHandler = getOne(Transaction, {
    path: 'categories'
});
export const createTransaction: RequestHandler = createOne(Transaction);

export const updateTransaction: RequestHandler = updateOne(Transaction);
export const deleteTransaction: RequestHandler = deleteOne(Transaction);
