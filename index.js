const mongoose = require('mongoose');
const users = require("./routes/users")
const messages = require("./routes/messages")
const auth = require("./routes/auth")
const express = require('express');
const config = require("config")
const { join } = require('node:path');
const { createServer } = require('node:http')

const { Server } = require("socket.io");

//temp improsts
const {Message} = require("./models/message")

const app = express()
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});


mongoose.connect("mongodb://127.0.0.1/whatsapp-copy")
    .then(() => console.log(`connected to MongoDb`))
    .catch(err => console.log(err))


if (!config.get("jwtPrivateKey")) throw new Error("FATAL ERROR: jwtPrivateKey is not defined")

app.use(express.json())
app.use("/api/users", users)
app.use("/api/messages", messages)
app.use("/api/auth", auth)
    

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});


io.on('connection', async (socket) => {
  socket.on('chat message', async (msg) => {

    const message = new Message({message: msg})


    try {
      result = await message.save();
    } catch (err) {
    }
    io.emit('chat message', message.message, result._id);
    });


      // Emit previous messages upon a new connection
    if (!socket.recovered) {
      try {
        const serverOffset = socket.handshake.auth.serverOffset || null;

        const query = serverOffset ? { _id: { $gt: serverOffset } } : {};
        const messages = await Message.find(query).lean(); 

        messages.forEach((message) => {
          console.log("recovered:", message._id);
          socket.emit('chat message', message.message, message._id); 
        });

        socket.recovered = true; 
      } catch (err) {
        console.error('Error retrieving messages:', err);
      }
  }
});


server.listen(3000, () => console.log("app listening on port 3000"))

