const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../')));

let users = {}; // Track users by socket ID

io.on('connection', (socket) => {
    
    // Handle new user
    socket.on('new user', (username) => {
        console.log('A user connected',username);
        users[socket.id] = username; // Store username for this socket ID
        socket.broadcast.emit('user connected', username); // Notify other users
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonymous';
        socket.broadcast.emit('chat message', { username, message: msg }); // Broadcast message to all users except the sender
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
