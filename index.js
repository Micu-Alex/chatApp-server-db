const express = require('express');
const { createServer } = require('node:http')
const handleSocket = require('./sockets/socketHandler');
const app = express();
const server = createServer(app);

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();

handleSocket(server) 

const port = 3000
server.listen(port, () => console.log(`app listening on ${port}`))

