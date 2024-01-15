const config = require("config")

module.exports = () => {
    if (!config.get("jwtPrivateKey")) throw new Error("FATAL ERROR: jwtPrivateKey is not defined")
    if (!config.get("mongodb.mongoAdress")) throw new Error("FATAL ERROR: mongodb address is not defined")
}