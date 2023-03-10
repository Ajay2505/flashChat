require("dotenv").config();

const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const { 
    createRoom, 
    joinRoom,
    genMessage, 
    getUser,
    removeFromRoom } = require("./queries/user");

const {
    setOwner,
    getOwner,
    sendRoomMembers,
    removeOwner,
} = require("./queries/owner");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Connected");
    
    socket.on("createRoom", async ({ name, room } , callback) => {
        const filter = new Filter();

        if (filter.isProfane(name) || filter.isProfane(room)) {
            return callback("Bad words are not allowed");
        }
        
        const {err, docs} = await createRoom({ name, room, socketID: socket.id });
        
        if (err) {
           return callback(err);
        }

        const { error } = await setOwner({ room: docs.room, name: docs.name, socketID: socket.id });

        if (error) {
          return callback("Something went wrong, please try again!");
        }

        socket.join(docs.room);
        callback(undefined, { name: docs.name, room: docs.room });
    });

    socket.on("joinRoom", async ({ name, room }, callback) => {
        const filter = new Filter();

        if (filter.isProfane(name)) {
            return callback("Bad words are not allowed");
        }

        const { err, docs } = await joinRoom({ name, room, socketID: socket.id });
        if (err) {
            return callback(err);
        }

        callback(undefined, { room: docs.room, name: docs.name });
        socket.join(docs.room);
        socket.to(docs.room).emit("updates", genMessage(`${docs.name} has joined`));
        
        const { owner } = await getOwner({ room: docs.room });

        await sendRoomMembers({ room: docs.room, owner: owner.name, io });
    });

    socket.on("sendMessage", async ({ msg }, callback) => {
        const user = await getUser({ socketID: socket.id });
        if (!user) {
            return callback("Please join in a room" );
        }

        const filter = new Filter();

        if (filter.isProfane(msg)) {
            return callback("Bad words are not allowed");
        }

        io.to(user.room).emit("message", genMessage( msg, user.name ));
    });

    socket.on("sendLocation", async ({ latitude, longitude }, callback) => {
        const user = await getUser({ socketID: socket.id });

        if (!user) {
           return callback("Please join in a room!");
        }

        io.to(user.room).emit("locationMessage", 
            genMessage(`https://google.com/maps?q=${latitude},${longitude}`, user.name));
        callback(undefined);
    });

    socket.on("kickOut", async ({ userName }, callback) => {
        try {
            const { owner } = await getOwner({ socketID: socket.id });

            if (!owner) {
                return;
            }
            
            const user = await getUser({ name: userName, room: owner.room });
            if (!user) {
                return callback("Something went wrong!");
            }

            await removeFromRoom(user);
            
            io.to(user.room).emit("updates",  genMessage(`${user.name} has been removed!`));

            const userSockets = await io.in(user.socketID).fetchSockets();
            const userSocket = userSockets.find((socket) => socket.id.toString() === user.socketID);
            userSocket.leave(user.room);

            await sendRoomMembers({ room: user.room, owner: owner.name, io });

        } catch (error) {
            callback("Something went wrong!");
        }
    });

    socket.on("makeLeader", async ({ userName }, callback) => {
        try {
            const { owner } = await getOwner({ socketID: socket.id });
            const user = await getUser({ name: userName, room: owner.room });
            
            if (!user) {
               return callback("Something went wrong!");
            }

            await setOwner(user);

            io.to(user.room).emit("updates",  genMessage(`${user.name} is now Admin!`));

            await sendRoomMembers({ room: user.room, owner: user.name, io });
        } catch (error) {
            callback("Something went wrong!");
        }
    });

    socket.on("leaveRoom", async () => {
        try {
            const user = await getUser({ socketID: socket.id });
            if (!user) {
                return;
            }
            await removeFromRoom(user);

            socket.to(user.room).emit("updates", genMessage(`${user.name} has left!`));
            socket.leave(user.room);

            const { owner } = await getOwner({ room: user.room });

            if (owner?.socketID === socket.id) {
                await removeOwner({ socketID: socket.id });
                return await sendRoomMembers({ room: user.room, io, owner: null });
            }

            await sendRoomMembers({ room: user.room, io, owner: owner.name });
            } catch (e) {
            console.log(e);
        }

    });

    socket.on("disconnect", async () => {
        try {
            const user = await getUser({ socketID: socket.id});
            if (!user) {
                return;
            }
            
            await removeFromRoom(user);

            io.to(user.room).emit("updates", genMessage(`${user.name} has left!`));

            const { owner } = await getOwner({ room: user.room });

            if (owner?.socketID === socket.id) {
                await removeOwner({ socketID: socket.id });
                return await sendRoomMembers({ room: user.room, io, owner: null });
            }

            await sendRoomMembers({ room: user.room, io, owner: owner.name });

        } catch (error) {
            console.log(error);
        }
    });

});



app.get("/", (req, res) => {
    res.sendFile("/public/index.html");
});

server.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});