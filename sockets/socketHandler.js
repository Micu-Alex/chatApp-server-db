const { Server } = require("socket.io");
const { Message } = require("../models/message");
const { User } = require("../models/user");
const auth = require("../middleware/auth");

function handleSocket(server) {
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  io.use((socket, next) => {
    auth(socket, next);
  });

  io.on("connection", (socket) => {
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: id,
        username: socket.decoded.name,
      });
    }
    socket.emit("users", users);
    // ...
  });

  io.on('connection', async (socket) => {
    const name = socket.decoded.name;
    socket.on('chat message', async (msg) => {
  
      const user = await User.findOne({ name: name })
      if (!user) {
        console.error('User not found');
        return;
      }
      const message = new Message({message: msg, user: {username: user.name}})
  
  
      try {
        result = await message.save();
      } catch (err) {
      }
      io.emit('chat message', message, result._id);
      });
  
  
        // Emit previous messages upon a new connection
      if (!socket.recovered) {
        try {
          const serverOffset = socket.handshake.auth.serverOffset || null;
  
          const query = serverOffset ? { _id: { $gt: serverOffset } } : {};
          const messages = await Message.find(query).lean(); 
  
          messages.forEach((message) => {
            socket.emit('chat message', message, message._id); 
          });
  
          socket.recovered = true; 
        } catch (err) {
          console.error('Error retrieving messages:', err);
        }
    }
    //listing the users
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      users.push({
        userID: socket.decoded._id,
        name: socket.decoded.name,
      });
    }
    socket.emit("users", users);
  });
}

module.exports = handleSocket;