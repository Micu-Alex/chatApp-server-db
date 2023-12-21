const Joi = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlenght: 1,
        maxlenght: 1000,
    },
    user: {
        username: String,
    },
    toUser: {
        username: String,
    } 
})

const Message = mongoose.model("message", messageSchema)

exports.Message = Message