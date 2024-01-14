const mongoose = require('mongoose');
const config = require("config")

const mongodbConfig = config.get('mongodb');
module.exports = () => {
    mongoose.connect(`mongodb+srv://alexmicu389:${mongodbConfig.password}@cluster0.onjjcr7.mongodb.net/chatApp?retryWrites=true&w=majority`)
        .then(() => console.log(`connected to MongoDb`))
        .catch(err => console.log(err))
}