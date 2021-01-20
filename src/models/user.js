const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            validate(value) {
                if (value <= 0) throw new Error('Age must be higher than 0');
            },
        },
        password: {
            type: String,
            trim: true,
            required: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes('password'))
                    throw new Error(
                        'Password should not contain word password'
                    );
            },
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate(value) {
                if (!validator.isEmail(value))
                    throw new Error('Email is invalid');
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);

// virtual

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign(
        { _id: this._id.toString() },
        process.env.JWT_SECRET
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const error = 'Unable to login';
    const user = await User.findOne({ email });

    if (!user) throw new Error(error);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error(error);
    return user;
};

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
});

// Delete user tasks when user is
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
