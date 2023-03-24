import mongoose, { Types } from 'mongoose';

export interface TransactionDocument extends mongoose.Document {
    name: string;
    categoryName: string;
}

const transactionSchema = new mongoose.Schema(
    {
        ammount: {
            type: Number,
            min: 0,
            default: 0
        },
        user: {
            type: Types.ObjectId,
            ref: 'User',
            required: [true, 'Transaction must belong to a user!']
        },
        category: [
            {
                type: Types.ObjectId,
                ref: 'Category'
            }
        ],
        type: {
            type: String,
            enum: ['debit', 'credit'],
            required: [true, 'Please provide Transaction Type']
        },
        status: {
            type: String,
            enum: ['processing', 'completed'],
            required: [true, 'Please provide Transaction Status']
        },
        description: {
            type: String,
            required: [true, 'Please provide Description']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

transactionSchema.virtual('categories', {
    ref: 'Category',
    foreignField: '_id',
    localField: 'category',
    justOne: false,
    options: { select: 'name' },
    get: function () {
        const categories = this.populated('categories');
        const categoryObjs = categories.map((category: any) => category.name);
        console.log(categoryObjs);
        if (categoryObjs[0] === undefined) return [{ name: 'default' }];
        else return categories.map((category: any) => category[0]);
    }
});

export const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);
