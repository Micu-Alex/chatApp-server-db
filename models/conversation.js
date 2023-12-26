const mongoose = require('mongoose');
const Message = require('../models/message');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    }]
})

const Conversation = mongoose.model('conversation', conversationSchema);

exports.Conversation = Conversation