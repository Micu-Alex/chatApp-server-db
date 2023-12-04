
const mongoose = require('mongoose');
const Joi = require("joi")

const userSchema = new mongoose.Schema({
    name: String
});

const User = mongoose.model('user', userSchema);

const ValidateUser = (user) => {
    const schema = {
        name: Joi.string()
    }
    return Joi.validate(user, schema)
}


exports.validate = ValidateUser 
exports.User = User