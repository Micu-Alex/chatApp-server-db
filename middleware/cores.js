const cors = require('cors');

const corsOptions = {
    origin: "*"
  }

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;