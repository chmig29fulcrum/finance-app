import { NextFunction, RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { IsEmailOptions } from 'validator/lib/isEmail';
import { User, UserDocument } from '../models/user';
import jwt from 'jsonwebtoken';
import env from '../utils/validateEnv';
import { promisify } from 'util';
import crypto from 'crypto';

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

interface CookieOptions {
    expires: Date;
    secure?: boolean;
    httpOnly: boolean;
}

const signToken = (id: string) =>
    jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    });

const createSendToken = (user: UserDocument, satusCode: number, res: any) => {
    const token = signToken(user._id);
    const cookieOptions: CookieOptions = {
        expires: new Date(Date.now() + env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(satusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

export const signup: RequestHandler = async (req, res, next) => {
    const { email, name, surname, password, passwordConfirm } = req.body;

    try {
        if (!email || !password) {
            throw createHttpError(400, 'Please provide email & password!');
        }
        const newUser = await User.create({
            email: email,
            name: name,
            surname: surname,
            password: password,
            passwordConfirm: passwordConfirm
        });
        res.status(201).json(newUser);
    } catch (err) {
        handleHttpError(err, next);
    }
};

export const login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw createHttpError(400, 'Please provide email & password!');
        }
        const query = await User.findOne({ email }).select('+password');
        const user = await query;
        if (!user || !(await user.correctPassword(password, user.password))) {
            throw createHttpError(401, 'Incorrect email or password');
        }
        if (user.verified === false) {
            throw createHttpError(402, 'User is not verified!');
        }
        createSendToken(user, 200, res);
    } catch (err) {
        handleHttpError(err, next);
    }
};

export const logout: RequestHandler = async (req, res) => {
    console.log('test');
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

export const protect: RequestHandler = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies) {
            if (req.cookies.jwt) {
                token = req.cookies.jwt;
            }
        }

        if (!token) {
            throw createHttpError(401, 'You are not logged in! Please log in to get access.');
        }

        const decoded = await promisify<string, string>(jwt.verify)(token, env.JWT_SECRET);
        console.log(decoded);

        next();
    } catch (err) {
        handleHttpError(err, next);
    }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        throw createHttpError(404, 'There is no user with email address.');
    }
    try {
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
        res.status(200).json({
            resetURL: resetURL,
            message: 'Please open the resetURL to reset the password'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        handleHttpError(err, next);
    }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
        throw createHttpError(400, 'Token is invalid or has expired.');
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    createSendToken(user, 200, res);
};
