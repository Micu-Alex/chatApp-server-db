const mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect("mongodb://127.0.0.1/whatsapp-copy")
        .then(() => console.log(`connected to MongoDb`))
        .catch(err => console.log(err))
}