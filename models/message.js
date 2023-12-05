const Joi = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlenght: 1,
        maxlenght: 1000,
    }
})

const Message = mongoose.model("message", messageSchema)

const ValidateMessage = (message) => {
    const schema = Joi.object({
        message: Joi.string().min(1).max(1000).required()
    })
    return schema.validate(message)
}

exports.validate = ValidateMessage
exports.Message = Message