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
   
    
    socket.on("selectedUser", async (selectedUser) => {
      socket.join(senderID);

      try {

        const serverOffset = socket.handshake.auth.serverOffset || null;
        console.log("server offset on selecting user:",socket.handshake.auth);


        const conversation = await Conversation.findOne({
          participants: { $all: [senderID, selectedUser] }
        }).populate('messages');

        if (conversation) {
          const messages = conversation.messages.filter(message => (
            serverOffset ? message._id > serverOffset : true), 
            )

        messages.forEach((message) => {
          io.to(senderID).emit('chat message', {
            sender: { username: message.sender.username },
            message: message.message
          }, message._id);
        });
        }
      } catch (err) {
        console.error('Error retrieving messages:', err);
      }
    })
    
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

      
        io.to(toUserID).to(senderID).emit('chat message', { 
          sender: {username: sender.name },
            message: msg,
        },message._id);
        console.log(socket.handshake.auth);
      }
       catch (err) {
        console.error('Error sending message:', err);
      }
      });

     // Emit previous messages upon a new connection
      if (!socket.recovered) {
          const serverOffset = socket.handshake.auth.serverOffset || null;
          console.log("server offset on socket recovered",serverOffset);
    }

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