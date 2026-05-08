const socket = io();

let currentReceiver = null;
let myUsername = '';

function joinChat() {
  const username = document.getElementById('username').value.trim();
  if (username) socket.emit('join', username);
  else alert("Vui lòng nhập tên!");
}

socket.on('joinSuccess', (username) => {
  myUsername = username;
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('chatScreen').classList.remove('hidden');
  document.getElementById('myUsername').textContent = username;
});

socket.on('onlineUsers', (users) => {
  const list = document.getElementById('usersList');
  list.innerHTML = '';
  const otherUsers = users.filter(user => user && user !== myUsername);
  document.getElementById('onlineCount').textContent = otherUsers.length;

  otherUsers.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="user-item">
            <div class="avatar">${user.charAt(0).toUpperCase()}</div>
            <span>${user}</span>
        </div>
    `;
    li.onclick = () => selectUser(user, li);
    list.appendChild(li);
  });
});

function selectUser(user, element) {
  currentReceiver = user;
  document.getElementById('chatHeader').innerHTML = `<strong>Đang chat với: ${user}</strong>`;
  document.querySelectorAll('#usersList li').forEach(li => li.classList.remove('active'));
  element.classList.add('active');
  document.getElementById('messages').innerHTML = '';
  socket.emit('loadHistory', user);
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  if (!message || !currentReceiver) return;
  socket.emit('privateMessage', { receiver: currentReceiver, message });
  input.value = '';
}

socket.on('receiveMessage', appendMessage);

socket.on('chatHistory', ({ receiver, messages }) => {
  if (receiver !== currentReceiver) return;
  const div = document.getElementById('messages');
  div.innerHTML = '';
  messages.forEach(appendMessage);
});

function appendMessage(data) {
  const div = document.getElementById('messages');
  const msgDiv = document.createElement('div');
  const isSent = data.sender === myUsername;

  msgDiv.className = `message ${isSent ? 'sent' : 'received'}`;
  msgDiv.id = `msg-${data.id}`;

  const contentHTML =
    data.type === 'image'
      ? `<img src="${data.imageUrl}" class="chat-image" onclick="openImageModal('${data.imageUrl}')">`
      : `<span class="${data.recalled ? 'recalled-text' : ''}">${data.message}</span>`;

  msgDiv.innerHTML = `
    <div class="options-container">
      ${isSent && !data.recalled ? `
        <div class="options-trigger" onclick="toggleMenu(event, ${data.id})">⋯</div>
        <div class="options-menu" id="menu-${data.id}">
          <button class="recall-btn-new" onclick="recallMessage(${data.id}, '${data.receiver}')">
            Thu hồi
          </button>
        </div>
      ` : ''}
    </div>

    <div class="content">
      ${contentHTML}
    </div>

    <div class="time">${data.time}</div>
  `;

  div.appendChild(msgDiv);
  div.scrollTop = div.scrollHeight;
}

socket.on('messageRecalled', (msg) => {
  const messageDiv = document.getElementById(`msg-${msg.id}`);
  if (!messageDiv) return;

  const content = messageDiv.querySelector('.content');

  content.innerHTML = `<span class="recalled-text"> ${msg.message}</span>`;

  const optionsContainer = messageDiv.querySelector('.options-container');
  if (optionsContainer) optionsContainer.remove();
});

function toggleMenu(event, id) {
  event.stopPropagation();
  const targetMenu = document.getElementById(`menu-${id}`);
  document.querySelectorAll('.options-menu').forEach(menu => {
    if (menu !== targetMenu) menu.classList.remove('show');
  });
  if (targetMenu) targetMenu.classList.toggle('show');
}

document.addEventListener('click', () => {
  document.querySelectorAll('.options-menu').forEach(menu => menu.classList.remove('show'));
});

function recallMessage(messageId, receiver) {
  socket.emit('recallMessage', { messageId, receiver });
}

function logout() { location.reload(); }

function addEmoji(emoji) {
  const input = document.getElementById('messageInput');
  input.value += emoji;
  input.focus();
}

function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }

document.getElementById('messageInput').addEventListener('input', () => {
  if (currentReceiver) socket.emit('typing', currentReceiver);
});

socket.on('showTyping', (username) => {
  const typing = document.getElementById('typingStatus');
  typing.textContent = `${username} đang nhập...`;
  setTimeout(() => { typing.textContent = ''; }, 1500);
});

document.getElementById('searchUser').addEventListener('input', function() {
  const keyword = this.value.toLowerCase();
  document.querySelectorAll('#usersList li').forEach(li => {
    li.style.display = li.innerText.toLowerCase().includes(keyword) ? 'flex' : 'none';
  });
});
document.getElementById('imageInput').addEventListener('change', function () {
  const files = Array.from(this.files);
  if (!files.length || !currentReceiver) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('sendImage', {
        receiver: currentReceiver,
        image: reader.result
      });
    };
    reader.readAsDataURL(file);
  });

  this.value = '';
});