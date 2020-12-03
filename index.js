const express = require('express');

// Node server which will handle socket io connections


const app = express();

app.use(express.static('public'))

const server = app.listen(4000, ()=>{
    console.log("main server up at :4000");
})

const io = require('socket.io')(server);

const users = {};

io.on('connection', socket =>{
    console.log("new connnection")
    // If any new user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{ 
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    // If someone sends a message, broadcast it to other people
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    // If someone leaves the chat, let others know 
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });


})