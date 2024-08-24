const socket = io('https://my-chat-app-seven-iota.vercel.app');

// Get references to the form, input field, and messages list
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const chatContainer = document.getElementById('chat-container');
const usernameContainer = document.getElementById('username-container');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const notificationSound = document.getElementById('notification-sound');

// Prompt for username and start chat
usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit('new user', username); // Notify server of new user
        usernameContainer.style.display = 'none'; // Hide username form
        chatContainer.style.display = 'block'; // Show chat container
    }
});

// Function to add a new message to the chat
function addMessage(username, msg, type) {
    const item = document.createElement('li');
    item.textContent = `${username}: ${msg}`;
    item.classList.add(type);
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Scroll to the bottom of the messages
}

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (msg) {
        socket.emit('chat message', msg); // Send the message to the server
        addMessage('You', msg, 'my-message'); // Add the message to the chat as 'my-message'
        input.value = ''; // Clear the input field
    }
});

// Listen for 'chat message' events from the server
socket.on('chat message', (data) => {
    console.log('Received chat message:', data); // Debug log
    addMessage(data.username, data.message, 'other-message');
    notificationSound.play(); // Play notification sound
});

// Listen for 'user connected' events
socket.on('user connected', (username) => {
    addMessage('System', `${username} has joined the chat`, 'system-message');
});

// Listen for 'user disconnected' events
socket.on('user disconnected', (username) => {
    addMessage('System', `${username} has left the chat`, 'system-message');
});
