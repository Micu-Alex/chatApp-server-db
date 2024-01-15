const mongoose = require('mongoose');
const config = require("config")

const mongodbConfig = config.get('mongodb');
module.exports = () => {

    mongoose.connect(mongodbConfig.mongoAdress)
        .then(() => console.log(`connected to MongoDb`))
        .catch(err => console.log(err))
}