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

    socket.join(socket.decoded._id);
    socket.on('chat message', async (data) => {
      const { msg, toUserID } = data;
  
      const sender = await User.findOne({ name: name })
      const receiver = await User.findById(toUserID);
      if (!sender || !receiver) {
        console.error('Sender or receiver not found');
        return;
      }
      const message = new Message({
        message: msg, 
        user: {username: sender.name},
        toUser: { username: receiver.name}
      })
  
  
      try {
        result = await message.save();
        io.to(toUserID).to(socket.decoded._id).emit('chat message', { user: { username: sender.name }, message: msg });
      } catch (err) {
        console.error('Error saving message:', err);
      }
      });
  
  
      //remake this part to support private messageing 
        // Emit previous messages upon a new connection
    //   if (!socket.recovered) {
    //     try {
    //       const serverOffset = socket.handshake.auth.serverOffset || null;
  
    //       const query = serverOffset ? { _id: { $gt: serverOffset } } : {};
    //       const messages = await Message.find(query).lean(); 
  
    //       messages.forEach((message) => {
    //         socket.emit('chat message', message, message._id); 
    //       });
  
    //       socket.recovered = true; 
    //     } catch (err) {
    //       console.error('Error retrieving messages:', err);
    //     }
    // }


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