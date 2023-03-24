import { NextFunction, RequestHandler } from 'express';
import createHttpError from 'http-errors';
import APIFeatures from '../utils/apiFeatures';

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

interface Model {
    create(data: any): Promise<any>;
}

export const createOne =
    (Model: Model): RequestHandler =>
    async (req, res, next) => {
        try {
            const doc = await Model.create(req.body);
            res.status(201).json({
                status: 'success',
                data: {
                    data: doc
                }
            });
        } catch (err: unknown) {
            handleHttpError(err, next);
        }
    };

export const updateOne =
    (Model: any): RequestHandler =>
    async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
                useFindAndModify: false
            });
            if (!doc) {
                next(createHttpError(404, 'No document found with that Id'));
            }
            res.status(200).json({
                status: 'success',
                data: {
                    data: doc
                }
            });
        } catch (err) {
            handleHttpError(err, next);
        }
    };

export const deleteOne =
    (Model: any): RequestHandler =>
    async (req, res, next) => {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) {
                next(createHttpError(404, 'No document found with that Id'));
            }
            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (err) {
            handleHttpError(err, next);
        }
    };

export const getOne =
    (Model: any, populateOptions: any): RequestHandler =>
    async (req, res, next) => {
        try {
            let query = Model.findById(req.params.id);
            if (populateOptions.path) query = query.populate(populateOptions);

            const doc = await query;
            if (!doc) {
                next(createHttpError(404, 'No document found with that Id'));
            }
            res.status(200).json({
                status: 'success',

                data: {
                    data: doc
                }
            });
        } catch (err) {
            handleHttpError(err, next);
        }
    };

export const getAll =
    (Model: any): RequestHandler =>
    async (req, res, next) => {
        try {
            const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();
            const docs = await features.query;
            console.log(docs);

            res.status(200).json({
                status: 'success',
                results: docs.length,
                data: {
                    data: docs
                }
            });
        } catch (err) {
            handleHttpError(err, next);
        }
    };
