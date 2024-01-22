const { string } = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: false,
        minlenght: 1,
        maxlenght: 1000,
    },
    sender: {
        username: String,
    },
    receiver: {
        username: String,
    },
    file: {
        data: { type: String, required: false },
        contentType: { type: String, required: false },
        fileName: { type: String, required: false },
      },
})

const Message = mongoose.model("message", messageSchema)

exports.Message = Message