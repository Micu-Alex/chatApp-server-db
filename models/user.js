const mongoose = require('mongoose');
const Joi = require("joi")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlenght: 5,
        maxlenght: 20,
    },
    email: {
        type: String,
        unique: true,
        minlenght: 5,
        maxlenght: 50,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlenght: 8,
        maxlenght: 80,
    },
});

const User = mongoose.model('user', userSchema);

const ValidateUser = (user) => {
    const schema = Joi.object({
        name: Joi.string().min(5).max(20).required(),
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(8).max(80).required()
    });
    return schema.validate(user)
}


exports.validate = ValidateUser 
exports.User = User