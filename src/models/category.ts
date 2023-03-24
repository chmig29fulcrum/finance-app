import mongoose, { Types } from 'mongoose';

export interface CategoryDocument extends mongoose.Document {
    name: string;
}

const categorySchema = new mongoose.Schema(
    {
        user: {
            type: Types.ObjectId,
            ref: 'User',
            required: [true, 'Category must belong to a user!']
        },
        name: {
            type: String,
            required: [true, 'Please provide Category Name'],
            unique: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema);
