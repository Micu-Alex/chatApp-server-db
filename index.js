const express = require('express');
const config = require("config")
const { join } = require('node:path');
const { createServer } = require('node:http')
const handleSocket = require('./sockets/socketHandler');
const app = express();
require("./startup/routes")(app);
require("./startup/db")();
const server = createServer(app);






if (!config.get("jwtPrivateKey")) throw new Error("FATAL ERROR: jwtPrivateKey is not defined")


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'login.html'));
});

handleSocket(server) 


const port = 3000
server.listen(port, () => console.log(`app listening on ${port}`))

