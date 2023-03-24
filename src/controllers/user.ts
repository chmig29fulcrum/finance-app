import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { User } from '../models/user';

export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};

export const getUser: RequestHandler = async (req, res, next) => {
    const userId = req.params.userId;

    try {
        if (!mongoose.isValidObjectId(userId)) {
            throw createHttpError(400, 'Invalid User Id');
        }
        const user = await User.findById(userId);
        if (!user) {
            throw createHttpError(404, 'User not found');
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};
