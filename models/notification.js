const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
})

const Notification = mongoose.model('notification', notificationSchema);

exports.Notification = Notification