const { Server } = require("socket.io");
const { Message } = require("../models/message");
const { User } = require("../models/user");
const { Conversation } = require("../models/conversation")
const auth = require("../middleware/auth");
const { Notification } = require("../models/notification");

function handleSocket(server) {
  const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
      origin: "https://chat-application-delta-indol.vercel.app"
    }
  });
 

  io.use((socket, next) => {
    auth(socket, next);
  });


  io.on('connection', async (socket) => {
    const curentUserID = socket.decoded._id;
    let alreadySelectedUser = null
    let currentConversationRoom = null;
    
    socket.join(curentUserID)

    // seend unseen notifications
    const notifications = await Notification.find({
      receiverID: curentUserID
    })
    notifications.forEach((noti) => { 
      io.to(curentUserID).emit("notification", noti.senderID)
    })


    //select user
    socket.on("selectedUser", async (selectedUser) => {
      if (alreadySelectedUser === selectedUser) return
     
      //delete seen notifications
      await Notification.deleteMany({
      senderID: selectedUser
      })


      

      try {
        if (currentConversationRoom) {
          socket.leave(currentConversationRoom);
        }

        const conversation = await Conversation.findOne({
          participants: { $all: [curentUserID, selectedUser] }
        }).populate('messages');
        if (conversation) {
          const roomID = conversation._id.toString()
          socket.join(roomID)          
          currentConversationRoom = roomID;
          const messages = conversation.messages

      
          messages.forEach((message) => {
            io.to(curentUserID).emit('chat message', {
              sender: { username: message.sender.username, senderID: message.sender.senderID },
              message: message.message,
              file: {
                data: message.file.data, 
                contentType: message.file.contentType,
                fileName: message.file.fileName,
              },
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
      const { msg, toUserID: selectedUser, type, body, mimeType, fileName } = data;


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
        //save new notification
        await new Notification({
          receiverID: receiver.id, 
          senderID: sender.id
        }).save()


        //emmit new notification to the user
        io.to(receiver.id).emit("notification", sender.id)
       
      //create and save message
      if (type === 'file') {
        // Handle file message
        const base64Data = Buffer.from(body).toString('base64');
        const message = new Message({
          file: {
            data: base64Data, 
            contentType: mimeType,
            fileName: fileName,
          },
          sender: { username: sender.name,  senderID: sender.id },
          receiver: { username: receiver.name,  receiverID: receiver.id },
        });
        const savedMessage = await message.save();
        // Add the file message to the conversation

        conversation.messages.push(savedMessage._id);
        await conversation.save();

        const roomID = conversation._id.toString();
        socket.join(roomID);

      
        io.to(roomID).emit('chat message', {
          sender: { username: sender.name, senderID: sender.id },
          file: {
            data: base64Data,
            contentType: mimeType,
            fileName: fileName,
          },
        });
      } else {
        // Handle text message
        const message = new Message({
          message: msg,
          sender: { username: sender.name, senderID: sender.id  },
          receiver: { username: receiver.name, receiverID: receiver.id  },
        });
        const savedMessage = await message.save();
        // Add the text message to the conversation
        conversation.messages.push(savedMessage._id);
        
            await conversation.save();
        
            const roomID = conversation._id.toString();
            socket.join(roomID);
        
            io.to(roomID).emit('chat message', {
              sender: { username: sender.name,  senderID: sender.id },
              message: msg,
            });
      }
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
  
    socket.on("user typing", data => {
      const {Typing, selectedUser} = data
      if (Typing) {
        socket.to(selectedUser).emit("user typing", curentUserID)
      } else {
        socket.to(selectedUser).emit("user typing", "")
      }
    })

  }) 
}

module.exports = handleSocket;