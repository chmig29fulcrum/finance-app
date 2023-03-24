import 'dotenv/config';
import express, { NextFunction, Response, Request } from 'express';
import userRoutes from './routes/user';
import categoryRoutes from './routes/category';
import transactionRoutes from './routes/transaction';

import morgan from 'morgan';
import createHttpError, { isHttpError } from 'http-errors';

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((req, res, next) => {
    //   next(Error('Endpoint not found!'));
    next(createHttpError(404, 'Endpoint not found!'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = 'An unkown eror occured';
    let statusCode = 500;
    // if (error instanceof Error) errorMessage = error.message;
    if (isHttpError(error)) {
        statusCode = error.statusCode;
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});

export default app;
