const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const onlineUsers = new Map();
const chatHistory = new Map();

function getChatKey(user1, user2) {
  return [user1, user2].sort().join('_');
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('typing', (receiver) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if(receiverSocketId){
        io.to(receiverSocketId)
        .emit('showTyping', socket.username);
    }
  });
  socket.on('join', (username) => {
    if (!username || username.trim() === '') {
      socket.emit('error', 'Tên không hợp lệ');
      return;
    }

    const cleanUsername = username.trim();

    for (let [name] of onlineUsers) {
      if (name.toLowerCase() === cleanUsername.toLowerCase()) {
        socket.emit('error', 'Tên này đã có người sử dụng');
        return;
      }
    }

    onlineUsers.set(cleanUsername, socket.id);
    socket.username = cleanUsername;

    console.log(`${cleanUsername} đã tham gia. Online: ${onlineUsers.size}`);

    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    socket.emit('joinSuccess', cleanUsername);
  });

  socket.on('loadHistory', (receiver) => {
    if (!socket.username || !receiver) return;
    const chatKey = getChatKey(socket.username, receiver);
    const history = chatHistory.get(chatKey) || [];
    socket.emit('chatHistory', { receiver, messages: history });
  });

  socket.on('privateMessage', ({ receiver, message }) => {
    if (!socket.username || !receiver || !message?.trim()) return;
    const cleanReceiver = receiver.trim();
    if (cleanReceiver === socket.username) return;

    const receiverSocketId = onlineUsers.get(cleanReceiver);
    const messageId = Date.now() + Math.random();
    const msgData = {
        id: messageId,
        sender: socket.username,
        receiver: cleanReceiver,
        message: message.trim(),
        time: new Date().toLocaleTimeString('vi-VN')
    };
    const chatKey = getChatKey(socket.username, cleanReceiver);
    if (!chatHistory.has(chatKey)) chatHistory.set(chatKey, []);
    chatHistory.get(chatKey).push(msgData);

    if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', msgData);
    socket.emit('receiveMessage', msgData);
  });
  socket.on('sendImage', ({ receiver, image }) => {
  if (!socket.username || !receiver || !image) return;

  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return;

  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = path.join(__dirname, 'uploads', fileName);

  require('fs').writeFileSync(filePath, buffer);
  const messageId = Date.now() + Math.random();
  const msgData = {
    id: messageId,
    sender: socket.username,
    receiver,
    type: 'image',
    imageUrl: `/uploads/${fileName}`,
    time: new Date().toLocaleTimeString('vi-VN')
  };

  const chatKey = getChatKey(socket.username, receiver);
  if (!chatHistory.has(chatKey)) chatHistory.set(chatKey, []);
  chatHistory.get(chatKey).push(msgData);

  const receiverSocketId = onlineUsers.get(receiver);
  if (receiverSocketId) io.to(receiverSocketId).emit('receiveMessage', msgData);
  socket.emit('receiveMessage', msgData);
});
  socket.on('recallMessage', ({ messageId, receiver }) => {
  const chatKey = getChatKey(socket.username, receiver);
  const history = chatHistory.get(chatKey);
  if (!history) return;
  const msg = history.find(m => m.id === messageId);
  if (!msg || msg.sender !== socket.username) return;
  if (msg.type === 'image') {
    if (msg.imageUrl) {
      const fs = require('fs');
      const filePath = path.join(__dirname, msg.imageUrl);
      fs.unlink(filePath, () => {});
    }
    delete msg.imageUrl;
    msg.type = 'text';
    msg.message = 'Ảnh đã được thu hồi';
  } else {
    msg.message = 'Tin nhắn đã được thu hồi';
  }

  msg.recalled = true;

  const receiverSocketId = onlineUsers.get(receiver);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('messageRecalled', msg);
  }
  socket.emit('messageRecalled', msg);
});
  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});