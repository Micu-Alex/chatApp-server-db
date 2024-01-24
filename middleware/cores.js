const cors = require('cors');

const corsOptions = {
    origin: "https://chat-application-delta-indol.vercel.app"
  }

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;