import mongoose, { InferSchemaType, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface UserDocument extends mongoose.Document {
    email: string;
    name: string;
    surname: string;
    password: string | undefined;
    passwordConfirm: string;
    verified: boolean;
    passwordResetToken: string | undefined;
    passwordResetExpires: string | undefined;
    correctPassword(candidatePassword: string, userPassword: string | undefined): Promise<boolean>;
    createPasswordResetToken(): string;
}

function passwordMatchValidator(this: UserDocument, el: string): boolean {
    return el === this.password;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email']
        },
        name: {
            type: String,
            trim: true
        },
        surname: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [8, 'Password must have more or equal then 8 characters'],
            select: false
        },
        passwordConfirm: {
            type: String,
            validate: {
                validator: passwordMatchValidator,
                message: 'Passwords are not the same!'
            }
        },
        verified: {
            type: Boolean,
            default: false,
            select: false
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        emailConfirmationToken: String,
        emailConfirmationExpires: Date
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword: string | Buffer, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
export const User = mongoose.model<UserDocument>('User', userSchema);
