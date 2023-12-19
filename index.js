const mongoose = require('mongoose');
const users = require("./routes/users")
const auth = require("./routes/auth")
const express = require('express');
const config = require("config")
const { join } = require('node:path');
const { createServer } = require('node:http')
const handleSocket = require('./sockets/socketHandler');
const app = express()
const server = createServer(app);


mongoose.connect("mongodb://127.0.0.1/whatsapp-copy")
    .then(() => console.log(`connected to MongoDb`))
    .catch(err => console.log(err))


if (!config.get("jwtPrivateKey")) throw new Error("FATAL ERROR: jwtPrivateKey is not defined")

app.use(express.json())
app.use("/api/users", users)
app.use("/api/auth", auth)
    

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'login.html'));
});

handleSocket(server) 



server.listen(3000, () => console.log("app listening on port 3000"))

