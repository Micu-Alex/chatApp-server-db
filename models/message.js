const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true,
        minlenght: 1,
        maxlenght: 1000,
    },
    sender: {
        username: String,
    },
    receiver: {
        username: String,
    } ,
    isSeen: {
    type: Boolean,
    default: false, 
    }
})

const Message = mongoose.model("message", messageSchema)

exports.Message = Message