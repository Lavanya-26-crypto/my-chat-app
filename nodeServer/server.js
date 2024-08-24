const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors'); // Import the cors package
const bodyParser = require('body-parser'); // Import body-parser

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Replace this with your latest deployment URL
const CLIENT_URL = 'https://chat-application-ecgyzxb9y-lavanyas-projects-24a9e043.vercel.app';

// Configure CORS
app.use(cors({
  origin: CLIENT_URL, // Set CORS origin to the latest URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

let users = {}; // Track users by socket ID
let chatHistory = []; // Example chat history

// Handle API requests
app.get('/api/messages', (req, res) => {
  // Return the chat history
  res.json(chatHistory);
});

app.post('/api/messages', (req, res) => {
  // Add a new message to the chat history
  const { username, message } = req.body;
  if (username && message) {
    const chatMessage = { username, message };
    chatHistory.push(chatMessage);
    io.emit('chat message', chatMessage); // Broadcast message to all users
    res.status(201).json(chatMessage);
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
});

io.on('connection', (socket) => {
    
    // Handle new user
    socket.on('new user', (username) => {
        console.log('A user connected', username);
        users[socket.id] = username; // Store username for this socket ID
        socket.broadcast.emit('user connected', username); // Notify other users
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonymous';
        const chatMessage = { username, message: msg };
        chatHistory.push(chatMessage); // Store message in chat history
        socket.broadcast.emit('chat message', chatMessage); // Broadcast message to all users except the sender
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            io.emit('user disconnected', username); // Notify all users
            delete users[socket.id]; // Remove user from tracking
        }
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
