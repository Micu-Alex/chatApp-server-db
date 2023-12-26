const { Server } = require("socket.io");
const { Message } = require("../models/message");
const { User } = require("../models/user");
const { Conversation } = require("../models/conversation")
const auth = require("../middleware/auth");

function handleSocket(server) {
  const io = new Server(server, {
    connectionStateRecovery: {}
  });

  io.use((socket, next) => {
    auth(socket, next);
  });


  io.on('connection', async (socket) => {
    const senderID = socket.decoded._id;

    socket.join(senderID);
    socket.on('chat message', async (data) => {
      const { msg, toUserID } = data;

       // Find or create a conversation between sender and receiver
      let conversation = await Conversation.findOne({
        participants: { $all: [senderID, toUserID] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderID, toUserID],
          messages: []
        });
      }


      try {
        const sender = await User.findById(senderID)
        const receiver = await User.findById(toUserID);
       
        if (!sender || !receiver) {
          console.error('Sender or receiver not found');
          return;
        }


        const message = new Message({
          message: msg, 
          sender: {username: sender.name},
          receiver: { username: receiver.name}
        })
      
        const savedMessage = await message.save();
        // Add the message to the conversation
        conversation.messages.push(savedMessage._id);
        await conversation.save();
      
        io.to(toUserID).to(senderID).emit('chat message', { sender: {
           username: sender.name },
            message: msg 
        });
      }
       catch (err) {
        console.error('Error sending message:', err);
      }
      });
  
  
    //   remake this part to support private messageing 
    //     Emit previous messages upon a new connection
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
    socket.emit("users", users, senderID);
  }); 
}

module.exports = handleSocket;