const path=require('path');
const http=require('http');
const Filter=require('bad-words');
const express=require('express');
const socketio=require('socket.io');
const {generateMessage}=require('./utils/message');
const {generateLocationMessage}=require('./utils/message');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const publicDirectory=path.join(__dirname,'../public');
const port=process.env.PORT || 3000;

app.use(express.static(publicDirectory));

io.on('connection',(socket)=>{
    

    socket.on('join',({username,room},callback)=>{

        const user=addUser({id:socket.id,username,room});

        if(user.error){
            return callback(user.error)
        }
        socket.join(user.room);

        socket.emit("Welcome", generateMessage("Welcome to server",'Admin'));
        socket.broadcast.to(room).emit("Welcome", generateMessage(`${user.username} has joined`,user.username));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
        });

        callback();

    });

    socket.on("sendMessage",(message,callback)=>{
        var filter=new Filter();
        if(filter.isProfane(message))
            return callback("Profanity is not allowed");
        const user=getUser(socket.id);
        io.to(user.room).emit("Welcome",generateMessage(message,user.username));
        callback();
    });

    socket.on('sendLocation',(geo,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit("locationMessage",generateLocationMessage(geo,user.username));
        callback();
    });

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        console.log(user);
        if(user){
            io.to(user.room).emit("Welcome", generateMessage(`${user.username} has exited`,'Admin'));
        
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
    })

});

server.listen(port,()=>{
    console.log("Server is  up and running");
})