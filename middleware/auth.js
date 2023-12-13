const jwt = require("jsonwebtoken")
const config = require("config")


module.exports = function (socket, next) {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

     try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        socket.decoded = decoded; // Attach decoded user info to the socket for later use
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
}


