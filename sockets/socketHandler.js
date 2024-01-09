const { Server } = require("socket.io");
const { Message } = require("../models/message");
const { User } = require("../models/user");
const { Conversation } = require("../models/conversation")
const auth = require("../middleware/auth");

function handleSocket(server) {
  const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
      origin: "http://localhost:5173"
    }
  });
 

  io.use((socket, next) => {
    auth(socket, next);
  });


  io.on('connection', async (socket) => {
    const curentUserID = socket.decoded._id;
    let alreadySelectedUser = null
    let currentConversationRoom = null;
    
    //select user
    socket.on("selectedUser", async (selectedUser) => {
      
      if (alreadySelectedUser === selectedUser) return
     

      try {
        if (currentConversationRoom) {
          socket.leave(currentConversationRoom);
        }

        const conversation = await Conversation.findOne({
          participants: { $all: [curentUserID, selectedUser] }
        }).populate('messages');
        socket.join(curentUserID)
        if (conversation) {
          const roomID = conversation._id.toString()
          socket.join(roomID)          
          currentConversationRoom = roomID;
          const messages = conversation.messages

          messages.forEach((message) => {
            io.to(curentUserID).emit('chat message', {
              sender: { username: message.sender.username },
              message: message.message,
              isSeen: message.isSeen
            });
          });
          alreadySelectedUser = selectedUser
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
          participants: { $all: [curentUserID, selectedUser] }
       });
      
        if (!conversation) {
          conversation = new Conversation({
          participants: [curentUserID, selectedUser],
          messages: []
        });
      }      
        const sender = await User.findById(curentUserID)
        const receiver = await User.findById(selectedUser);

        if (!sender || !receiver) {
          console.error('Sender or receiver not found');
          return;
        }
        
      
        const message = new Message({
          message: msg, 
          sender: {username: sender.name},
          receiver: { username: receiver.name},
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

    //listing online users
    const onlineUsers = [];
    for (let [id, socket] of io.of("/").sockets) {
        onlineUsers.push({
            userID: socket.decoded._id,
            name: socket.decoded.name,
        });
    }
    io.emit("userOnline", onlineUsers);

    // Additional event listener for handling user disconnection
    socket.on('disconnect', async () => {
        const updatedOnlineUsers = [];
        for (let [id, socket] of io.of("/").sockets) {
            updatedOnlineUsers.push({
                userID: socket.decoded._id,
                name: socket.decoded.name,
            });
        }
        io.emit("userOnline", updatedOnlineUsers);
    });
      
    //listing the users
    let allUsers = await User.find({}, { _id: 1, name: 1 })
    allUsers = allUsers.map(user => {
      const { _id, name  } = user; 
      return { userID: _id, name  }; 
  });
    socket.emit("AllUsers",  allUsers, curentUserID,);
  
  }  ) 
}

module.exports = handleSocket;