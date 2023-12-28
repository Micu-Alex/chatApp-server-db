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
  
    //select user
    socket.on("selectedUser", async (selectedUser) => {

      try {
        const conversation = await Conversation.findOne({
          participants: { $all: [senderID, selectedUser] }
        }).populate('messages');

        socket.join(senderID)
        if (conversation) {
          const roomID = conversation._id.toString()
          socket.join(roomID)
          console.log("room", socket.rooms);

          const messages = new Set(conversation.messages)

        messages.forEach((message) => {
          io.to(senderID).emit('chat message', {
            sender: { username: message.sender.username },
            message: message.message
          });
        });
        }
      } catch (err) {
        console.error('Error retrieving messages:', err);
      }
    })
    

    //send message
    socket.on('chat message', async (data) => {
      const { msg, toUserID: selectedUser } = data;
       // Find or create a conversation between sender and receiver
      
      try {
        let conversation = await Conversation.findOne({
          participants: { $all: [senderID, selectedUser] }
       });
      
        if (!conversation) {
          conversation = new Conversation({
          participants: [senderID, selectedUser],
          messages: []
        });
      }      
        const sender = await User.findById(senderID)
        const receiver = await User.findById(selectedUser);

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
        const roomID = conversation._id.toString()
        socket.join(roomID)
      
      
        io.to(roomID).emit('chat message', { 
          sender: {username: sender.name },
            message: msg,
        });
      }
       catch (err) {
        console.error('Error sending message:', err);
      }
      });


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